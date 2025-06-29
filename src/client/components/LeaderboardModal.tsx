/**
 * 排行榜模态框组件
 * Leaderboard Modal Component
 * 排行榜模态框组件
 * Leaderboard Modal Component
 * 
 * @author 开发者B - UI/UX 界面负责人
 */

import React, { useState, useEffect } from 'react';
import { LeaderboardData, LeaderboardEntry } from '../../shared/types/leaderboard';
import { useResponsiveScale, useResponsiveSize } from '../hooks/useResponsiveScale';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayerScore?: {
    score: number;
    rank: number;
    roundsCompleted: number;
    compositeScore?: number;
  };
  userCountryCode?: string;
}

// 常见国家列表
const COUNTRIES = [
  { code: '', name: 'Global Leaderboard', flag: '🌍' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
];

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentPlayerScore,
  userCountryCode = 'US'
}) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>(''); // 默认显示全球排行榜
  
  // 响应式设计hooks
  const { cssVars } = useResponsiveScale();
  const { scale } = useResponsiveSize();

  // 获取排行榜数据
  const fetchLeaderboard = async (countryCode?: string) => {
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
  };

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard(selectedCountry || undefined);
    }
  }, [isOpen, selectedCountry]);

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
  };

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

  const getCountryFlag = (countryCode: string): string => {
    const country = COUNTRIES.find(c => c.code === countryCode);
    return country?.flag || '🏳️';
  };

  const selectedCountryInfo = COUNTRIES.find(c => c.code === selectedCountry);

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-lg shadow-2xl w-full overflow-hidden"
        style={{
          maxWidth: `${scale(672)}px`, // max-w-2xl = 672px
          maxHeight: '80vh',
          ...cssVars
        }}
      >
        {/* Header */}
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
          style={{ padding: `${scale(24)}px` }}
        >
          <div className="flex justify-between items-center">
            <div>
              <h2 
                className="font-bold"
                style={{ fontSize: `${scale(24)}px` }}
              >
                🏆 Cat Comfort Leaderboard
              </h2>
              <p 
                className="text-blue-100"
                style={{ marginTop: `${scale(4)}px` }}
              >
                {selectedCountryInfo ? selectedCountryInfo.name : 'Global rankings'} - Ranked by endurance time
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 font-bold"
              style={{ fontSize: `${scale(24)}px` }}
            >
              ×
            </button>
          </div>
          
          {/* Country selector */}
          <div style={{ marginTop: `${scale(16)}px` }}>
            <select
              value={selectedCountry}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="bg-white bg-opacity-20 text-white border border-white border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              style={{
                paddingLeft: `${scale(12)}px`,
                paddingRight: `${scale(12)}px`,
                paddingTop: `${scale(8)}px`,
                paddingBottom: `${scale(8)}px`
              }}
            >
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code} className="text-black">
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Current player score */}
          {currentPlayerScore && (
            <div 
              className="bg-white bg-opacity-20 rounded-lg"
              style={{
                marginTop: `${scale(16)}px`,
                padding: `${scale(12)}px`
              }}
            >
              <div className="text-center">
                <div 
                  className="font-bold"
                  style={{ fontSize: `${scale(18)}px` }}
                >
                  Your Best Score
                </div>
                <div 
                  className="flex justify-center items-center"
                  style={{
                    gap: `${scale(16)}px`,
                    marginTop: `${scale(8)}px`
                  }}
                >
                  <span style={{ fontSize: `${scale(20)}px` }}>
                    🎯 {currentPlayerScore.score.toLocaleString()}
                  </span>
                  <span style={{ fontSize: `${scale(18)}px` }}>
                    🎮 {currentPlayerScore.roundsCompleted} rounds
                  </span>
                  <span style={{ fontSize: `${scale(18)}px` }}>
                    📍 Rank #{currentPlayerScore.rank}
                  </span>
                </div>
                {currentPlayerScore.compositeScore && (
                  <div 
                    className="opacity-75"
                    style={{
                      fontSize: `${scale(14)}px`,
                      marginTop: `${scale(4)}px`
                    }}
                  >
                    Composite: {currentPlayerScore.compositeScore.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div 
          className="overflow-y-auto"
          style={{
            padding: `${scale(24)}px`,
            maxHeight: `${scale(384)}px` // max-h-96
          }}
        >
          {loading && (
            <div 
              className="text-center"
              style={{ paddingTop: `${scale(32)}px`, paddingBottom: `${scale(32)}px` }}
            >
              <div 
                className="inline-block animate-spin rounded-full border-b-2 border-blue-500"
                style={{
                  height: `${scale(32)}px`,
                  width: `${scale(32)}px`
                }}
              ></div>
              <p 
                className="text-gray-600"
                style={{ marginTop: `${scale(8)}px` }}
              >
                Loading leaderboard...
              </p>
            </div>
          )}

          {error && (
            <div 
              className="text-center"
              style={{ paddingTop: `${scale(32)}px`, paddingBottom: `${scale(32)}px` }}
            >
              <div 
                className="text-red-500"
                style={{ fontSize: `${scale(18)}px` }}
              >
                ❌ {error}
              </div>
              <button
                onClick={() => fetchLeaderboard(selectedCountry || undefined)}
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
                  <div>No scores yet for {selectedCountryInfo?.name || 'this region'}. Be the first to play!</div>
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
                          <div className="font-bold text-gray-800 flex items-center gap-2">
                            {entry.playerName}
                            <span className="text-sm">{getCountryFlag(entry.countryCode || 'US')}</span>
                            <span className="text-sm">{getCountryFlag(entry.countryCode || 'US')}</span>
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            {entry.difficulty && (
                              <>
                                <span>{getDifficultyEmoji(entry.difficulty)}</span>
                                <span className={getDifficultyColor(entry.difficulty)}>
                                  {entry.difficulty.toUpperCase()}
                                </span>
                                <span>•</span>
                              </>
                            )}
                            {entry.difficulty && (
                              <>
                                <span>{getDifficultyEmoji(entry.difficulty)}</span>
                                <span className={getDifficultyColor(entry.difficulty)}>
                                  {entry.difficulty.toUpperCase()}
                                </span>
                                <span>•</span>
                              </>
                            )}
                            <span>{formatDate(entry.completedAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Score and stats */}
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          ⏱️ {entry.enduranceDuration}s
                          ⏱️ {entry.enduranceDuration}s
                        </div>
                        {entry.roundsCompleted && (
                          <div className="text-sm font-medium text-green-600">
                            🎮 {entry.roundsCompleted} rounds
                          </div>
                        )}
                        {entry.totalTime && (
                          <div className="text-xs text-gray-600">
                            Total: {formatTime(entry.totalTime)}
                        {entry.roundsCompleted && (
                          <div className="text-sm font-medium text-green-600">
                            🎮 {entry.roundsCompleted} rounds
                          </div>
                        )}
                        {entry.totalTime && (
                          <div className="text-xs text-gray-600">
                            Total: {formatTime(entry.totalTime)}
                          </div>
                        )}
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
              🎮 Ranking: Endurance time (how long you survived)!
              🎮 Ranking: Endurance time (how long you survived)!
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