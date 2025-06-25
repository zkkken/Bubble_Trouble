import express from 'express';
import { createServer, getContext, getServerPort } from '@devvit/server';
import { InitResponse, GameDataResponse, UpdateGameResponse, ResetGameResponse } from '../shared/types/game';
import { LeaderboardResponse, SubmitScoreResponse } from '../shared/types/leaderboard';
import { postConfigGet, postConfigNew, postConfigMaybeGet, handleButtonPress, resetGame, processGameUpdate } from './core/post';
import { submitScore, getLeaderboard, getPlayerBest, debugLeaderboard } from './core/leaderboard';
import { getRedis } from '@devvit/redis';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());

const router = express.Router();

// 现有的游戏API路由
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

// 复合分数排行榜API路由
router.post('/api/submit-score', async (req, res): Promise<void> => {
  try {
    console.log('Submit score API called with body:', req.body);
    
    const { playerId, playerName, roundsCompleted, totalTime, difficulty, countryCode } = req.body;
    const redis = getRedis();

    // 验证必需参数
    if (!playerId || !playerName || typeof roundsCompleted !== 'number' || typeof totalTime !== 'number' || !countryCode) {
      const errorMsg = 'playerId, playerName, roundsCompleted, totalTime, and countryCode are required';
      console.error('Submit score validation error:', errorMsg);
      res.status(400).json({ 
        status: 'error', 
        message: errorMsg
      });
      return;
    }

    // 验证国家代码格式 (应该是2位字母)
    if (!/^[A-Z]{2}$/i.test(countryCode)) {
      const errorMsg = 'countryCode must be a valid 2-letter ISO country code';
      console.error('Invalid country code:', countryCode);
      res.status(400).json({ 
        status: 'error', 
        message: errorMsg
      });
      return;
    }

    console.log(`Processing composite score submission: ${playerName} (${playerId}), rounds: ${roundsCompleted}, time: ${totalTime}, difficulty: ${difficulty}, country: ${countryCode}`);

    const result = await submitScore({
      redis,
      playerId,
      playerName,
      roundsCompleted,
      totalTime,
      difficulty: difficulty || 'medium',
      countryCode: countryCode.toUpperCase()
    });

    console.log('Composite score submission result:', result);

    const response: SubmitScoreResponse = {
      status: 'success',
      data: result
    };

    res.json(response);
  } catch (error) {
    console.error('API Submit Score Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    const response: SubmitScoreResponse = {
      status: 'error',
      message
    };
    res.status(500).json(response);
  }
});

router.get('/api/leaderboard', async (req, res): Promise<void> => {
  try {
    console.log('Leaderboard API called with query:', req.query);
    
    const limit = parseInt(req.query.limit as string) || 50;
    const countryCode = req.query.countryCode as string;
    const redis = getRedis();

    console.log(`Getting leaderboard with limit: ${limit}, countryCode: ${countryCode || 'global'}`);

    // 验证国家代码格式（如果提供）
    if (countryCode && !/^[A-Z]{2}$/i.test(countryCode)) {
      res.status(400).json({ 
        status: 'error', 
        message: 'countryCode must be a valid 2-letter ISO country code' 
      });
      return;
    }

    // 调试：打印 Redis 中的数据
    await debugLeaderboard(redis);

    const leaderboardData = await getLeaderboard({ 
      redis, 
      limit, 
      countryCode: countryCode?.toUpperCase() 
    });

    console.log('Composite score leaderboard data retrieved:', leaderboardData);

    const response: LeaderboardResponse = {
      status: 'success',
      data: leaderboardData
    };

    res.json(response);
  } catch (error) {
    console.error('API Leaderboard Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    const response: LeaderboardResponse = {
      status: 'error',
      message
    };
    res.status(500).json(response);
  }
});

router.get('/api/player-best', async (req, res): Promise<void> => {
  try {
    console.log('Player best API called with query:', req.query);
    
    const playerId = req.query.playerId as string;
    const redis = getRedis();

    if (!playerId) {
      res.status(400).json({ 
        status: 'error', 
        message: 'playerId is required' 
      });
      return;
    }

    console.log(`Getting best score for player: ${playerId}`);

    const playerBest = await getPlayerBest({ redis, playerId });

    console.log('Player best score retrieved:', playerBest);

    res.json({
      status: 'success',
      data: playerBest
    });
  } catch (error) {
    console.error('API Player Best Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ status: 'error', message });
  }
});

// 调试路由
router.get('/api/debug-leaderboard', async (_req, res): Promise<void> => {
  try {
    const redis = getRedis();
    await debugLeaderboard(redis);
    res.json({ status: 'success', message: 'Composite score debug info printed to console' });
  } catch (error) {
    console.error('Debug API Error:', error);
    res.status(500).json({ status: 'error', message: 'Debug failed' });
  }
});

const port = getServerPort();
const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(port, () => console.log(`http://localhost:${port}`));