/**
 * 舒适度系统
 * 负责处理游戏中的舒适度变化逻辑
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
   * 更新舒适度基于温度是否在容忍范围内
   * Update comfort based on whether temperature is within tolerance range
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

    // 确保舒适度值在有效范围内 (0-1)
    return Math.max(0, Math.min(1, newComfort));
  }

  /**
   * 获取基于舒适度的猫咪头像
   * Get cat avatar based on comfort level
   */
  getComfortAvatar(comfortLevel: number): string {
    if (comfortLevel >= 0.8) {
      return "/icon-comfortbar-succ.png";
    } else if (comfortLevel <= 0.3) {
      return "/icon-comfortbar-fail.png";
    } else {
      return "/icon-comfortbar-succ.png";
    }
  }

  /**
   * 检查是否达到最大舒适度
   * Check if maximum comfort is reached
   */
  isMaxComfort(comfortLevel: number): boolean {
    return comfortLevel >= 1.0;
  }

  /**
   * 获取舒适度等级描述
   * Get comfort level description
   */
  getComfortDescription(comfortLevel: number): string {
    if (comfortLevel >= 0.8) {
      return "Very Happy";
    } else if (comfortLevel >= 0.6) {
      return "Happy";
    } else if (comfortLevel >= 0.4) {
      return "Neutral";
    } else if (comfortLevel >= 0.2) {
      return "Uncomfortable";
    } else {
      return "Very Unhappy";
    }
  }
}