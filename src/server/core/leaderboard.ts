import { Context } from '@devvit/public-api';

// Simplified data structures
export interface PlayerScore {
  playerId: string;
  playerName: string;
  catAvatarId: string;
  continentId: string;
  enduranceDuration: number;
}

export interface LeaderboardEntry {
  rank: number;
  playerName: string;
  enduranceDuration: number;
}

export interface ContinentRankingInfo {
  continentId: string;
  continentName: string;
  playerCount: number;
  totalDuration: number;
}

const CONTINENTS = {
  NA: { name: 'North America' },
  SA: { name: 'South America' },
  EU: { name: 'Europe' },
  AS: { name: 'Asia' },
  AF: { name: 'Africa' },
  OC: { name: 'Oceania' },
};

const getContinentLeaderboardKey = (continentId: string) => `leaderboard:${continentId}`;

/**
 * Submits a player's score (enduranceDuration).
 */
export async function submitScore({
  redis,
  playerScore,
}: {
  redis: Context['redis'];
  playerScore: PlayerScore;
}): Promise<void> {
  const continentKey = getContinentLeaderboardKey(playerScore.continentId);
  const playerData = JSON.stringify({
    ...playerScore,
    timestamp: Date.now()
  });
  
  try {
    // Store player data in a hash
    await redis.hset(continentKey, {
      [playerScore.playerId]: playerData
    });
    
    console.log(`✅ Score submitted for ${playerScore.playerName}: ${playerScore.enduranceDuration}s`);
  } catch (error: any) {
    if (error.message?.includes('WRONGTYPE')) {
      console.warn(`🔧 Redis key ${continentKey} has wrong type, deleting and recreating...`);
      // Delete the key and try again
      await redis.del(continentKey);
      await redis.hset(continentKey, {
        [playerScore.playerId]: playerData
      });
      console.log(`✅ Score submitted for ${playerScore.playerName}: ${playerScore.enduranceDuration}s (after key reset)`);
    } else {
      throw error;
    }
  }
}

/**
 * Retrieves the leaderboard for a specific continent.
 */
export async function getContinentLeaderboard({
  redis,
  continentId,
  limit = 20,
}: {
  redis: Context['redis'];
  continentId: string;
  limit?: number;
}): Promise<LeaderboardEntry[]> {
  const continentKey = getContinentLeaderboardKey(continentId);
  
  try {
    const playerData = await redis.hgetall(continentKey);
    
    if (!playerData) {
      return [];
    }
    
    // Parse and sort players by enduranceDuration (descending - highest scores first)
    const players: Array<{ playerName: string; enduranceDuration: number }> = [];
    
    for (const [playerId, dataStr] of Object.entries(playerData)) {
      try {
        const data = JSON.parse(dataStr);
        players.push({
          playerName: data.playerName,
          enduranceDuration: data.enduranceDuration
        });
      } catch (error) {
        console.error(`Error parsing player data for ${playerId}:`, error);
      }
    }
    
    // Sort by enduranceDuration (highest first) and limit results
    players.sort((a, b) => b.enduranceDuration - a.enduranceDuration);
    const topPlayers = players.slice(0, limit);
    
    return topPlayers.map((player, index) => ({
      rank: index + 1,
      playerName: player.playerName,
      enduranceDuration: player.enduranceDuration,
    }));
  } catch (error: any) {
    if (error.message?.includes('WRONGTYPE')) {
      console.warn(`🔧 Redis key ${continentKey} has wrong type, deleting and starting fresh...`);
      await redis.del(continentKey);
      return []; // Return empty array for fresh start
    } else {
      throw error;
    }
  }
}

/**
 * Retrieves statistics for all continents.
 */
export async function getContinentRankings({
  redis,
}: {
  redis: Context['redis'];
}): Promise<ContinentRankingInfo[]> {
  console.log('🔍 [getContinentRankings] 开始获取洲际统计...');
  const continentIds = Object.keys(CONTINENTS);
  console.log('🔍 [getContinentRankings] 洲际ID列表:', continentIds);
  const rankings: ContinentRankingInfo[] = [];

  for (const id of continentIds) {
    console.log(`🔍 [getContinentRankings] 处理洲际: ${id}`);
    const continentKey = getContinentLeaderboardKey(id);
    console.log(`🔍 [getContinentRankings] Redis键: ${continentKey}`);
    
    try {
      const playerData = await redis.hgetall(continentKey);
      console.log(`🔍 [getContinentRankings] ${id} 获取数据成功:`, playerData ? 'has data' : 'no data');
      
      let playerCount = 0;
      let totalDuration = 0;
      
      if (playerData) {
        const playerEntries = Object.entries(playerData);
        playerCount = playerEntries.length;
        console.log(`🔍 [getContinentRankings] ${id} 玩家条目数: ${playerCount}`);
        
        for (const [playerId, dataStr] of playerEntries) {
          try {
            const data = JSON.parse(dataStr);
            totalDuration += data.enduranceDuration || 0;
          } catch (error) {
            console.error(`Error parsing player data for ${playerId}:`, error);
          }
        }
      }

      rankings.push({
        continentId: id,
        continentName: CONTINENTS[id as keyof typeof CONTINENTS].name,
        playerCount,
        totalDuration,
      });
      
      console.log(`📊 [${id}] ${CONTINENTS[id as keyof typeof CONTINENTS].name}: ${playerCount} players, ${totalDuration.toFixed(1)}s total`);
    } catch (error: any) {
      if (error.message?.includes('WRONGTYPE')) {
        console.warn(`🔧 [getContinentRankings] Redis key ${continentKey} has wrong type, deleting and starting fresh...`);
        await redis.del(continentKey);
        // Add empty data for this continent
        rankings.push({
          continentId: id,
          continentName: CONTINENTS[id as keyof typeof CONTINENTS].name,
          playerCount: 0,
          totalDuration: 0,
        });
      } else {
        console.error(`🔍 [getContinentRankings] ${id} 处理失败:`, error);
        // 添加空数据以保持数组完整性
        rankings.push({
          continentId: id,
          continentName: CONTINENTS[id as keyof typeof CONTINENTS].name,
          playerCount: 0,
          totalDuration: 0,
        });
      }
    }
  }

  console.log('🔍 [getContinentRankings] 排序前排名数量:', rankings.length);
  // Sort by player count descending
  rankings.sort((a, b) => b.playerCount - a.playerCount);
  console.log('🔍 [getContinentRankings] 排序后完成');

  return rankings;
}