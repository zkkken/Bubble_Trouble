/**
 * 排行榜数据管理 Hook
 * Leaderboard Data Management Hook
 * 
 * @author 开发者C - 数据管理负责人
 */

import { useState, useCallback } from 'react';
import { LeaderboardData, PlayerScore } from '../../shared/types/leaderboard';
import { isTestMode, debugLog } from '../config/testMode';

interface UseLeaderboardReturn {
  leaderboardData: LeaderboardData | null;
  playerBest: PlayerScore | null;
  loading: boolean;
  error: string | null;
  submitScore: (
    playerName: string,
    roundsCompleted: number,
    totalTime: number,
    difficulty: 'easy' | 'medium' | 'hard'
  ) => Promise<{ rank: number; isNewRecord: boolean; score: number }>;
  fetchLeaderboard: () => Promise<void>;
  fetchPlayerBest: () => Promise<void>;
}

export const useLeaderboard = (): UseLeaderboardReturn => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [playerBest, setPlayerBest] = useState<PlayerScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 生成测试模式下的玩家ID
  const getPlayerId = useCallback((): string => {
    if (isTestMode()) {
      let playerId = localStorage.getItem('catComfortGame_playerId');
      if (!playerId) {
        playerId = 'test_player_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('catComfortGame_playerId', playerId);
      }
      return playerId;
    }
    // 在生产环境中，这里应该从 Reddit 用户信息获取
    return 'reddit_user_' + Math.random().toString(36).substr(2, 9);
  }, []);

  // 获取排行榜数据
  const fetchLeaderboard = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      if (isTestMode()) {
        // 测试模式：使用模拟数据
        debugLog('Fetching mock leaderboard data');
        
        const mockData: LeaderboardData = {
          entries: [
            {
              rank: 1,
              playerId: 'player1',
              playerName: 'CatMaster',
              score: 15750,
              roundsCompleted: 5,
              totalTime: 120,
              completedAt: Date.now() - 86400000,
              difficulty: 'hard'
            },
            {
              rank: 2,
              playerId: 'player2',
              playerName: 'TemperatureKing',
              score: 12300,
              roundsCompleted: 4,
              totalTime: 95,
              completedAt: Date.now() - 172800000,
              difficulty: 'medium'
            },
            {
              rank: 3,
              playerId: 'player3',
              playerName: 'ComfortZone',
              score: 9800,
              roundsCompleted: 3,
              totalTime: 85,
              completedAt: Date.now() - 259200000,
              difficulty: 'medium'
            }
          ],
          totalPlayers: 156,
          lastUpdated: Date.now()
        };

        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        setLeaderboardData(mockData);
      } else {
        // 生产环境：调用真实API
        const response = await fetch('/api/leaderboard');
        const result = await response.json();

        if (result.status === 'success') {
          setLeaderboardData(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch leaderboard');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      debugLog('Error fetching leaderboard', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取玩家最佳成绩
  const fetchPlayerBest = useCallback(async (): Promise<void> => {
    try {
      const playerId = getPlayerId();

      if (isTestMode()) {
        // 测试模式：从本地存储获取
        const stored = localStorage.getItem('catComfortGame_playerBest');
        if (stored) {
          setPlayerBest(JSON.parse(stored));
        }
      } else {
        // 生产环境：调用真实API
        const response = await fetch(`/api/player-best?playerId=${playerId}`);
        const result = await response.json();

        if (result.status === 'success' && result.data) {
          setPlayerBest(result.data);
        }
      }
    } catch (err) {
      debugLog('Error fetching player best score', err);
    }
  }, [getPlayerId]);

  // 提交分数
  const submitScore = useCallback(async (
    playerName: string,
    roundsCompleted: number,
    totalTime: number,
    difficulty: 'easy' | 'medium' | 'hard'
  ): Promise<{ rank: number; isNewRecord: boolean; score: number }> => {
    const playerId = getPlayerId();

    if (isTestMode()) {
      // 测试模式：模拟分数计算和排名
      debugLog('Submitting mock score', { playerName, roundsCompleted, totalTime, difficulty });

      // 计算分数（与服务端逻辑一致）
      const baseScore = roundsCompleted * 1000;
      const timeBonus = Math.max(0, (180 - totalTime) * 10);
      const comboBonus = roundsCompleted > 1 ? (roundsCompleted - 1) * 500 : 0;
      const difficultyMultiplier = { easy: 1.0, medium: 1.5, hard: 2.0 }[difficulty];
      const score = Math.round((baseScore + timeBonus + comboBonus) * difficultyMultiplier);

      // 保存到本地存储
      const playerScore: PlayerScore = {
        playerId,
        playerName,
        score,
        roundsCompleted,
        totalTime,
        completedAt: Date.now(),
        difficulty
      };

      localStorage.setItem('catComfortGame_playerBest', JSON.stringify(playerScore));

      // 模拟排名（简单计算）
      const rank = Math.max(1, Math.floor(Math.random() * 50) + 1);
      const isNewRecord = true;

      debugLog('Mock score submitted', { score, rank, isNewRecord });

      return { rank, isNewRecord, score };
    } else {
      // 生产环境：调用真实API
      const response = await fetch('/api/submit-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId,
          playerName,
          roundsCompleted,
          totalTime,
          difficulty
        }),
      });

      const result = await response.json();

      if (result.status === 'success') {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to submit score');
      }
    }
  }, [getPlayerId]);

  return {
    leaderboardData,
    playerBest,
    loading,
    error,
    submitScore,
    fetchLeaderboard,
    fetchPlayerBest,
  };
};