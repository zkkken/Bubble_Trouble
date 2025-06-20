/**
 * 舒适度管理系统
 * 负责处理猫咪舒适度的计算和状态变化
 * 
 * @author 开发者A - 游戏核心逻辑负责人
 */

import { GameConfig } from '../types/GameTypes';

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
   * 检查是否达到最大舒适度
   * Check if maximum comfort is reached
   */
  isMaxComfort(comfortLevel: number): boolean {
    return comfortLevel >= 1.0;
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
}