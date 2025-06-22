/**
 * 排行榜系统 - 服务端逻辑 (复合分数版本)
 * Leaderboard System - Server Logic (Composite Score Version)
 */

import { Context } from '@devvit/public-api';
import { RedisClient } from '@devvit/redis';
import { PlayerScore, LeaderboardEntry, LeaderboardData } from '../../shared/types/leaderboard';

// Redis 键名常量
const LEADERBOARD_KEY = 'cat_comfort_leaderboard'; // Global leaderboard
const PLAYER_SCORES_KEY = 'cat_comfort_player_scores'; // Player data hash
const LEADERBOARD_STATS_KEY = 'cat_comfort_stats';

// 复合分数计算常量
const COMPOSITE_SCORE_MULTIPLIER = 10000000; // 10 million - ensures round priority

/**
 * 计算复合分数 - 回合数优先，然后是原始分数
 * Calculate composite score - rounds first, then raw score
 */
function calculateCompositeScore(roundsCompleted: number, rawScore: number): number {
  return (roundsCompleted * COMPOSITE_SCORE_MULTIPLIER) + rawScore;
}

/**
 * 计算玩家原始得分 (保持现有逻辑)
 * Calculate player raw score based on performance
 */
function calculateRawScore(roundsCompleted: number, totalTime: number, difficulty: 'easy' | 'medium' | 'hard'): number {
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
  
  console.log(`Raw score calculation: base=${baseScore}, timeBonus=${timeBonus}, comboBonus=${comboBonus}, multiplier=${difficultyMultiplier}, final=${finalScore}`);
  
  return finalScore;
}

/**
 * 比较两个成绩，判断是否为新的个人最佳
 * Compare two scores to determine if new score is a personal best
 */
function isNewPersonalBest(
  newRounds: number, 
  newRawScore: number, 
  oldRounds: number, 
  oldRawScore: number
): boolean {
  // 回合数更多 = 新最佳
  if (newRounds > oldRounds) {
    return true;
  }
  
  // 回合数相同，原始分数更高 = 新最佳
  if (newRounds === oldRounds && newRawScore > oldRawScore) {
    return true;
  }
  
  // 其他情况都不是新最佳
  return false;
}

/**
 * 获取国家排行榜键名
 * Get country leaderboard key
 */
function getCountryLeaderboardKey(countryCode: string): string {
  return `country:${countryCode.toUpperCase()}:leaderboard`;
}

/**
 * 提交玩家分数到排行榜 (复合分数版本)
 * Submit player score to leaderboard (composite score version)
 */
