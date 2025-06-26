import express from 'express';
import { createServer, getContext, getServerPort } from '@devvit/server';
import { InitResponse, GameDataResponse, UpdateGameResponse, ResetGameResponse } from '../shared/types/game';
import { postConfigGet, postConfigNew, postConfigMaybeGet, handleButtonPress, resetGame, processGameUpdate } from './core/post';
import { 
  submitScore, 
  getLeaderboard, 
  getPlayerBest, 
  debugLeaderboard,
  PlayerScore,
  LeaderboardData 
} from './core/leaderboard';
import { getRedis } from '@devvit/redis';

const app = express();

// 确保开启 JSON 解析
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());

const router = express.Router();

// ==================== 现有的游戏API路由 ====================

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

// ==================== 全局排行榜API路由 ====================

/**
 * 提交分数到全局排行榜
 * Submit score to global leaderboard
 * POST /api/submit-score
 */
router.post('/api/submit-score', async (req, res): Promise<void> => {
  try {
    console.log('Submit score API called with body:', req.body);
    
    const playerScore: PlayerScore = req.body;
    const redis = getRedis();

    // 验证必需字段
    if (!playerScore.playerId || !playerScore.playerName || typeof playerScore.completionTime !== 'number') {
      const errorMsg = 'Missing required fields: playerId, playerName, or completionTime';
      console.error('Submit score validation error:', errorMsg);
      res.status(400).json({ 
        status: 'error', 
        message: errorMsg
      });
      return;
    }

    // 验证数据类型
    if (typeof playerScore.roundsCompleted !== 'number' || typeof playerScore.totalTime !== 'number') {
      const errorMsg = 'roundsCompleted and totalTime must be numbers';
      console.error('Submit score type validation error:', errorMsg);
      res.status(400).json({ 
        status: 'error', 
        message: errorMsg
      });
      return;
    }

    console.log(`Processing score submission: ${playerScore.playerName} (${playerScore.playerId})`);
    console.log(`Completion time: ${playerScore.completionTime}s, Rounds: ${playerScore.roundsCompleted}`);

    // 添加时间戳
    const playerScoreWithTimestamp: PlayerScore = {
      ...playerScore,
      completedAt: Date.now()
    };

    const result = await submitScore({
      redis,
      playerScore: playerScoreWithTimestamp
    });

    console.log('Score submission result:', result);

    res.status(201).json({
      status: 'success',
      data: result,
      message: result.message
    });
  } catch (error) {
    console.error('API Submit Score Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      status: 'error', 
      message 
    });
  }
});

/**
 * 获取全局排行榜
 * Get global leaderboard
 * GET /api/leaderboard
 */
router.get('/api/leaderboard', async (req, res): Promise<void> => {
  try {
    console.log('Leaderboard API called with query:', req.query);
    
    const limit = parseInt(req.query.limit as string) || 100;
    const redis = getRedis();

    console.log(`Getting global leaderboard with limit: ${limit}`);

    // 调试：打印 Redis 中的数据
    await debugLeaderboard(redis);

    const leaderboardData: LeaderboardData = await getLeaderboard({ 
      redis, 
      limit 
    });

    console.log('Global leaderboard data retrieved:', {
      entriesCount: leaderboardData.entries.length,
      totalPlayers: leaderboardData.totalPlayers
    });

    res.json({
      status: 'success',
      data: leaderboardData
    });
  } catch (error) {
    console.error('API Leaderboard Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      status: 'error', 
      message 
    });
  }
});

/**
 * 获取玩家个人最佳成绩
 * Get player's personal best score
 * GET /api/player-best
 */
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

// ==================== 调试和管理API路由 ====================

/**
 * 调试排行榜数据
 * Debug leaderboard data
 * GET /api/debug-leaderboard
 */
router.get('/api/debug-leaderboard', async (_req, res): Promise<void> => {
  try {
    const redis = getRedis();
    await debugLeaderboard(redis);
    res.json({ 
      status: 'success', 
      message: 'Global leaderboard debug info printed to console' 
    });
  } catch (error) {
    console.error('Debug API Error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Debug failed' 
    });
  }
});

/**
 * 健康检查
 * Health check
 * GET /api/health
 */
router.get('/api/health', async (_req, res): Promise<void> => {
  try {
    const redis = getRedis();
    
    // 简单的 Redis 连接测试
    await redis.ping();
    
    res.json({
      status: 'success',
      message: 'Server and Redis are healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// 应用路由
app.use(router);

const port = getServerPort();
const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(port, () => {
  console.log(`🚀 Global Leaderboard Server running on http://localhost:${port}`);
  console.log('📊 Available endpoints:');
  console.log('  POST /api/submit-score - Submit player score to global leaderboard');
  console.log('  GET  /api/leaderboard - Get global leaderboard data');
  console.log('  GET  /api/player-best - Get player personal best score');
  console.log('  GET  /api/debug-leaderboard - Debug leaderboard data');
  console.log('  GET  /api/health - Health check');
});