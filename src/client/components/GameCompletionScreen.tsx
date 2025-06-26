/**
 * 游戏结算界面组件
 * 展示全球洲际分布和可交互的洲际排行榜
 * 
 * @author 开发者B - UI/UX 界面负责人
 */

import React, { useState, useEffect } from 'react';
import { isTestMode, debugLog } from '../config/testMode';

// 洲际统计数据接口
interface ContinentStats {
  continentId: string;
  continentName: string;
  playerCount: number;
  flag: string;
}

// 排行榜条目接口
interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  catAvatarId: string;
  continentId: string;
  completionTime: number;
  roundsCompleted: number;
  totalTime: number;
  completedAt: number;
}

// 排行榜数据接口
interface LeaderboardData {
  entries: LeaderboardEntry[];
  totalPlayers: number;
  lastUpdated: number;
  continentId?: string;
}

interface GameCompletionScreenProps {
  onPlayAgain: () => void;
  onBackToStart: () => void;
  gameStats: {
    roundsCompleted: number;
    totalTime: number;
    finalComfort: number;
  };
  playerInfo: {
    playerName: string;
    continentId: string;
    catAvatarId: string;
  };
}

export const GameCompletionScreen: React.FC<GameCompletionScreenProps> = ({
  onPlayAgain,
  onBackToStart,
  gameStats,
  playerInfo,
}) => {
  // 状态管理
  const [continentStats, setContinentStats] = useState<ContinentStats[]>([]);
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取洲际统计数据
  const fetchContinentStats = async () => {
    try {
      debugLog('GameCompletionScreen: Fetching continent statistics');
      
      if (isTestMode()) {
        // 测试模式：生成模拟数据
        const mockStats: ContinentStats[] = [
          { continentId: 'AS', continentName: 'Asia', playerCount: 1247, flag: '🌏' },
          { continentId: 'EU', continentName: 'Europe', playerCount: 892, flag: '🌍' },
          { continentId: 'NA', continentName: 'North America', playerCount: 756, flag: '🌎' },
          { continentId: 'SA', continentName: 'South America', playerCount: 423, flag: '🌎' },
          { continentId: 'AF', continentName: 'Africa', playerCount: 334, flag: '🌍' },
          { continentId: 'OC', continentName: 'Oceania', playerCount: 156, flag: '🌏' },
        ];
        
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        setContinentStats(mockStats);
        debugLog('GameCompletionScreen: Mock continent stats loaded', mockStats);
      } else {
        // 生产环境：调用真实API
        const response = await fetch('/api/leaderboard/stats');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        if (result.status === 'success') {
          setContinentStats(result.data);
          debugLog('GameCompletionScreen: Real continent stats loaded', result.data);
        } else {
          throw new Error(result.message || 'Failed to load continent statistics');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error while loading continent statistics';
      setError(errorMessage);
      debugLog('GameCompletionScreen: Error loading continent stats', errorMessage);
      console.error('Error fetching continent stats:', err);
    }
  };

  // 获取洲际排行榜数据
  const fetchContinentLeaderboard = async (continentId: string) => {
    try {
      setLoading(true);
      debugLog('GameCompletionScreen: Fetching continent leaderboard', { continentId });
      
      if (isTestMode()) {
        // 测试模式：生成模拟排行榜数据
        const mockLeaderboard: LeaderboardData = {
          entries: [
            {
              rank: 1,
              playerId: 'player_1',
              playerName: 'TimeKeeper',
              catAvatarId: '🦁',
              continentId,
              completionTime: 180,
              roundsCompleted: 5,
              totalTime: 180,
              completedAt: Date.now() - 86400000
            },
            {
              rank: 2,
              playerId: 'player_2',
              playerName: 'SlowAndSteady',
              catAvatarId: '🐯',
              continentId,
              completionTime: 165,
              roundsCompleted: 4,
              totalTime: 165,
              completedAt: Date.now() - 172800000
            },
            {
              rank: 3,
              playerId: 'player_3',
              playerName: 'PatientPlayer',
              catAvatarId: '😸',
              continentId,
              completionTime: 150,
              roundsCompleted: 3,
              totalTime: 150,
              completedAt: Date.now() - 259200000
            },
            {
              rank: 4,
              playerId: 'player_4',
              playerName: 'CalmCat',
              catAvatarId: '😻',
              continentId,
              completionTime: 135,
              roundsCompleted: 3,
              totalTime: 135,
              completedAt: Date.now() - 345600000
            },
            {
              rank: 5,
              playerId: 'player_5',
              playerName: 'RelaxedGamer',
              catAvatarId: '🐱',
              continentId,
              completionTime: 120,
              roundsCompleted: 2,
              totalTime: 120,
              completedAt: Date.now() - 432000000
            }
          ],
          totalPlayers: 50,
          lastUpdated: Date.now(),
          continentId
        };
        
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 300));
        setLeaderboardData(mockLeaderboard);
        debugLog('GameCompletionScreen: Mock continent leaderboard loaded', mockLeaderboard);
      } else {
        // 生产环境：调用真实API
        const response = await fetch(`/api/leaderboard?continentId=${continentId}&limit=50`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        if (result.status === 'success') {
          setLeaderboardData(result.data);
          debugLog('GameCompletionScreen: Real continent leaderboard loaded', result.data);
        } else {
          throw new Error(result.message || 'Failed to load continent leaderboard');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error while loading continent leaderboard';
      setError(errorMessage);
      debugLog('GameCompletionScreen: Error loading continent leaderboard', errorMessage);
      console.error('Error fetching continent leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // 初始化时获取洲际统计数据
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await fetchContinentStats();
      setLoading(false);
    };
    
    initializeData();
  }, []);

  // 处理洲际选择
  const handleContinentSelect = (continentId: string) => {
    setSelectedContinent(continentId);
    setLeaderboardData(null);
    fetchContinentLeaderboard(continentId);
  };

  // 返回洲际视图
  const handleBackToContinents = () => {
    setSelectedContinent(null);
    setLeaderboardData(null);
  };

  // 格式化时间
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 格式化日期
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString();
  };

  // 获取玩家数最多的洲际
  const getTopContinent = (): ContinentStats | null => {
    if (continentStats.length === 0) return null;
    return continentStats.reduce((prev, current) => 
      prev.playerCount > current.playerCount ? prev : current
    );
  };

  const topContinent = getTopContinent();
  const isSuccess = gameStats.roundsCompleted > 0 && gameStats.finalComfort >= 0.8;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`${isSuccess ? 'bg-gradient-to-r from-green-500 to-blue-600' : 'bg-gradient-to-r from-red-500 to-orange-600'} text-white p-6`}>
          <div className="text-center">
            <div className="text-4xl mb-2">{isSuccess ? '🎉' : '😿'}</div>
            <h2 className="text-3xl font-bold">
              {isSuccess ? 'Game Complete!' : 'Game Over'}
            </h2>
            <p className={`${isSuccess ? 'text-green-100' : 'text-red-100'} mt-1`}>
              {selectedContinent ? 'Continental Leaderboard' : 'Global Player Distribution'}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading && !selectedContinent && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">Loading global statistics...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-red-500 text-lg">❌ {error}</div>
              <button
                onClick={() => {
                  setError(null);
                  if (selectedContinent) {
                    fetchContinentLeaderboard(selectedContinent);
                  } else {
                    fetchContinentStats();
                  }
                }}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          )}

          {/* 洲际统计视图 (默认视图) */}
          {!selectedContinent && !loading && !error && (
            <div>
              {/* 玩家信息和游戏统计 */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{playerInfo.catAvatarId}</div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{playerInfo.playerName}</h3>
                      <p className="text-gray-600">From {playerInfo.continentId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Your Performance</div>
                    <div className="font-bold text-blue-600">
                      {gameStats.roundsCompleted} rounds • {formatTime(gameStats.totalTime)}
                    </div>
                  </div>
                </div>
              </div>

              {/* 全球洲际分布 */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                  🌍 Global Player Distribution
                </h3>
                
                {topContinent && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <div className="text-center">
                      <span className="text-yellow-800 font-medium">
                        🏆 Most Active Continent: {topContinent.flag} {topContinent.continentName} 
                        ({topContinent.playerCount.toLocaleString()} players)
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {continentStats.map((continent) => (
                    <button
                      key={continent.continentId}
                      onClick={() => handleContinentSelect(continent.continentId)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                        continent.continentId === topContinent?.continentId
                          ? 'border-yellow-400 bg-yellow-50 shadow-lg'
                          : 'border-gray-200 hover:border-blue-300 bg-white'
                      }`}
                    >
                      <div className="text-3xl mb-2">{continent.flag}</div>
                      <div className="font-semibold text-gray-800">{continent.continentName}</div>
                      <div className="text-lg font-bold text-blue-600 mt-1">
                        {continent.playerCount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">players</div>
                      {continent.continentId === topContinent?.continentId && (
                        <div className="text-xs text-yellow-600 font-bold mt-1">👑 Most Active</div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="text-center mt-4">
                  <p className="text-gray-600 text-sm">
                    Click on any continent to view its leaderboard
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 洲际排行榜视图 */}
          {selectedContinent && (
            <div>
              {/* 返回按钮和标题 */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handleBackToContinents}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  ← Back to Continents
                </button>
                <h3 className="text-xl font-bold text-gray-800">
                  {continentStats.find(c => c.continentId === selectedContinent)?.flag} {' '}
                  {continentStats.find(c => c.continentId === selectedContinent)?.continentName} Leaderboard
                </h3>
                <div></div>
              </div>

              {loading && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="mt-2 text-gray-600">Loading continent leaderboard...</p>
                </div>
              )}

              {leaderboardData && !loading && (
                <div>
                  {/* 排行榜统计 */}
                  <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <div className="text-center">
                      <div className="text-blue-800 font-bold text-lg">
                        {leaderboardData.totalPlayers.toLocaleString()} Total Players
                      </div>
                      <div className="text-blue-600 text-sm mt-1">
                        Ranked by completion time (longest first)
                      </div>
                    </div>
                  </div>

                  {/* 排行榜列表 */}
                  {leaderboardData.entries.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-4">🐱</div>
                      <div>No players yet from this continent. Be the first to play!</div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {leaderboardData.entries.map((entry, index) => (
                        <div
                          key={entry.playerId}
                          className={`flex items-center justify-between p-4 rounded-lg border ${
                            index < 3 
                              ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          {/* 排名和玩家信息 */}
                          <div className="flex items-center gap-4">
                            <div className="text-center min-w-[50px]">
                              {index === 0 && <div className="text-3xl">🥇</div>}
                              {index === 1 && <div className="text-3xl">🥈</div>}
                              {index === 2 && <div className="text-3xl">🥉</div>}
                              {index >= 3 && (
                                <div className="text-xl font-bold text-gray-600">#{entry.rank}</div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="text-3xl">{entry.catAvatarId}</div>
                              <div>
                                <div className="font-bold text-gray-800 text-lg">
                                  {entry.playerName}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {formatDate(entry.completedAt)}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 成绩信息 */}
                          <div className="text-right">
                            <div className="text-xl font-bold text-green-600">
                              ⏱️ {formatTime(entry.completionTime)}
                            </div>
                            <div className="text-sm text-blue-600">
                              🎮 {entry.roundsCompleted} rounds
                            </div>
                            <div className="text-xs text-gray-500">
                              Total: {formatTime(entry.totalTime)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              🏆 Ranking: Completion time (longest first)
            </div>
            <div className="flex gap-3">
              <button
                onClick={onPlayAgain}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
              >
                🎮 Play Again
              </button>
              <button
                onClick={onBackToStart}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium"
              >
                🏠 Back to Start
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};