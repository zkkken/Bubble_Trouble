/**
 * 全局游戏排行榜系统 - 服务端逻辑
 * Global Game Leaderboard System - Server Logic
 */

import { Context } from '@devvit/public-api';
import { RedisClient } from '@devvit/redis';

// 全局排行榜的 Redis 键名
const LEADERBOARD_KEY = 'global_leaderboard';

// 玩家分数数据结构
export interface PlayerScore {
  playerId: string;
  playerName: string;
  catAvatarId?: string;
  continentId?: string;
  completionTime: number; // 通关时间（秒）
  completionFlag: boolean; // 是否成功通关
  roundsCompleted: number; // 完成的回合数
  totalTime: number; // 总游戏时间
  difficulty?: 'easy' | 'medium' | 'hard';
  countryCode?: string;
  completedAt: number; // 完成时间戳
}

// 排行榜条目
export interface LeaderboardEntry extends PlayerScore {
  rank: number; // 排名
}

// 排行榜数据
export interface LeaderboardData {
  entries: LeaderboardEntry[];
  totalPlayers: number;
  lastUpdated: number;
}

/**
 * 提交玩家分数到全局排行榜
 * Submit player score to global leaderboard
 */
export async function submitScore({
  redis,
  playerScore
}: {
  redis: Context['redis'] | RedisClient;
  playerScore: PlayerScore;
}): Promise<{ success: boolean; rank: number; message: string }> {
  try {
    console.log(`Submitting score for player ${playerScore.playerId} (${playerScore.playerName})`);
    console.log(`Completion time: ${playerScore.completionTime}s, Rounds: ${playerScore.roundsCompleted}`);
    
    // 验证必需字段
    if (!playerScore.playerId || !playerScore.playerName || typeof playerScore.completionTime !== 'number') {
      throw new Error('Missing required fields: playerId, playerName, or completionTime');
    }

    // 将玩家数据转换为 JSON 字符串作为成员
    const memberData = JSON.stringify(playerScore);
    
    // 使用完成时间作为分数（时间越短越好，Redis 默认升序排列）
    // 为了确保排序正确，我们使用负数或者使用 ZREVRANGE 来获取数据
    const score = playerScore.completionTime;
    
    // 将玩家分数添加到全局排行榜
    await redis.zAdd(LEADERBOARD_KEY, {
      member: memberData,
      score: score
    });
    
    console.log(`Player ${playerScore.playerName} added to global leaderboard with score ${score}`);
    
    // 获取玩家在排行榜中的排名
    const rank = await getPlayerRank(redis, playerScore.playerId);
    
    console.log(`Player ${playerScore.playerName} current rank: ${rank}`);
    
    return {
      success: true,
      rank: rank,
      message: `Score submitted successfully. Current rank: ${rank}`
    };
  } catch (error) {
    console.error('Error submitting score:', error);
    throw error;
  }
}

/**
 * 获取全局排行榜数据
 * Get global leaderboard data
 */
