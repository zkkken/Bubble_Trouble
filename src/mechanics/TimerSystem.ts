import { GameConfig, GameStatus } from '../types/GameTypes';
/**
 * 计时系统 - 负责游戏时间管理和成功计时
 * Timer System - Handles game time management and success timing
 */
export class TimerSystem {
  private config: GameConfig;

  constructor(config: GameConfig) {
    this.config = config;
  }

  /**
   * 更新游戏主计时器
   * Update main game timer
   */
  updateGameTimer(currentTimer: number, deltaTime: number): number {
    return Math.max(0, currentTimer - deltaTime);
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
   * 检查是否因时间耗尽而失败
   * Check if game failed due to time running out
   */
  isTimeFailure(gameTimer: number): boolean {
    return gameTimer <= 0;
  }

  /**
   * 检查是否达成成功条件
   * Check if success condition is met
   */
  isSuccessConditionMet(successHoldTimer: number): boolean {
    return successHoldTimer >= this.config.SUCCESS_HOLD_TIME;
  }

  /**
   * 获取剩余成功保持时间
   * Get remaining success hold time
   */
  getRemainingSuccessTime(successHoldTimer: number): number {
    return Math.ceil(this.config.SUCCESS_HOLD_TIME - successHoldTimer);
  }

  /**
   * 获取游戏时间进度（0-1）
   * Get game time progress (0-1)
   */
  getTimeProgress(currentTimer: number): number {
    return currentTimer / this.config.GAME_DURATION;
  }

  /**
   * 获取时间对应的颜色
   * Get color based on remaining time
   */
  getTimeColor(timeProgress: number): string {
    if (timeProgress > 0.6) return '#3b82f6'; // Blue
    if (timeProgress > 0.3) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  }

  /**
   * 格式化显示时间
   * Format display time
   */
  formatTime(seconds: number): string {
    return `${Math.ceil(Math.max(0, seconds))}s`;
  }
}