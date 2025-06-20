/**
 * 游戏API服务
 * 处理与后端的数据交互，支持测试模式
 * 
 * @author 开发者C - 服务端API负责人
 */

import { GameState } from '../types/GameTypes';
import { isTestMode, debugLog } from '../config/testMode';
import { mockGameApiService } from './mockGameApi';

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
   * 选择使用真实API还是模拟API
   */
  private getApiService() {
    if (isTestMode()) {
      debugLog('Using mock API service');
      return mockGameApiService;
    }
    return this; // 使用真实的API方法
  }

  /**
   * 真实的API调用方法
   */
  private async realApiCall<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
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
    const service = this.getApiService();
    if (service !== this) {
      return service.initGame();
    }

    return this.realApiCall('/init');
  }

  /**
   * 获取游戏数据
   */
  async getGameData(): Promise<ApiResponse<GameDataResponse>> {
    const service = this.getApiService();
    if (service !== this) {
      return service.getGameData();
    }

    return this.realApiCall('/game-data');
  }

  /**
   * 更新游戏状态
   */
  async updateGame(deltaTime: number): Promise<ApiResponse<{ gameState: GameState }>> {
    const service = this.getApiService();
    if (service !== this) {
      return service.updateGame(deltaTime);
    }

    return this.realApiCall('/update-game', {
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
    const service = this.getApiService();
    if (service !== this) {
      return service.handleButtonPress(buttonType, isPressed);
    }

    return this.realApiCall('/button-press', {
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
    const service = this.getApiService();
    if (service !== this) {
      return service.resetGame(newRound);
    }

    return this.realApiCall('/reset-game', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newRound }),
    });
  }
}

export const gameApiService = new GameApiService();

// 导出模拟服务，供测试模式使用
export { mockGameApiService };