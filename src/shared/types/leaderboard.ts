/**
 * 排行榜相关类型定义
 * Leaderboard Type Definitions
 */

export interface PlayerScore {
  playerId: string;
  playerName: string;
  enduranceDuration: number; // 坚持时长（秒）- 唯一的评分标准
  catAvatarId: string;    // 选择的猫的ID
  continentId: string;    // 选择的地区ID
  completedAt: number; // timestamp
  
  // 保留的可选字段（向后兼容）
  score?: number;
  roundsCompleted?: number;
  totalTime?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  countryCode?: string;
  compositeScore?: number;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  enduranceDuration: number; // 坚持时长（秒）- 唯一排名依据
  catAvatarId: string;
  continentId: string;
  completedAt: number;
  
  // 保留的可选字段（向后兼容）
  score?: number;
  roundsCompleted?: number;
  totalTime?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  countryCode?: string;
  compositeScore?: number;
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
  enduranceDuration: number; // 坚持时长（秒）
  catAvatarId: string; // 选择的猫的ID
  continentId: string; // 选择的地区ID
  
  // 保留的可选字段（向后兼容）
  score?: number;
  roundsCompleted?: number;
  totalTime?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  countryCode?: string;
}

export interface SubmitScoreResponse {
  status: 'success' | 'error';
  data?: {
    rank: number;
    isNewRecord: boolean;
    enduranceDuration: number; // 坚持时长
    score?: number; // Raw score (optional, for backward compatibility)
    compositeScore?: number; // (optional, for backward compatibility)
  };
  message?: string;
}