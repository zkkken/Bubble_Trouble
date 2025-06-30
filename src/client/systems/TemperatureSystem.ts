/**
 * 温度控制系统
 * 负责处理游戏中的温度变化逻辑
 * 
 * @author 开发者A - 游戏核心逻辑负责人
 */

import { GameConfig } from '../types/GameTypes';

export class TemperatureSystem {
  private config: GameConfig;

  constructor(config: GameConfig) {
    this.config = config;
  }

  /**
   * 更新温度基于按钮状态
   * Update temperature based on button states
   */
  updateTemperature(
    currentTemperature: number,
    isPlusHeld: boolean,
    isMinusHeld: boolean,
    isControlsReversed: boolean,
    deltaTime: number,
    coolingMultiplier: number = 1 // 新增：冷却速率倍数参数
  ): number {
    // 🎯 关键：控制反转逻辑 - 当 isControlsReversed 为 true 时，按钮功能互换
    const effectivePlusHeld = isControlsReversed ? isMinusHeld : isPlusHeld;
    const effectiveMinusHeld = isControlsReversed ? isPlusHeld : isMinusHeld;

    let newTemperature = currentTemperature;

    if (effectivePlusHeld) {
      newTemperature += this.config.TEMPERATURE_CHANGE_RATE * deltaTime;
    } else if (effectiveMinusHeld) {
      newTemperature -= this.config.TEMPERATURE_CHANGE_RATE * deltaTime;
    } else {
      // 自然冷却：当没有按钮被按下时，温度会自然下降
      // 应用冷风效果的冷却倍数
      newTemperature -= this.config.TEMPERATURE_COOLING_RATE * deltaTime * coolingMultiplier;
    }

    // 确保温度值在有效范围内 (0-1)
    return Math.max(0, Math.min(1, newTemperature));
  }

  /**
   * 生成随机目标温度
   * Generate random target temperature
   */
  generateRandomTargetTemperature(): number {
    return Math.random() * 
      (this.config.TARGET_TEMPERATURE_MAX - this.config.TARGET_TEMPERATURE_MIN) + 
      this.config.TARGET_TEMPERATURE_MIN;
  }

  /**
   * 检查温度是否在容忍范围内
   * Check if temperature is within tolerance range
   */
  isTemperatureInRange(
    currentTemperature: number,
    targetTemperature: number,
    toleranceWidth: number
  ): boolean {
    const temperatureDifference = Math.abs(currentTemperature - targetTemperature);
    return temperatureDifference <= toleranceWidth;
  }

  /**
   * 获取温度差异
   * Get temperature difference
   */
  getTemperatureDifference(
    currentTemperature: number,
    targetTemperature: number
  ): number {
    return Math.abs(currentTemperature - targetTemperature);
  }

  /**
   * 计算带偏移的显示温度（用于漏电效果）
   * Calculate display temperature with offset (for electric leakage effect)
   */
  getDisplayTemperature(actualTemperature: number, temperatureOffset: number): number {
    const displayTemp = actualTemperature + temperatureOffset;
    // 确保显示温度也在0-1范围内，但不影响实际温度
    return Math.max(0, Math.min(1, displayTemp));
  }
}