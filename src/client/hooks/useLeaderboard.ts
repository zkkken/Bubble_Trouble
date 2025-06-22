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
        
        // 检查是否有本地存储的分数数据
        const localScores = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('catComfortGame_score_')) {
            try {
              const scoreData = JSON.parse(localStorage.getItem(key) || '');
              localScores.push(scoreData);
            } catch (e) {
              // 忽略解析错误
            }
          }
        }

        // 如果有本地分数，使用本地分数；否则使用模拟数据
        let entries = [];
        if (localScores.length > 0) {
          entries = localScores
            .sort((a, b) => b.score - a.score)
            .map((score, index) => ({
              rank: index + 1,
              playerId: score.playerId,
              playerName: score.playerName,
              score: score.score,
              roundsCompleted: score.roundsCompleted,
              totalTime: score.totalTime,
              completedAt: score.completedAt,
              difficulty: score.difficulty
            }));
        } else {
          // 创建一些示例数据
          entries = [
            {
              rank: 1,
              playerId: 'demo_player_1',
              playerName: 'CatMaster',
              score: 15750,
              roundsCompleted: 5,
              totalTime: 120,
              completedAt: Date.now() - 86400000,
              difficulty: 'hard' as const
            },
            {
              rank: 2,
              playerId: 'demo_player_2',
              playerName: 'TemperatureKing',
              score: 12300,
              roundsCompleted: 4,
              totalTime: 95,
              completedAt: Date.now() - 172800000,
              difficulty: 'medium' as const
            },
            {
              rank: 3,
              playerId: 'demo_player_3',
              playerName: 'ComfortZone',
              score: 9800,
              roundsCompleted: 3,
              totalTime: 85,
              completedAt: Date.now() - 259200000,
              difficulty: 'medium' as const
            }
          ];
        }

        const mockData: LeaderboardData = {
          entries,
          totalPlayers: Math.max(entries.length, 156),
          lastUpdated: Date.now()
        };

        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        setLeaderboardData(mockData);
        debugLog('Mock leaderboard data loaded', mockData);
      } else {
        // 生产环境：调用真实API
        debugLog('Fetching real leaderboard data from API');
        const response = await fetch('/api/leaderboard');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        debugLog('API response received', result);

        if (result.status === 'success') {
          setLeaderboardData(result.data);
          debugLog('Leaderboard data set successfully', result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch leaderboard');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      debugLog('Error fetching leaderboard', errorMessage);
      console.error('Leaderboard fetch error:', err);
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
        const stored = localStorage.getItem(`catComfortGame_score_${playerId}`);
        if (stored) {
          const playerScore = JSON.parse(stored);
          setPlayerBest(playerScore);
          debugLog('Player best score loaded from localStorage', playerScore);
        } else {
          debugLog('No player best score found in localStorage');
        }
      } else {
        // 生产环境：调用真实API
        const response = await fetch(`/api/player-best?playerId=${playerId}`);
        const result = await response.json();

        if (result.status === 'success' && result.data) {
          setPlayerBest(result.data);
          debugLog('Player best score loaded from API', result.data);
        } else {
          debugLog('No player best score found in API');
        }
      }
    } catch (err) {
      debugLog('Error fetching player best score', err);
      console.error('Player best fetch error:', err);
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

      // 检查是否为新记录
      const existingScoreStr = localStorage.getItem(`catComfortGame_score_${playerId}`);
      let isNewRecord = true;
      if (existingScoreStr) {
        const existingScore = JSON.parse(existingScoreStr);
        isNewRecord = score > existingScore.score;
      }

      // 只有新记录才保存
      if (isNewRecord) {
        const playerScore: PlayerScore = {
          playerId,
          playerName,
          score,
          roundsCompleted,
          totalTime,
          completedAt: Date.now(),
          difficulty
        };

        // 保存到本地存储
        localStorage.setItem(`catComfortGame_score_${playerId}`, JSON.stringify(playerScore));
        localStorage.setItem('catComfortGame_playerBest', JSON.stringify(playerScore));
        
        debugLog('New score saved to localStorage', playerScore);
      }

      // 计算排名（基于所有本地分数）
      const allScores = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('catComfortGame_score_')) {
          try {
            const scoreData = JSON.parse(localStorage.getItem(key) || '');
            allScores.push(scoreData);
          } catch (e) {
            // 忽略解析错误
          }
        }
      }

      allScores.sort((a, b) => b.score - a.score);
      const rank = allScores.findIndex(s => s.playerId === playerId) + 1;

      debugLog('Mock score submitted', { score, rank, isNewRecord });

      return { rank: rank || 1, isNewRecord, score };
    } else {
      // 生产环境：调用真实API
      debugLog('Submitting real score to API', { playerName, roundsCompleted, totalTime, difficulty });
      
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

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      debugLog('Score submission API response', result);

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