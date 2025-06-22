/**
 * 排行榜模态框组件
 * Leaderboard Modal Component
 * 
 * @author 开发者B - UI/UX 界面负责人
 */

import React, { useState, useEffect } from 'react';
import { LeaderboardData, LeaderboardEntry } from '../../shared/types/leaderboard';
import { isTestMode, debugLog } from '../config/testMode';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayerScore?: {
    score: number;
    rank: number;
    roundsCompleted: number;
  };
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentPlayerScore
}) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取排行榜数据
  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    
    try {
      debugLog('LeaderboardModal: Starting to fetch leaderboard data');
      
      if (isTestMode()) {
        debugLog('LeaderboardModal: Using test mode');
        
        // 测试模式：从本地存储获取数据
        const localScores = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('catComfortGame_score_')) {
            try {
              const scoreData = JSON.parse(localStorage.getItem(key) || '');
              localScores.push(scoreData);
            } catch (e) {
              debugLog('LeaderboardModal: Error parsing local score', e);
            }
          }
        }

        debugLog('LeaderboardModal: Found local scores', localScores);

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
          // 如果没有本地分数，创建一些示例数据
          debugLog('LeaderboardModal: No local scores found, creating demo data');
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
        await new Promise(resolve => setTimeout(resolve, 300));
        setLeaderboardData(mockData);
        debugLog('LeaderboardModal: Mock data set successfully', mockData);
      } else {
        debugLog('LeaderboardModal: Using production mode, calling API');
        
        const response = await fetch('/api/leaderboard');
        debugLog('LeaderboardModal: API response status', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        debugLog('LeaderboardModal: API response data', result);
        
        if (result.status === 'success') {
          setLeaderboardData(result.data);
          debugLog('LeaderboardModal: Production data set successfully', result.data);
        } else {
          throw new Error(result.message || 'Failed to load leaderboard');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error while loading leaderboard';
      setError(errorMessage);
      debugLog('LeaderboardModal: Error occurred', errorMessage);
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      debugLog('LeaderboardModal: Modal opened, fetching data');
      fetchLeaderboard();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getDifficultyEmoji = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">🏆 Cat Comfort Leaderboard</h2>
              <p className="text-blue-100 mt-1">Top players worldwide</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          
          {/* Current player score */}
          {currentPlayerScore && (
            <div className="mt-4 bg-white bg-opacity-20 rounded-lg p-3">
              <div className="text-center">
                <div className="text-lg font-bold">Your Best Score</div>
                <div className="flex justify-center items-center gap-4 mt-2">
                  <span className="text-xl">🎯 {currentPlayerScore.score.toLocaleString()}</span>
                  <span className="text-lg">📍 Rank #{currentPlayerScore.rank}</span>
                  <span className="text-lg">🎮 {currentPlayerScore.roundsCompleted} rounds</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">Loading leaderboard...</p>
              {isTestMode() && (
                <p className="mt-1 text-sm text-blue-600">Test Mode: Loading local scores</p>
              )}
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-red-500 text-lg">❌ {error}</div>
              <button
                onClick={fetchLeaderboard}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Try Again
              </button>
              {isTestMode() && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Test Mode Debug:</strong> Try playing a game first to generate some scores!
                  </p>
                </div>
              )}
            </div>
          )}

          {leaderboardData && !loading && !error && (
            <div>
              {/* Stats */}
              <div className="mb-6 text-center">
                <div className="text-gray-600">
                  Total Players: <span className="font-bold text-blue-600">{leaderboardData.totalPlayers.toLocaleString()}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Last updated: {formatDate(leaderboardData.lastUpdated)}
                </div>
                {isTestMode() && (
                  <div className="text-xs text-blue-600 mt-1">
                    Test Mode: Showing {leaderboardData.entries.length} local scores
                  </div>
                )}
              </div>

              {/* Leaderboard entries */}
              {leaderboardData.entries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">🐱</div>
                  <div>No scores yet. Be the first to play!</div>
                  {isTestMode() && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Test Mode:</strong> Complete a game and submit your score to see it here!
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboardData.entries.map((entry, index) => (
                    <div
                      key={entry.playerId}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        index < 3 
                          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      {/* Rank and player info */}
                      <div className="flex items-center gap-3">
                        <div className="text-center min-w-[40px]">
                          {index === 0 && <div className="text-2xl">🥇</div>}
                          {index === 1 && <div className="text-2xl">🥈</div>}
                          {index === 2 && <div className="text-2xl">🥉</div>}
                          {index >= 3 && (
                            <div className="text-lg font-bold text-gray-600">#{entry.rank}</div>
                          )}
                        </div>
                        
                        <div>
                          <div className="font-bold text-gray-800">{entry.playerName}</div>
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <span>{getDifficultyEmoji(entry.difficulty)}</span>
                            <span className={getDifficultyColor(entry.difficulty)}>
                              {entry.difficulty.toUpperCase()}
                            </span>
                            <span>•</span>
                            <span>{formatDate(entry.completedAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Score and stats */}
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {entry.score.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {entry.roundsCompleted} rounds • {formatTime(entry.totalTime)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              🎮 Keep playing to improve your rank!
            </div>
            <button
              onClick={onClose}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};