/**
 * 排行榜系统 - 服务端逻辑
 * Leaderboard System - Server Logic
 */

import { Context } from '@devvit/public-api';
import { RedisClient } from '@devvit/redis';
import { PlayerScore, LeaderboardEntry, LeaderboardData } from '../../shared/types/leaderboard';

// Redis 键名常量
const LEADERBOARD_KEY = 'cat_comfort_leaderboard';
const PLAYER_SCORES_KEY = 'cat_comfort_player_scores';
const LEADERBOARD_STATS_KEY = 'cat_comfort_stats';

/**
 * 计算玩家得分
 * Calculate player score based on performance
 */
function calculateScore(roundsCompleted: number, totalTime: number, difficulty: 'easy' | 'medium' | 'hard'): number {
  // 基础分数：每回合 1000 分
  let baseScore = roundsCompleted * 1000;
  
  // 时间奖励：剩余时间越多，奖励越高
  const timeBonus = Math.max(0, (180 - totalTime) * 10); // 假设最大时间是 180 秒
  
  // 难度倍数
  const difficultyMultiplier = {
    easy: 1.0,
    medium: 1.5,
    hard: 2.0
  }[difficulty];
  
  // 连击奖励：连续完成回合的奖励
  const comboBonus = roundsCompleted > 1 ? (roundsCompleted - 1) * 500 : 0;
  
  const finalScore = Math.round((baseScore + timeBonus + comboBonus) * difficultyMultiplier);
  
  console.log(`Score calculation: base=${baseScore}, timeBonus=${timeBonus}, comboBonus=${comboBonus}, multiplier=${difficultyMultiplier}, final=${finalScore}`);
  
  return finalScore;
}

/**
 * 提交玩家分数到排行榜
 * Submit player score to leaderboard
 */
export async function submitScore({
  redis,
  playerId,
  playerName,
  roundsCompleted,
  totalTime,
  difficulty = 'medium'
}: {
  redis: Context['redis'] | RedisClient;
  playerId: string;
  playerName: string;
  roundsCompleted: number;
  totalTime: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}): Promise<{ rank: number; isNewRecord: boolean; score: number }> {
  try {
    const score = calculateScore(roundsCompleted, totalTime, difficulty);
    const completedAt = Date.now();
    
    const playerScore: PlayerScore = {
      playerId,
      playerName,
      score,
      roundsCompleted,
      totalTime,
      completedAt,
      difficulty
    };

    // 检查玩家是否已有记录
    const existingScoreStr = await redis.hGet(PLAYER_SCORES_KEY, playerId);
    let isNewRecord = true;
    
    if (existingScoreStr) {
      const existingScore: PlayerScore = JSON.parse(existingScoreStr);
      isNewRecord = score > existingScore.score;
      
      // 只有新分数更高时才更新
      if (!isNewRecord) {
        const rank = await getPlayerRank(redis, playerId);
        return { rank, isNewRecord: false, score: existingScore.score };
      }
    }

    // 保存玩家分数
    await redis.hSet(PLAYER_SCORES_KEY, playerId, JSON.stringify(playerScore));
    
    // 添加到排行榜（使用 Redis sorted set）
    await redis.zAdd(LEADERBOARD_KEY, { member: playerId, score });
    
    // 更新统计信息
    await updateLeaderboardStats(redis);
    
    // 获取玩家排名
    const rank = await getPlayerRank(redis, playerId);
    
    console.log(`Score submitted: player=${playerName}, score=${score}, rank=${rank}, isNewRecord=${isNewRecord}`);
    
    return { rank, isNewRecord, score };
  } catch (error) {
    console.error('Error submitting score:', error);
    throw error;
  }
}

/**
 * 获取玩家排名
 * Get player rank
 */
async function getPlayerRank(redis: Context['redis'] | RedisClient, playerId: string): Promise<number> {
  try {
    const rank = await redis.zRevRank(LEADERBOARD_KEY, playerId);
    return rank !== null ? rank + 1 : -1; // Redis rank is 0-based, convert to 1-based
  } catch (error) {
    console.error('Error getting player rank:', error);
    return -1;
  }
}

/**
 * 获取排行榜数据
 * Get leaderboard data
 */
export async function getLeaderboard({
  redis,
  limit = 50
}: {
  redis: Context['redis'] | RedisClient;
  limit?: number;
}): Promise<LeaderboardData> {
  try {
    // 获取排行榜前 N 名
    const topPlayers = await redis.zRevRange(LEADERBOARD_KEY, 0, limit - 1, { by: 'rank' });
    
    const entries: LeaderboardEntry[] = [];
    
    for (let i = 0; i < topPlayers.length; i++) {
      const playerId = topPlayers[i];
      const playerScoreStr = await redis.hGet(PLAYER_SCORES_KEY, playerId);
      
      if (playerScoreStr) {
        const playerScore: PlayerScore = JSON.parse(playerScoreStr);
        entries.push({
          rank: i + 1,
          playerId: playerScore.playerId,
          playerName: playerScore.playerName,
          score: playerScore.score,
          roundsCompleted: playerScore.roundsCompleted,
          totalTime: playerScore.totalTime,
          completedAt: playerScore.completedAt,
          difficulty: playerScore.difficulty
        });
      }
    }

    // 获取总玩家数
    const totalPlayers = await redis.zCard(LEADERBOARD_KEY);
    
    return {
      entries,
      totalPlayers,
      lastUpdated: Date.now()
    };
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return {
      entries: [],
      totalPlayers: 0,
      lastUpdated: Date.now()
    };
  }
}

/**
 * 获取玩家个人最佳成绩
 * Get player's personal best score
 */
export async function getPlayerBest({
  redis,
  playerId
}: {
  redis: Context['redis'] | RedisClient;
  playerId: string;
}): Promise<PlayerScore | null> {
  try {
    const playerScoreStr = await redis.hGet(PLAYER_SCORES_KEY, playerId);
    return playerScoreStr ? JSON.parse(playerScoreStr) : null;
  } catch (error) {
    console.error('Error getting player best score:', error);
    return null;
  }
}

/**
 * 更新排行榜统计信息
 * Update leaderboard statistics
 */
async function updateLeaderboardStats(redis: Context['redis'] | RedisClient): Promise<void> {
  try {
    const stats = {
      totalPlayers: await redis.zCard(LEADERBOARD_KEY),
      lastUpdated: Date.now()
    };
    
    await redis.set(LEADERBOARD_STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Error updating leaderboard stats:', error);
  }
}

/**
 * 清理排行榜（保留前 1000 名）
 * Clean up leaderboard (keep top 1000)
 */
export async function cleanupLeaderboard(redis: Context['redis'] | RedisClient): Promise<void> {
  try {
    const totalPlayers = await redis.zCard(LEADERBOARD_KEY);
    
    if (totalPlayers > 1000) {
      // 删除排名 1000 以后的玩家
      await redis.zRemRangeByRank(LEADERBOARD_KEY, 0, totalPlayers - 1001);
      console.log(`Cleaned up leaderboard, removed ${totalPlayers - 1000} entries`);
    }
  } catch (error) {
    console.error('Error cleaning up leaderboard:', error);
  }
}