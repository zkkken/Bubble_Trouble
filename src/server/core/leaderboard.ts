/**
 * 全局游戏排行榜系统 - 服务端逻辑 (洲际排行榜版本)
 * Global Game Leaderboard System - Server Logic (Continental Leaderboard Version)
 */

import { Context } from '@devvit/public-api';
import { RedisClient } from '@devvit/redis';

// Redis 键名常量
const LEADERBOARD_KEY = 'global_leaderboard';
const PLAYER_SCORES_KEY = 'player_scores_hash';

// 玩家分数数据结构
export interface PlayerScore {
  playerId: string;
  playerName: string;
  catAvatarId: string;
  continentId: string;
  completionTime: number; // 通关时间（秒）- 现在时间越长排名越高
  completionFlag: 'Y' | 'N'; // 是否成功通关
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
  continentId?: string; // 如果是洲际排行榜
}

// 洲际统计数据
export interface ContinentStats {
  continentId: string;
  continentName: string;
  playerCount: number;
  flag: string;
}

// 洲际信息映射
const CONTINENT_INFO = {
  'AS': { name: 'Asia', flag: '🌏' },
  'EU': { name: 'Europe', flag: '🌍' },
  'AF': { name: 'Africa', flag: '🌍' },
  'NA': { name: 'North America', flag: '🌎' },
  'SA': { name: 'South America', flag: '🌎' },
  'OC': { name: 'Oceania', flag: '🌏' },
};

/**
 * 提交玩家分数到全球排行榜
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
    console.log(`Completion time: ${playerScore.completionTime}s, Continent: ${playerScore.continentId}`);
    
    // 验证必需字段
    if (!playerScore.playerId || !playerScore.playerName || typeof playerScore.completionTime !== 'number') {
      throw new Error('Missing required fields: playerId, playerName, or completionTime');
    }

    // 保存玩家详细数据到 Hash
    await redis.hSet(PLAYER_SCORES_KEY, playerScore.playerId, JSON.stringify(playerScore));
    
    // 使用完成时间作为分数，时间越长排名越高，所以使用正数
    const score = playerScore.completionTime;
    
    // 将玩家分数添加到全球排行榜 (使用 zRevRange 获取时需要时间长的在前面)
    await redis.zAdd(LEADERBOARD_KEY, {
      member: playerScore.playerId,
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
 * 获取全球排行榜数据 (支持按洲际过滤)
 * Get global leaderboard data (supports filtering by continent)
 */
export async function getLeaderboard({
  redis,
  limit = 100,
  continentId
}: {
  redis: Context['redis'] | RedisClient;
  limit?: number;
  continentId?: string;
}): Promise<LeaderboardData> {
  try {
    const leaderboardType = continentId ? `continent (${continentId})` : 'global';
    console.log(`Getting ${leaderboardType} leaderboard with limit: ${limit}`);
    
    // 从 Redis 获取排行榜前 N 名（按分数降序，时间越长越好）
    const topPlayerIds = await redis.zRevRange(LEADERBOARD_KEY, 0, limit - 1, { by: 'rank' });
    console.log(`Retrieved ${topPlayerIds.length} player IDs from leaderboard`);
    
    const entries: LeaderboardEntry[] = [];
    
    // 获取每个玩家的详细数据并过滤
    for (let i = 0; i < topPlayerIds.length; i++) {
      const playerId = topPlayerIds[i];
      const playerDataStr = await redis.hGet(PLAYER_SCORES_KEY, playerId);
      
      if (playerDataStr) {
        try {
          const playerData: PlayerScore = JSON.parse(playerDataStr);
          
          // 如果指定了洲际，只包含该洲际的玩家
          if (!continentId || playerData.continentId === continentId) {
            const entry: LeaderboardEntry = {
              ...playerData,
              rank: entries.length + 1 // 重新计算排名
            };
            entries.push(entry);
            console.log(`Rank ${entry.rank}: ${entry.playerName} (${entry.continentId}) - ${entry.completionTime}s`);
          }
        } catch (parseError) {
          console.error(`Error parsing player data for ${playerId}:`, parseError);
        }
      } else {
        console.warn(`No player data found for ${playerId}`);
      }
    }

    // 获取总玩家数
    let totalPlayers: number;
    if (continentId) {
      // 计算特定洲际的玩家数
      totalPlayers = entries.length;
    } else {
      totalPlayers = await redis.zCard(LEADERBOARD_KEY);
    }
    
    console.log(`Total players in ${leaderboardType} leaderboard: ${totalPlayers}`);
    
    const result = {
      entries,
      totalPlayers,
      lastUpdated: Date.now(),
      continentId
    };
    
    console.log(`${leaderboardType} leaderboard data prepared with ${entries.length} entries`);
    return result;
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return {
      entries: [],
      totalPlayers: 0,
      lastUpdated: Date.now(),
      continentId
    };
  }
}

