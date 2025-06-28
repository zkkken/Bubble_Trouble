/**
 * 游戏API服务
 * 处理与后端的数据交互，支持测试模式
 * 
 * @author 开发者C - 服务端API负责人
 */

import { GameState } from '../types/GameTypes';
import { isTestMode, debugLog } from '../config/testMode';

interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

interface GameDataResponse {
  gameState: GameState;
  currentRound: number;
}

class GameApiService {
  private baseUrl = '/api';

  /**
   * 通用的API调用方法
   */
  private async apiCall<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    if (isTestMode()) {
      debugLog('Test mode: API call blocked for', endpoint);
      return {
        status: 'error',
        message: 'API calls are disabled in test mode'
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, options);
      return await response.json();
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 初始化游戏
   */
  async initGame(): Promise<ApiResponse<{ postId: string }>> {
    return this.apiCall('/init');
  }

  /**
   * 获取游戏数据
   */
  async getGameData(): Promise<ApiResponse<GameDataResponse>> {
    return this.apiCall('/game-data');
  }

  /**
   * 更新游戏状态
   */
  async updateGame(deltaTime: number): Promise<ApiResponse<{ gameState: GameState }>> {
    return this.apiCall('/update-game', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deltaTime }),
    });
  }

  /**
   * 处理按钮按下
   */
  async handleButtonPress(
    buttonType: 'plus' | 'minus' | 'center',
    isPressed: boolean
  ): Promise<ApiResponse<{ gameState: GameState }>> {
    return this.apiCall('/button-press', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ buttonType, isPressed }),
    });
  }

  /**
   * 重置游戏
   */
  async resetGame(newRound?: number): Promise<ApiResponse<GameDataResponse>> {
    return this.apiCall('/reset-game', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newRound }),
    });
  }
}

export const gameApiService = new GameApiService();