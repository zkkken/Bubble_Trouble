/**
 * 排行榜模态框组件
 * Leaderboard Modal Component
 * 
 * @author 开发者B - UI/UX 界面负责人
 */

import React, { useState, useEffect } from 'react';
import { LeaderboardData, LeaderboardEntry } from '../../shared/types/leaderboard';

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
      const response = await fetch('/api/leaderboard');
      const result = await response.json();
      
      if (result.status === 'success') {
        setLeaderboardData(result.data);
      } else {
        setError(result.message || 'Failed to load leaderboard');
      }
    } catch (err) {
      setError('Network error while loading leaderboard');
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
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
              </div>

              {/* Leaderboard entries */}
              {leaderboardData.entries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">🐱</div>
                  <div>No scores yet. Be the first to play!</div>
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