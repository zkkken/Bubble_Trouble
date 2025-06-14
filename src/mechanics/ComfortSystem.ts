import { GameConfig } from '../types/GameTypes';

/**
 * 舒适度系统 - 负责猫咪舒适度计算和状态管理
 * Comfort System - Handles cat comfort calculation and state management
 */
export class ComfortSystem {
  private config: GameConfig;

  constructor(config: GameConfig) {
    this.config = config;
  }

  /**
   * 更新舒适度基于温度准确性
   * Update comfort based on temperature accuracy
   */
  updateComfort(
    currentComfort: number,
    isInToleranceRange: boolean,
    deltaTime: number
  ): number {
    let newComfort = currentComfort;

    if (isInToleranceRange) {
      newComfort += this.config.COMFORT_CHANGE_RATE * deltaTime;
    } else {
      newComfort -= this.config.COMFORT_CHANGE_RATE * deltaTime;
    }

    // 限制舒适度范围在 0-1 之间
    return Math.max(0, Math.min(1, newComfort));
  }

  /**
   * 获取舒适度对应的颜色
   * Get color based on comfort level
   */
  getComfortColor(comfortLevel: number): string {
    if (comfortLevel >= 0.8) return '#10b981'; // Green
    if (comfortLevel >= 0.5) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  }

  /**
   * 获取舒适度对应的表情
   * Get emoji based on comfort level
   */
  getComfortEmoji(comfortLevel: number): string {
    if (comfortLevel >= 0.8) return '😸'; // Happy cat
    if (comfortLevel >= 0.5) return '😐'; // Neutral cat
    return '🙀'; // Scared cat
  }

  /**
   * 获取舒适度对应的头像
   * Get avatar based on comfort level
   */
  getComfortAvatar(comfortLevel: number): string {
    if (comfortLevel >= 0.8) {
      return "/avatar-yellowsmiley.png"; // Happy cat
    } else if (comfortLevel <= 0.3) {
      return "/avatar-bad.png"; // Unhappy cat
    } else {
      return "/avatar-yellowsmiley.png"; // Neutral/default
    }
  }

  /**
   * 检查是否舒适度过低导致失败
   * Check if comfort is too low causing failure
   */
  isComfortFailure(comfortLevel: number): boolean {
    return comfortLevel <= 0;
  }

  /**
   * 检查是否达到最大舒适度
   * Check if maximum comfort is reached
   */
  isMaxComfort(comfortLevel: number): boolean {
    return comfortLevel >= 1.0;
  }
}