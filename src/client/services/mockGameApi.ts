/**
 * 模拟游戏API服务 - 用于测试模式
 * Mock Game API Service - For test mode
 */

import { GameState } from '../types/GameTypes';
import { debugLog } from '../config/testMode';

interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

interface GameDataResponse {
  gameState: GameState;
  currentRound: number;
}

/**
 * 本地存储键名
 */
const STORAGE_KEYS = {
  GAME_STATE: 'catComfortGame_gameState',
  CURRENT_ROUND: 'catComfortGame_currentRound',
  POST_ID: 'catComfortGame_postId',
};

class MockGameApiService {
  private mockDelay = 50; // 模拟网络延迟

  /**
   * 模拟异步延迟
   */
  private async mockAsync<T>(data: T): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, this.mockDelay));
    return data;
  }

  /**
   * 从本地存储获取数据
   */
  private getFromStorage<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  /**
   * 保存数据到本地存储
   */
  private saveToStorage<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      debugLog('Failed to save to localStorage', error);
    }
  }

  /**
   * 初始化游戏
   */
  async initGame(): Promise<ApiResponse<{ postId: string }>> {
    debugLog('Mock API: Initializing game');
    
    const mockPostId = 'test_post_' + Date.now();
    this.saveToStorage(STORAGE_KEYS.POST_ID, mockPostId);
    
    return this.mockAsync({
      status: 'success',
      data: { postId: mockPostId }
    });
  }

  /**
   * 获取游戏数据
   */
  async getGameData(): Promise<ApiResponse<GameDataResponse>> {
    debugLog('Mock API: Getting game data');
    
    const gameState = this.getFromStorage<GameState | null>(STORAGE_KEYS.GAME_STATE, null);
    const currentRound = this.getFromStorage(STORAGE_KEYS.CURRENT_ROUND, 1);
    
    if (!gameState) {
      return this.mockAsync({
        status: 'error',
        message: 'No game data found. Please initialize game first.'
      });
    }
    
    return this.mockAsync({
      status: 'success',
      data: { gameState, currentRound }
    });
  }

  /**
   * 更新游戏状态
   */
  async updateGame(deltaTime: number): Promise<ApiResponse<{ gameState: GameState }>> {
    debugLog('Mock API: Updating game', { deltaTime });
    
    const gameState = this.getFromStorage<GameState | null>(STORAGE_KEYS.GAME_STATE, null);
    
    if (!gameState) {
      return this.mockAsync({
        status: 'error',
        message: 'No game state found'
      });
    }
    
    // 在测试模式下，我们不在这里更新游戏状态
    // 因为客户端会自己处理游戏逻辑
    return this.mockAsync({
      status: 'success',
      data: { gameState }
    });
  }

  /**
   * 处理按钮按下
   */
  async handleButtonPress(
    buttonType: 'plus' | 'minus' | 'center',
    isPressed: boolean
  ): Promise<ApiResponse<{ gameState: GameState }>> {
    debugLog('Mock API: Button press', { buttonType, isPressed });
    
    const gameState = this.getFromStorage<GameState | null>(STORAGE_KEYS.GAME_STATE, null);
    
    if (!gameState) {
      return this.mockAsync({
        status: 'error',
        message: 'No game state found'
      });
    }
    
    // 在测试模式下，按钮状态由客户端直接管理
    return this.mockAsync({
      status: 'success',
      data: { gameState }
    });
  }

  /**
   * 重置游戏
   */
  async resetGame(newRound?: number): Promise<ApiResponse<GameDataResponse>> {
    debugLog('Mock API: Resetting game', { newRound });
    
    const currentRound = newRound || 1;
    
    // 清除存储的游戏状态，让客户端重新创建
    localStorage.removeItem(STORAGE_KEYS.GAME_STATE);
    this.saveToStorage(STORAGE_KEYS.CURRENT_ROUND, currentRound);
    
    return this.mockAsync({
      status: 'success',
      data: {
        gameState: null as any, // 客户端会重新创建
        currentRound
      }
    });
  }

  /**
   * 保存游戏状态（测试模式专用）
   */
  saveGameState(gameState: GameState): void {
    this.saveToStorage(STORAGE_KEYS.GAME_STATE, gameState);
    debugLog('Mock API: Game state saved', gameState);
  }

  /**
   * 保存当前回合（测试模式专用）
   */
  saveCurrentRound(round: number): void {
    this.saveToStorage(STORAGE_KEYS.CURRENT_ROUND, round);
    debugLog('Mock API: Current round saved', round);
  }
}

export const mockGameApiService = new MockGameApiService();