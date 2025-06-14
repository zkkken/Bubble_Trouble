import { GameState, GameConfig } from '../types/GameTypes';

/**
 * 温度系统 - 负责温度控制和变化逻辑
 * Temperature System - Handles temperature control and changes
 */
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
    deltaTime: number
  ): number {
    // 考虑控制反转
    const effectivePlusHeld = isControlsReversed ? isMinusHeld : isPlusHeld;
    const effectiveMinusHeld = isControlsReversed ? isPlusHeld : isMinusHeld;

    let newTemperature = currentTemperature;

    if (effectivePlusHeld) {
      newTemperature += this.config.TEMPERATURE_CHANGE_RATE * deltaTime;
    } else if (effectiveMinusHeld) {
      newTemperature -= this.config.TEMPERATURE_CHANGE_RATE * deltaTime;
    } else {
      // 自然冷却
      newTemperature -= this.config.TEMPERATURE_COOLING_RATE * deltaTime;
    }

    // 限制温度范围在 0-1 之间
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
}