export async function submitScore({
  redis,
  playerId,
  playerName,
  roundsCompleted,
  totalTime,
  difficulty = 'medium',
  countryCode
}: {
  redis: Context['redis'] | RedisClient;
  playerId: string;
  playerName: string;
  roundsCompleted: number;
  totalTime: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  countryCode: string;
}): Promise<{ rank: number; isNewRecord: boolean; score: number; compositeScore: number }> {
  try {
    console.log(`Submitting score for player ${playerId} (${playerName}): rounds=${roundsCompleted}, time=${totalTime}, difficulty=${difficulty}, country=${countryCode}`);
    
    const rawScore = calculateRawScore(roundsCompleted, totalTime, difficulty);
    const compositeScore = calculateCompositeScore(roundsCompleted, rawScore);
    const completedAt = Date.now();
    
    console.log(`Calculated scores: raw=${rawScore}, composite=${compositeScore}`);

    // 检查玩家是否已有记录
    const existingScoreStr = await redis.hGet(PLAYER_SCORES_KEY, playerId);
    let isNewRecord = true;
    let oldRounds = 0;
    let oldRawScore = 0;
    
    if (existingScoreStr) {
      try {
        const existingScore: PlayerScore = JSON.parse(existingScoreStr);
        oldRounds = existingScore.roundsCompleted;
        oldRawScore = existingScore.score;
        
        // 使用新的复合比较逻辑
        isNewRecord = isNewPersonalBest(roundsCompleted, rawScore, oldRounds, oldRawScore);
        
        console.log(`Existing best: rounds=${oldRounds}, rawScore=${oldRawScore}`);
        console.log(`New submission: rounds=${roundsCompleted}, rawScore=${rawScore}`);
        console.log(`Is new record: ${isNewRecord}`);
        
        // 如果不是新记录，返回现有排名
        if (!isNewRecord) {
          const rank = await getPlayerRank(redis, playerId, countryCode);
          return { 
            rank, 
            isNewRecord: false, 
            score: oldRawScore,
            compositeScore: existingScore.compositeScore
          };
        }
      } catch (parseError) {
        console.error('Error parsing existing score:', parseError);
        // 如果解析失败，继续保存新分数
      }
    }

    // 只有新记录才保存
    if (isNewRecord) {
      const playerScore: PlayerScore = {
        playerId,
        playerName,
        score: rawScore, // 存储原始分数
        roundsCompleted,
        totalTime,
        completedAt,
        difficulty,
        countryCode: countryCode.toUpperCase(),
        compositeScore
      };

      // 保存玩家分数到 Hash
      await redis.hSet(PLAYER_SCORES_KEY, playerId, JSON.stringify(playerScore));
      console.log(`Player score saved to hash: ${playerId}`);
      
      // 添加到全球排行榜（使用复合分数）
      await redis.zAdd(LEADERBOARD_KEY, { member: playerId, score: compositeScore });
      console.log(`Player added to global leaderboard: ${playerId} with composite score ${compositeScore}`);
      
      // 添加到国家排行榜（使用复合分数）
      const countryKey = getCountryLeaderboardKey(countryCode);
      await redis.zAdd(countryKey, { member: playerId, score: compositeScore });
      console.log(`Player added to country leaderboard (${countryCode}): ${playerId} with composite score ${compositeScore}`);
      
      // 更新统计信息
      await updateLeaderboardStats(redis);
    }
    
    // 获取玩家排名
    const rank = await getPlayerRank(redis, playerId, countryCode);
    
    console.log(`Score submitted successfully: player=${playerName}, rawScore=${rawScore}, compositeScore=${compositeScore}, rank=${rank}, isNewRecord=${isNewRecord}`);
    
    return { rank, isNewRecord, score: rawScore, compositeScore };
  } catch (error) {
    console.error('Error submitting score:', error);
    throw error;
  }
}

/**
 * 获取玩家排名 (支持全球和国家排行榜)
 * Get player rank (supports global and country leaderboards)
 */
async function getPlayerRank(
  redis: Context['redis'] | RedisClient, 
  playerId: string, 
  countryCode?: string
): Promise<number> {
  try {
    let leaderboardKey = LEADERBOARD_KEY; // 默认全球排行榜
    
    if (countryCode) {
      leaderboardKey = getCountryLeaderboardKey(countryCode);
    }
    
    const rank = await redis.zRevRank(leaderboardKey, playerId);
    console.log(`Player ${playerId} rank in ${countryCode ? countryCode : 'global'}: ${rank}`);
    return rank !== null ? rank + 1 : -1; // Redis rank is 0-based, convert to 1-based
  } catch (error) {
    console.error('Error getting player rank:', error);
    return -1;
  }
}

/**
 * 获取排行榜数据 (支持全球和国家排行榜)
 * Get leaderboard data (supports global and country leaderboards)
 */
