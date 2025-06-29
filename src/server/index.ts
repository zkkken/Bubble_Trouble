import express from 'express';
import { createServer, getServerPort } from '@devvit/server';
import { getRedis } from '@devvit/redis';
import { 
  submitScore, 
  getContinentLeaderboard,
  getContinentRankings,
  PlayerScore,
} from './core/leaderboard';

const app = express();
app.use(express.json());
const router = express.Router();

// ================= 排行榜 API 路由 (V2) =================

/**
 * 提交分数并获取本次游戏的最终统计数据
 * (供 GameCompletionScreen 使用)
 */
router.post('/api/submit-score', async (req, res) => {
  try {
    const playerScore: PlayerScore = req.body;
    const redis = getRedis();
    
    // 核心逻辑现在返回详细的统计信息
    const stats = await submitScore({ redis, playerScore });
    
    res.status(201).json({ status: 'success', data: stats });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API /submit-score] Error:', message);
    res.status(500).json({ status: 'error', message });
  }
});

/**
 * 获取洲际统计数据 (供 LeaderboardRankingScreen 使用)
 * 兼容客户端期望的数据格式
 */
router.get('/api/leaderboard/stats', async (_req, res) => {
  console.log('🔍 [API /leaderboard/stats] 开始处理请求...');
  try {
    console.log('🔍 [API /leaderboard/stats] 获取Redis连接...');
    const redis = getRedis();
    console.log('🔍 [API /leaderboard/stats] Redis连接成功，调用getContinentRankings...');
    
    const rankings = await getContinentRankings({ redis });
    console.log('🔍 [API /leaderboard/stats] getContinentRankings完成，结果数量:', rankings.length);
    
    // 输出服务器端详细统计信息
    console.log('📊 洲际统计数据:');
    rankings.forEach(ranking => {
      console.log(`   [${ranking.continentId}] ${ranking.continentName}: ${ranking.playerCount}人, 总时长${ranking.totalDuration.toFixed(1)}s`);
    });
    
    // 转换为客户端期望的格式
    const stats = rankings.map(ranking => ({
      continentId: ranking.continentId,
      continentName: ranking.continentName,
      playerCount: ranking.playerCount,
      flag: `Map_Cat_${ranking.continentId}.png`, // 生成flag图片名
    }));
    
    console.log('🔍 [API /leaderboard/stats] 数据转换完成，准备返回...');
    res.json({ status: 'success', data: stats });
    console.log('🔍 [API /leaderboard/stats] 请求处理完成');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error ? error.stack : 'No stack trace';
    console.error('[API /leaderboard/stats] Error:', message);
    console.error('[API /leaderboard/stats] Stack:', stack);
    res.status(500).json({ status: 'error', message });
  }
});

/**
 * 获取按玩家人数排序的所有大洲排名
 * (供 LeaderboardRankingScreen 使用)
 */
router.get('/api/leaderboard/continents', async (_req, res) => {
  try {
    const redis = getRedis();
    const rankings = await getContinentRankings({ redis });
    res.json({ status: 'success', data: rankings });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API /leaderboard/continents] Error:', message);
    res.status(500).json({ status: 'error', message });
  }
});

/**
 * 获取特定大洲的玩家排行榜 (Top 20)
 * (供 ContinentRankingScreen 使用)
 */
router.get('/api/leaderboard/:continentId', async (req, res) => {
  try {
    const { continentId } = req.params;
    const redis = getRedis();

    if (!continentId) {
      return res.status(400).json({ status: 'error', message: 'Continent ID is required.' });
    }

    const continentIdUpper = continentId.toUpperCase();
    const leaderboard = await getContinentLeaderboard({
      redis,
      continentId: continentIdUpper,
      limit: 20,
    });

    // 获取该洲的统计信息（使用现有函数）
    const allRankings = await getContinentRankings({ redis });
    const continentStats = allRankings.find(r => r.continentId === continentIdUpper);
    
    const playerCount = continentStats?.playerCount || 0;
    const totalTime = continentStats?.totalDuration || 0;
    const averageTime = playerCount > 0 ? totalTime / playerCount : 0;

    // 输出详细日志
    console.log(`📊 [${continentIdUpper}] 洲际排行榜统计:`);
    console.log(`   - 总玩家数: ${playerCount}`);
    console.log(`   - 洲总用时: ${totalTime.toFixed(1)}s`);
    console.log(`   - 平均用时: ${averageTime.toFixed(1)}s`);
    console.log(`   - 排行榜条目: ${leaderboard.length}`);
    console.log(`   - 前5名:`);
    leaderboard.slice(0, 5).forEach((player, index) => {
      console.log(`     ${index + 1}. ${player.playerName}: ${player.enduranceDuration}s`);
    });

    res.json({ 
      status: 'success', 
      data: leaderboard,
      stats: {
        continentId: continentIdUpper,
        playerCount,
        totalTime,
        averageTime
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[API /leaderboard/${req.params.continentId}] Error:`, message);
    res.status(500).json({ status: 'error', message });
  }
});

// Player best functionality removed as it's not available in simplified leaderboard


// ==================== 管理 & 调试 API ====================

router.get('/api/health', async (_req, res) => {
  try {
    const redis = getRedis();
    // 简单检查Redis连接（通过尝试一个基本操作）
    await (redis as any).set('health_check', 'ok');
    res.json({ status: 'success', message: 'Server and Redis are healthy' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Redis connection failed' });
  }
});

app.use(router);

const port = getServerPort();
const server = createServer(app);

server.listen(port, () => {
  console.log(`🚀 Leaderboard Server (V2) running on http://localhost:${port}`);
  console.log('Routes:');
  console.log('  POST /api/submit-score');
  console.log('  GET  /api/leaderboard/continents');
  console.log('  GET  /api/leaderboard/:continentId');
  console.log('  GET  /api/player-best?playerId=...');
  console.log('  GET  /api/health');
});
