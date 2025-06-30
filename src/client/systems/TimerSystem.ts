/**
 * 计时器系统
 * 负责处理游戏中的各种计时逻辑
 * 
 * @author 开发者A - 游戏核心逻辑负责人
 */

import { GameConfig } from '../types/GameTypes';

export class TimerSystem {
  private config: GameConfig;

  constructor(config: GameConfig) {
    this.config = config;
  }

  /**
   * 更新游戏主计时器 - 现在是正计时（坚持时长）
   * Update main game timer - now counts up (endurance time)
   */
  updateGameTimer(currentTimer: number, deltaTime: number): number {
    return currentTimer + deltaTime;
  }

  /**
   * 更新干扰计时器
   * Update interference timer
   */
  updateInterferenceTimer(currentTimer: number, deltaTime: number): number {
    return Math.max(0, currentTimer - deltaTime);
  }

  /**
   * 更新成功保持计时器
   * Update success hold timer
   */
  updateSuccessHoldTimer(
    currentTimer: number,
    isMaxComfort: boolean,
    deltaTime: number
  ): number {
    if (isMaxComfort) {
      return currentTimer + deltaTime;
    } else {
      return 0;
    }
  }

  /**
   * 检查是否因舒适度过低而失败（支持无敌模式）
   * Check if game failed due to low comfort (supports immortal mode)
   */
  isComfortFailure(currentComfort: number): boolean {
    // 🛡️ 无敌模式下永远不会因舒适度过低失败
    if (this.config.IMMORTAL_MODE) {
      return false; // 无敌模式：死不掉！
    }
    
    return currentComfort <= 0.1; // 正常模式：舒适度降到10%以下时游戏失败
  }

  /**
   * 检查是否达成成功条件
   * Check if success condition is met
   */
  isSuccessHoldComplete(successHoldTimer: number): boolean {
    return successHoldTimer >= this.config.SUCCESS_HOLD_TIME;
  }

  /**
   * 格式化时间显示 - 显示坚持时长
   * Format time display - shows endurance time
   */
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * 获取剩余成功保持时间
   * Get remaining success hold time
   */
  getRemainingSuccessTime(successHoldTimer: number): number {
    return Math.ceil(this.config.SUCCESS_HOLD_TIME - successHoldTimer);
  }

  /**
   * 获取坚持时长（秒）
   * Get endurance duration in seconds
   */
  getEnduranceDuration(gameTimer: number): number {
    return Math.floor(gameTimer);
  }
}