export async function getLeaderboard({
  redis,
  limit = 50,
  countryCode
}: {
  redis: Context['redis'] | RedisClient;
  limit?: number;
  countryCode?: string;
}): Promise<LeaderboardData> {
  try {
    const leaderboardKey = countryCode ? getCountryLeaderboardKey(countryCode) : LEADERBOARD_KEY;
    const leaderboardType = countryCode ? `country (${countryCode})` : 'global';
    
    console.log(`Getting ${leaderboardType} leaderboard with limit: ${limit}`);
    
    // 获取排行榜前 N 名 (按复合分数降序)
    const topPlayers = await redis.zRevRange(leaderboardKey, 0, limit - 1, { by: 'rank' });
    console.log(`Top players from ${leaderboardType} sorted set:`, topPlayers);
    
    const entries: LeaderboardEntry[] = [];
    
    for (let i = 0; i < topPlayers.length; i++) {
      const playerId = topPlayers[i];
      const playerScoreStr = await redis.hGet(PLAYER_SCORES_KEY, playerId);
      
      console.log(`Getting score for player ${playerId}: ${playerScoreStr}`);
      
      if (playerScoreStr) {
        try {
          const playerScore: PlayerScore = JSON.parse(playerScoreStr);
          
          // 如果是国家排行榜，只包含该国家的玩家
          if (!countryCode || playerScore.countryCode === countryCode.toUpperCase()) {
            entries.push({
              rank: i + 1,
              playerId: playerScore.playerId,
              playerName: playerScore.playerName,
              score: playerScore.score, // 显示原始分数
              roundsCompleted: playerScore.roundsCompleted,
              totalTime: playerScore.totalTime,
              completedAt: playerScore.completedAt,
              difficulty: playerScore.difficulty,
              countryCode: playerScore.countryCode,
              compositeScore: playerScore.compositeScore
            });
          }
        } catch (parseError) {
          console.error(`Error parsing player score for ${playerId}:`, parseError);
        }
      } else {
        console.warn(`No score data found for player ${playerId}`);
      }
    }

    // 获取总玩家数
    const totalPlayers = await redis.zCard(leaderboardKey);
    console.log(`Total players in ${leaderboardType} leaderboard: ${totalPlayers}`);
    
    const result = {
      entries,
      totalPlayers,
      lastUpdated: Date.now(),
      countryCode: countryCode?.toUpperCase()
    };
    
    console.log(`${leaderboardType} leaderboard data prepared:`, result);
    return result;
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return {
      entries: [],
      totalPlayers: 0,
      lastUpdated: Date.now(),
      countryCode: countryCode?.toUpperCase()
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
    console.log(`Getting best score for player: ${playerId}`);
    const playerScoreStr = await redis.hGet(PLAYER_SCORES_KEY, playerId);
    console.log(`Player best score data: ${playerScoreStr}`);
    
    if (playerScoreStr) {
      try {
        return JSON.parse(playerScoreStr);
      } catch (parseError) {
        console.error(`Error parsing player best score for ${playerId}:`, parseError);
        return null;
      }
    }
    return null;
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
    const totalPlayers = await redis.zCard(LEADERBOARD_KEY);
    const stats = {
      totalPlayers,
      lastUpdated: Date.now()
    };
    
    await redis.set(LEADERBOARD_STATS_KEY, JSON.stringify(stats));
    console.log(`Leaderboard stats updated: ${totalPlayers} total players`);
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

/**
 * 调试函数：获取 Redis 中的所有数据
 * Debug function: Get all data from Redis
 */
export async function debugLeaderboard(redis: Context['redis'] | RedisClient): Promise<void> {
  try {
    console.log('=== COMPOSITE SCORE LEADERBOARD DEBUG INFO ===');
    
    // 检查全球 sorted set
    const globalSize = await redis.zCard(LEADERBOARD_KEY);
    console.log(`Global leaderboard sorted set size: ${globalSize}`);
    
    if (globalSize > 0) {
      const allPlayers = await redis.zRevRange(LEADERBOARD_KEY, 0, -1, { by: 'rank' });
      console.log('All players in global sorted set:', allPlayers);
      
      for (const playerId of allPlayers) {
        const compositeScore = await redis.zScore(LEADERBOARD_KEY, playerId);
        console.log(`Player ${playerId} composite score: ${compositeScore}`);
      }
    }
    
    // 检查 hash 中的详细数据
    const allPlayerScores = await redis.hGetAll(PLAYER_SCORES_KEY);
    console.log('All player scores in hash:', Object.keys(allPlayerScores));
    
    for (const [playerId, scoreData] of Object.entries(allPlayerScores)) {
      try {
        const parsed = JSON.parse(scoreData);
        console.log(`Player ${playerId}:`, {
          rounds: parsed.roundsCompleted,
          rawScore: parsed.score,
          compositeScore: parsed.compositeScore,
          country: parsed.countryCode
        });
      } catch (e) {
        console.log(`Player ${playerId} data (unparsed):`, scoreData);
      }
    }
    
    // 检查国家排行榜
    const countryKeys = await redis.keys('country:*:leaderboard');
    console.log('Country leaderboards found:', countryKeys);
    
    for (const countryKey of countryKeys) {
      const countrySize = await redis.zCard(countryKey);
      console.log(`${countryKey} size: ${countrySize}`);
    }
    
    console.log('=== END COMPOSITE SCORE DEBUG INFO ===');
  } catch (error) {
    console.error('Error in debug function:', error);
  }
}