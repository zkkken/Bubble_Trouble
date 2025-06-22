/**
 * 排行榜相关类型定义
 * Leaderboard Type Definitions
 */

export interface PlayerScore {
  playerId: string;
  playerName: string;
  score: number;
  roundsCompleted: number;
  totalTime: number;
  completedAt: number; // timestamp
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  score: number;
  roundsCompleted: number;
  totalTime: number;
  completedAt: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  totalPlayers: number;
  lastUpdated: number;
}

export interface LeaderboardResponse {
  status: 'success' | 'error';
  data?: LeaderboardData;
  message?: string;
}

export interface SubmitScoreRequest {
  playerId: string;
  playerName: string;
  score: number;
  roundsCompleted: number;
  totalTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface SubmitScoreResponse {
  status: 'success' | 'error';
  data?: {
    rank: number;
    isNewRecord: boolean;
  };
  message?: string;
}