export async function getLeaderboard({
  redis,
  limit = 100
}: {
  redis: Context['redis'] | RedisClient;
  limit?: number;
}): Promise<LeaderboardData> {
  try {
    console.log(`Getting global leaderboard with limit: ${limit}`);
    
    // 从 Redis 获取排行榜前 N 名（按分数升序，时间越短越好）
    const leaderboardData = await redis.zRange(LEADERBOARD_KEY, 0, limit - 1, { by: 'rank' });
    console.log(`Retrieved ${leaderboardData.length} entries from leaderboard`);
    
    const entries: LeaderboardEntry[] = [];
    
    // 解析每个成员的 JSON 数据并添加排名
    for (let i = 0; i < leaderboardData.length; i++) {
      try {
        const playerData: PlayerScore = JSON.parse(leaderboardData[i]);
        const entry: LeaderboardEntry = {
          ...playerData,
          rank: i + 1 // 排名从 1 开始
        };
        entries.push(entry);
        console.log(`Rank ${entry.rank}: ${entry.playerName} - ${entry.completionTime}s`);
      } catch (parseError) {
        console.error(`Error parsing leaderboard entry at index ${i}:`, parseError);
        // 跳过无法解析的条目
      }
    }

    // 获取总玩家数
    const totalPlayers = await redis.zCard(LEADERBOARD_KEY);
    console.log(`Total players in global leaderboard: ${totalPlayers}`);
    
    const result = {
      entries,
      totalPlayers,
      lastUpdated: Date.now()
    };
    
    console.log(`Global leaderboard data prepared with ${entries.length} entries`);
    return result;
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
 * 获取特定玩家的排名
 * Get specific player's rank
 */
export async function getPlayerRank(
  redis: Context['redis'] | RedisClient, 
  playerId: string
): Promise<number> {
  try {
    // 获取所有排行榜数据来查找特定玩家
    const allEntries = await redis.zRange(LEADERBOARD_KEY, 0, -1, { by: 'rank' });
    
    for (let i = 0; i < allEntries.length; i++) {
      try {
        const playerData: PlayerScore = JSON.parse(allEntries[i]);
        if (playerData.playerId === playerId) {
          return i + 1; // 排名从 1 开始
        }
      } catch (parseError) {
        console.error(`Error parsing entry for rank calculation:`, parseError);
      }
    }
    
    return -1; // 玩家不在排行榜中
  } catch (error) {
    console.error('Error getting player rank:', error);
    return -1;
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
    console.log(`Getting best score for player: ${playerId}`);
    
    // 获取所有排行榜数据来查找特定玩家的最佳成绩
    const allEntries = await redis.zRange(LEADERBOARD_KEY, 0, -1, { by: 'rank' });
    
    for (const entry of allEntries) {
      try {
        const playerData: PlayerScore = JSON.parse(entry);
        if (playerData.playerId === playerId) {
          console.log(`Found best score for player ${playerId}:`, playerData);
          return playerData;
        }
      } catch (parseError) {
        console.error(`Error parsing entry for player best:`, parseError);
      }
    }
    
    console.log(`No best score found for player: ${playerId}`);
    return null;
  } catch (error) {
    console.error('Error getting player best score:', error);
    return null;
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
      // 删除排名 1000 以后的玩家（保留前 1000 名）
      await redis.zRemRangeByRank(LEADERBOARD_KEY, 1000, -1);
      console.log(`Cleaned up leaderboard, removed ${totalPlayers - 1000} entries`);
    }
  } catch (error) {
    console.error('Error cleaning up leaderboard:', error);
  }
}

/**
 * 调试函数：获取 Redis 中的所有排行榜数据
 * Debug function: Get all leaderboard data from Redis
 */
export async function debugLeaderboard(redis: Context['redis'] | RedisClient): Promise<void> {
  try {
    console.log('=== GLOBAL LEADERBOARD DEBUG INFO ===');
    
    // 检查排行榜大小
    const leaderboardSize = await redis.zCard(LEADERBOARD_KEY);
    console.log(`Global leaderboard size: ${leaderboardSize}`);
    
    if (leaderboardSize > 0) {
      // 获取前 10 名用于调试
      const topPlayers = await redis.zRange(LEADERBOARD_KEY, 0, 9, { by: 'rank' });
      console.log('Top 10 players:');
      
      for (let i = 0; i < topPlayers.length; i++) {
        try {
          const playerData: PlayerScore = JSON.parse(topPlayers[i]);
          console.log(`Rank ${i + 1}: ${playerData.playerName} - ${playerData.completionTime}s (${playerData.roundsCompleted} rounds)`);
        } catch (parseError) {
          console.log(`Rank ${i + 1}: [Parse Error] ${topPlayers[i]}`);
        }
      }
    }
    
    console.log('=== END GLOBAL LEADERBOARD DEBUG INFO ===');
  } catch (error) {
    console.error('Error in debug function:', error);
  }
}