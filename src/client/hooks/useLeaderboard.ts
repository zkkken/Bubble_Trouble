/**
 * 排行榜数据管理 Hook
 * Leaderboard Data Management Hook
 * 
 * @author 开发者C - 数据管理负责人
 */

import { useState, useCallback } from 'react';
import { LeaderboardData, PlayerScore } from '../../shared/types/leaderboard';

interface UseLeaderboardReturn {
  leaderboardData: LeaderboardData | null;
  playerBest: PlayerScore | null;
  loading: boolean;
  error: string | null;
  submitScore: (
    playerName: string,
    enduranceDuration: number,
    catAvatarId: string,
    continentId: string,
    // 可选的向后兼容参数
    roundsCompleted?: number,
    totalTime?: number,
    difficulty?: 'easy' | 'medium' | 'hard',
    countryCode?: string
  ) => Promise<{ rank: number; isNewRecord: boolean; enduranceDuration: number; score?: number; compositeScore?: number }>;
  fetchLeaderboard: (countryCode?: string) => Promise<void>;
  fetchPlayerBest: () => Promise<void>;
}

export const useLeaderboard = (): UseLeaderboardReturn => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [playerBest, setPlayerBest] = useState<PlayerScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 生成玩家ID
  const getPlayerId = useCallback((): string => {
    let playerId = localStorage.getItem('catComfortGame_playerId');
    if (!playerId) {
      playerId = 'player_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('catComfortGame_playerId', playerId);
    }
    return playerId;
  }, []);

  // 获取排行榜数据
  const fetchLeaderboard = useCallback(async (countryCode?: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const url = new URL('/api/leaderboard', window.location.origin);
      if (countryCode) {
        url.searchParams.set('countryCode', countryCode);
      }
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.status === 'success') {
        setLeaderboardData(result.data);
      } else {
        throw new Error(result.message || 'Failed to load leaderboard');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error while loading leaderboard';
      setError(errorMessage);
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取玩家最佳成绩
  const fetchPlayerBest = useCallback(async (): Promise<void> => {
    try {
      const playerId = getPlayerId();
      const response = await fetch(`/api/player-best?playerId=${playerId}`);
      const result = await response.json();

      if (result.status === 'success' && result.data) {
        setPlayerBest(result.data);
      }
    } catch (err) {
      console.error('Player best fetch error:', err);
    }
  }, [getPlayerId]);

  // 提交分数
  const submitScore = useCallback(async (
    playerName: string,
    enduranceDuration: number,
    catAvatarId: string,
    continentId: string,
    // 可选的向后兼容参数
    roundsCompleted?: number,
    totalTime?: number,
    difficulty?: 'easy' | 'medium' | 'hard',
    countryCode?: string
  ): Promise<{ rank: number; isNewRecord: boolean; enduranceDuration: number; score?: number; compositeScore?: number }> => {
    const playerId = getPlayerId();

    const response = await fetch('/api/submit-score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        playerId,
        playerName,
        enduranceDuration,
        catAvatarId,
        continentId,
        // 可选的向后兼容字段
        roundsCompleted,
        totalTime,
        difficulty,
        countryCode: countryCode || 'US'
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.status === 'success') {
      return result.data;
    } else {
      throw new Error(result.message || 'Failed to submit score');
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