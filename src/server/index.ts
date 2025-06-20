import express from 'express';
import { createServer, getContext, getServerPort } from '@devvit/server';
import { InitResponse, GameDataResponse, UpdateGameResponse, ResetGameResponse } from '../shared/types/game';
import { postConfigGet, postConfigNew, postConfigMaybeGet, handleButtonPress, resetGame, processGameUpdate } from './core/post';
import { getRedis } from '@devvit/redis';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());

const router = express.Router();

router.get('/api/init', async (_req, res): Promise<void> => {
  try {
    const { postId } = getContext();
    const redis = getRedis();

    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required but missing from context',
      });
      return;
    }

    let config = await postConfigMaybeGet({ redis, postId });
    if (!config) {
      await postConfigNew({ redis, postId });
    }

    res.json({
      status: 'success',
      postId: postId,
    });
  } catch (error) {
    console.error('API Init Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error during initialization';
    res.status(500).json({ status: 'error', message });
  }
});

router.get('/api/game-data', async (_req, res): Promise<void> => {
  try {
    const { postId } = getContext();
    const redis = getRedis();

    if (!postId) {
      res.status(400).json({ status: 'error', message: 'postId is required' });
      return;
    }

    const config = await postConfigGet({ redis, postId });
    
    res.json({
      status: 'success',
      gameState: config.gameState,
      currentRound: config.currentRound,
    });
  } catch (error) {
    console.error('API Game Data Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ status: 'error', message });
  }
});

router.post('/api/update-game', async (req, res): Promise<void> => {
  try {
    const { deltaTime } = req.body;
    const { postId } = getContext();
    const redis = getRedis();

    if (!postId) {
      res.status(400).json({ status: 'error', message: 'postId is required' });
      return;
    }

    if (typeof deltaTime !== 'number') {
      res.status(400).json({ status: 'error', message: 'deltaTime is required' });
      return;
    }

    const updatedGameState = await processGameUpdate({ redis, postId, deltaTime });
    
    res.json({
      status: 'success',
      gameState: updatedGameState,
    });
  } catch (error) {
    console.error('API Update Game Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ status: 'error', message });
  }
});

router.post('/api/button-press', async (req, res): Promise<void> => {
  try {
    const { buttonType, isPressed } = req.body;
    const { postId } = getContext();
    const redis = getRedis();

    if (!postId) {
      res.status(400).json({ status: 'error', message: 'postId is required' });
      return;
    }

    if (!buttonType || typeof isPressed !== 'boolean') {
      res.status(400).json({ status: 'error', message: 'buttonType and isPressed are required' });
      return;
    }

    const gameState = await handleButtonPress({ redis, postId, buttonType, isPressed });
    
    res.json({
      status: 'success',
      gameState,
    });
  } catch (error) {
    console.error('API Button Press Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ status: 'error', message });
  }
});

router.post('/api/reset-game', async (req, res): Promise<void> => {
  try {
    const { newRound } = req.body;
    const { postId } = getContext();
    const redis = getRedis();

    if (!postId) {
      res.status(400).json({ status: 'error', message: 'postId is required' });
      return;
    }

    const result = await resetGame({ redis, postId, newRound });
    
    res.json({
      status: 'success',
      gameState: result.gameState,
      currentRound: result.currentRound,
    });
  } catch (error) {
    console.error('API Reset Game Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ status: 'error', message });
  }
});

app.use(router);

const port = getServerPort();
const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(port, () => console.log(`http://localhost:${port}`));