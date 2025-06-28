/**
 * 排行榜数据管理 Hook (复合分数版本)
 * Leaderboard Data Management Hook (Composite Score Version)
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
    difficulty: 'easy' | 'medium' | 'hard',
    countryCode: string,
    catAvatarId: string,
    continentId: string,
    completionFlag: 'Y' | 'N'
  ) => Promise<{ rank: number; isNewRecord: boolean; score: number; compositeScore: number }>;
  fetchLeaderboard: (countryCode?: string) => Promise<void>;
  fetchPlayerBest: () => Promise<void>;
}

export const useLeaderboard = (): UseLeaderboardReturn => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [playerBest, setPlayerBest] = useState<PlayerScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 复合分数计算常量 (与服务端保持一致)
  const COMPOSITE_SCORE_MULTIPLIER = 10000000;

  // 计算复合分数
  const calculateCompositeScore = useCallback((roundsCompleted: number, rawScore: number): number => {
    return (roundsCompleted * COMPOSITE_SCORE_MULTIPLIER) + rawScore;
  }, []);

  // 计算原始分数 (与服务端逻辑保持一致)
  const calculateRawScore = useCallback((roundsCompleted: number, totalTime: number, difficulty: 'easy' | 'medium' | 'hard'): number => {
    const baseScore = roundsCompleted * 1000;
    const timeBonus = Math.max(0, (180 - totalTime) * 10);
    const comboBonus = roundsCompleted > 1 ? (roundsCompleted - 1) * 500 : 0;
    const difficultyMultiplier = { easy: 1.0, medium: 1.5, hard: 2.0 }[difficulty];
    
    return Math.round((baseScore + timeBonus + comboBonus) * difficultyMultiplier);
  }, []);

  // 判断是否为新的个人最佳
  const isNewPersonalBest = useCallback((
    newRounds: number, 
    newRawScore: number, 
    oldRounds: number, 
    oldRawScore: number
  ): boolean => {
    if (newRounds > oldRounds) return true;
    if (newRounds === oldRounds && newRawScore > oldRawScore) return true;
    return false;
  }, []);

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
  const fetchLeaderboard = useCallback(async (countryCode?: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      if (isTestMode()) {
        // 测试模式：使用模拟数据
        debugLog('Fetching mock composite score leaderboard data', { countryCode });
        
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

        // 过滤国家数据（如果指定了国家代码）
        let filteredScores = localScores;
        if (countryCode) {
          filteredScores = localScores.filter(score => 
            score.countryCode && score.countryCode.toUpperCase() === countryCode.toUpperCase()
          );
        }

        let entries = [];
        if (filteredScores.length > 0) {
          // 按复合分数排序
          entries = filteredScores
            .sort((a, b) => (b.compositeScore || 0) - (a.compositeScore || 0))
            .map((score, index) => ({
              rank: index + 1,
              playerId: score.playerId,
              playerName: score.playerName,
              score: score.score, // 原始分数
              roundsCompleted: score.roundsCompleted,
              totalTime: score.totalTime,
              completedAt: score.completedAt,
              difficulty: score.difficulty,
              countryCode: score.countryCode || 'US',
              compositeScore: score.compositeScore || 0,
              catAvatarId: score.catAvatarId || '🐱',
              continentId: score.continentId || 'NA',
              completionFlag: score.completionFlag || 'Y'
            }));
        } else {
          // 创建一些示例数据
          const countries = countryCode ? [countryCode.toUpperCase()] : ['US', 'CN', 'JP', 'DE', 'GB'];
          entries = [
            {
              rank: 1,
              playerId: 'demo_player_1',
              playerName: 'CompositeKing',
              score: 15750,
              roundsCompleted: 5,
              totalTime: 120,
              completedAt: Date.now() - 86400000,
              difficulty: 'hard' as const,
              countryCode: countries[0],
              compositeScore: calculateCompositeScore(5, 15750),
              catAvatarId: '🦁',
              continentId: 'NA',
              completionFlag: 'Y' as const
            },
            {
              rank: 2,
              playerId: 'demo_player_2',
              playerName: 'RoundMaster',
              score: 12300,
              roundsCompleted: 4,
              totalTime: 95,
              completedAt: Date.now() - 172800000,
              difficulty: 'medium' as const,
              countryCode: countries[Math.min(1, countries.length - 1)],
              compositeScore: calculateCompositeScore(4, 12300),
              catAvatarId: '🐯',
              continentId: 'AS',
              completionFlag: 'Y' as const
            },
            {
              rank: 3,
              playerId: 'demo_player_3',
              playerName: 'ScoreHunter',
              score: 9800,
              roundsCompleted: 3,
              totalTime: 85,
              completedAt: Date.now() - 259200000,
              difficulty: 'medium' as const,
              countryCode: countries[Math.min(2, countries.length - 1)],
              compositeScore: calculateCompositeScore(3, 9800),
              catAvatarId: '😸',
              continentId: 'EU',
              completionFlag: 'Y' as const
            }
          ];
        }

        const mockData: LeaderboardData = {
          entries,
          totalPlayers: Math.max(entries.length, 156),
          lastUpdated: Date.now(),
          countryCode: countryCode?.toUpperCase()
        };

        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 300));
        setLeaderboardData(mockData);
        debugLog('Mock composite score data set successfully', mockData);
      } else {
        debugLog('Using production mode, calling API');
        
        const url = new URL('/api/leaderboard', window.location.origin);
        if (countryCode) {
          url.searchParams.set('countryCode', countryCode);
        }
        
        const response = await fetch(url.toString());
        debugLog('API response status', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        debugLog('API response data', result);
        
        if (result.status === 'success') {
          setLeaderboardData(result.data);
          debugLog('Production composite score data set successfully', result.data);
        } else {
          throw new Error(result.message || 'Failed to load leaderboard');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error while loading leaderboard';
      setError(errorMessage);
      debugLog('Leaderboard fetch error', errorMessage);
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, [calculateCompositeScore]);

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
    difficulty: 'easy' | 'medium' | 'hard',
    countryCode: string,
    catAvatarId: string,
    continentId: string,
    completionFlag: 'Y' | 'N'
  ): Promise<{ rank: number; isNewRecord: boolean; score: number; compositeScore: number }> => {
    const playerId = getPlayerId();

    if (isTestMode()) {
      // 测试模式：模拟复合分数计算和排名
      debugLog('Submitting mock composite score', { 
        playerName, roundsCompleted, totalTime, difficulty, countryCode, catAvatarId, continentId, completionFlag 
      });

      const rawScore = calculateRawScore(roundsCompleted, totalTime, difficulty);
      const compositeScore = calculateCompositeScore(roundsCompleted, rawScore);

      // 检查是否为新记录
      const existingScoreStr = localStorage.getItem(`catComfortGame_score_${playerId}`);
      let isNewRecord = true;
      
      if (existingScoreStr) {
        try {
          const existingScore = JSON.parse(existingScoreStr);
          const oldRounds = existingScore.roundsCompleted || 0;
          const oldRawScore = existingScore.score || 0;
          
          isNewRecord = isNewPersonalBest(roundsCompleted, rawScore, oldRounds, oldRawScore);
          
          debugLog('Composite score comparison', {
            new: { rounds: roundsCompleted, rawScore, compositeScore },
            old: { rounds: oldRounds, rawScore: oldRawScore, compositeScore: existingScore.compositeScore },
            isNewRecord
          });
          
          // 如果不是新记录，返回现有排名
          if (!isNewRecord) {
            const rank = 1; // 简化的排名计算
            return { rank, isNewRecord: false, score: oldRawScore, compositeScore: existingScore.compositeScore };
          }
        } catch (parseError) {
          console.error('Error parsing existing score:', parseError);
        }
      }

      // 只有新记录才保存
      if (isNewRecord) {
        const playerScore: PlayerScore = {
          playerId,
          playerName,
          score: rawScore,
          roundsCompleted,
          totalTime,
          completedAt: Date.now(),
          difficulty,
          countryCode: countryCode.toUpperCase(),
          compositeScore,
          catAvatarId,
          continentId,
          completionFlag
        };

        // 保存到本地存储
        localStorage.setItem(`catComfortGame_score_${playerId}`, JSON.stringify(playerScore));
        localStorage.setItem('catComfortGame_playerBest', JSON.stringify(playerScore));
        
        debugLog('New composite score saved to localStorage', playerScore);
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

      // 按复合分数排序
      allScores.sort((a, b) => (b.compositeScore || 0) - (a.compositeScore || 0));
      const rank = allScores.findIndex(s => s.playerId === playerId) + 1;

      debugLog('Mock composite score submitted', { rawScore, compositeScore, rank, isNewRecord });

      return { rank: rank || 1, isNewRecord, score: rawScore, compositeScore };
    } else {
      // 生产环境：调用真实API
      debugLog('Submitting real composite score to API', { 
        playerName, roundsCompleted, totalTime, difficulty, countryCode, catAvatarId, continentId, completionFlag 
      });
      
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
          difficulty,
          countryCode: countryCode.toUpperCase(),
          catAvatarId,
          continentId,
          completionFlag
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      debugLog('Composite score submission API response', result);

      if (result.status === 'success') {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to submit score');
      }
    }
  }, [getPlayerId, calculateRawScore, calculateCompositeScore, isNewPersonalBest]);

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