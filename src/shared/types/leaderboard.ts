/**
 * 排行榜相关类型定义
 * Leaderboard Type Definitions
 */

export interface PlayerScore {
  playerId: string;
  playerName: string;
  score: number; // This will be the raw game score
  roundsCompleted: number;
  totalTime: number;
  completedAt: number; // timestamp
  difficulty: 'easy' | 'medium' | 'hard';
  countryCode: string; // ISO 3166-1 alpha-2 country code
  compositeScore: number; // Calculated composite score for ranking
  
  // 新增字段
  catAvatarId: string;    // 猫咪头像ID
  continentId: string;    // 大洲ID
  completionFlag: 'Y' | 'N'; // 通关标志
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  score: number; // Raw game score for display
  roundsCompleted: number;
  totalTime: number;
  completedAt: number;
  difficulty: 'easy' | 'medium' | 'hard';
  countryCode: string;
  compositeScore: number; // For debugging/verification
  
  // 新增字段
  catAvatarId: string;
  continentId: string;
  completionFlag: 'Y' | 'N';
}

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  totalPlayers: number;
  lastUpdated: number;
  countryCode?: string; // If this is a country-specific leaderboard
}

export interface LeaderboardResponse {
  status: 'success' | 'error';
  data?: LeaderboardData;
  message?: string;
}

export interface SubmitScoreRequest {
  playerId: string;
  playerName: string;
  score: number; // Raw game score
  roundsCompleted: number;
  totalTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  countryCode: string;
  catAvatarId: string;
  continentId: string;
  completionFlag: 'Y' | 'N';
}

export interface SubmitScoreResponse {
  status: 'success' | 'error';
  data?: {
    rank: number;
    isNewRecord: boolean;
    score: number; // Raw score
    compositeScore: number;
  };
  message?: string;
}