/**
 * 获取洲际统计数据
 * Get continent statistics
 */
export async function getContinentStats({
  redis
}: {
  redis: Context['redis'] | RedisClient;
}): Promise<ContinentStats[]> {
  try {
    console.log('Getting continent statistics');
    
    // 获取所有玩家数据
    const allPlayerData = await redis.hGetAll(PLAYER_SCORES_KEY);
    console.log(`Found ${Object.keys(allPlayerData).length} players in database`);
    
    // 统计每个洲际的玩家数量
    const continentCounts: { [key: string]: number } = {};
    
    for (const [playerId, playerDataStr] of Object.entries(allPlayerData)) {
      try {
        const playerData: PlayerScore = JSON.parse(playerDataStr);
        const continent = playerData.continentId || 'Unknown';
        continentCounts[continent] = (continentCounts[continent] || 0) + 1;
      } catch (parseError) {
        console.error(`Error parsing player data for ${playerId}:`, parseError);
      }
    }
    
    // 转换为统计数组
    const stats: ContinentStats[] = [];
    for (const [continentId, count] of Object.entries(continentCounts)) {
      if (continentId !== 'Unknown' && CONTINENT_INFO[continentId as keyof typeof CONTINENT_INFO]) {
        const info = CONTINENT_INFO[continentId as keyof typeof CONTINENT_INFO];
        stats.push({
          continentId,
          continentName: info.name,
          playerCount: count,
          flag: info.flag
        });
      }
    }
    
    // 按玩家数量降序排序
    stats.sort((a, b) => b.playerCount - a.playerCount);
    
    console.log('Continent statistics:', stats);
    return stats;
  } catch (error) {
    console.error('Error getting continent statistics:', error);
    return [];
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
    // 使用 zRevRank 因为我们要时间长的排在前面
    const rank = await redis.zRevRank(LEADERBOARD_KEY, playerId);
    console.log(`Player ${playerId} rank: ${rank}`);
    return rank !== null ? rank + 1 : -1; // Redis rank is 0-based, convert to 1-based
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
    
    const playerDataStr = await redis.hGet(PLAYER_SCORES_KEY, playerId);
    if (playerDataStr) {
      try {
        const playerData: PlayerScore = JSON.parse(playerDataStr);
        console.log(`Found best score for player ${playerId}:`, playerData);
        return playerData;
      } catch (parseError) {
        console.error(`Error parsing player data for ${playerId}:`, parseError);
        return null;
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
      await redis.zRemRangeByRank(LEADERBOARD_KEY, 0, totalPlayers - 1001);
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
    console.log('=== CONTINENTAL LEADERBOARD DEBUG INFO ===');
    
    // 检查排行榜大小
    const leaderboardSize = await redis.zCard(LEADERBOARD_KEY);
    console.log(`Global leaderboard size: ${leaderboardSize}`);
    
    if (leaderboardSize > 0) {
      // 获取前 10 名用于调试 (使用 zRevRange 因为时间长的排前面)
      const topPlayerIds = await redis.zRevRange(LEADERBOARD_KEY, 0, 9, { by: 'rank' });
      console.log('Top 10 players (by completion time - longest first):');
      
      for (let i = 0; i < topPlayerIds.length; i++) {
        const playerId = topPlayerIds[i];
        const playerDataStr = await redis.hGet(PLAYER_SCORES_KEY, playerId);
        
        if (playerDataStr) {
          try {
            const playerData: PlayerScore = JSON.parse(playerDataStr);
            console.log(`Rank ${i + 1}: ${playerData.playerName} (${playerData.continentId}) - ${playerData.completionTime}s (${playerData.roundsCompleted} rounds)`);
          } catch (parseError) {
            console.log(`Rank ${i + 1}: [Parse Error] ${playerId}`);
          }
        } else {
          console.log(`Rank ${i + 1}: [No Data] ${playerId}`);
        }
      }
    }
    
    // 检查洲际统计
    const continentStats = await getContinentStats({ redis });
    console.log('Continent statistics:', continentStats);
    
    console.log('=== END CONTINENTAL LEADERBOARD DEBUG INFO ===');
  } catch (error) {
    console.error('Error in debug function:', error);
  }
}