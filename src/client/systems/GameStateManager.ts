/**
 * 游戏状态管理器 - 协调所有游戏系统并管理整体游戏状态 (V2 - 新机制)
 * Game State Manager - Coordinates all game systems and manages overall game state (V2 - New Mechanics)
 * 
 * @author 开发者A - 游戏核心逻辑负责人 & Gemini
 */

import { GameState, GameConfig } from '../types/GameTypes';
import { InterferenceSystem } from './InterferenceSystem';

// 定义新机制的常量
const TEMP_CLICK_CHANGE = 0.05; // 点击按钮温度变化5%
const TEMP_AUTO_DECREASE_PER_SECOND = 0.05; // 每秒自动下降5%
const COMFORT_CHANGE_PER_SECOND = 0.1; // 舒适度每秒变化10%
const TARGET_TEMP_CHANGE_INTERVAL = 8; // 目标温度变化间隔（秒）
const TOLERANCE_WIDTH = 0.1; // 舒适区域宽度（目标温度±10%）

export class GameStateManager {
  private interferenceSystem: InterferenceSystem;
  private config: GameConfig;
  private timeAccumulator: number = 0;
  private targetTempChangeTimer: number = 0;

  constructor(config: GameConfig) {
    this.config = config;
    this.interferenceSystem = new InterferenceSystem(config);
  }

  updateConfig(newConfig: GameConfig): void {
    this.config = newConfig;
    // If systems depended on config, they would be updated here
  }

  createInitialState(): GameState {
    this.timeAccumulator = 0;
    this.targetTempChangeTimer = TARGET_TEMP_CHANGE_INTERVAL;
    return {
      // 温度和舒适度
      currentTemperature: 0.5, // 初始温度50%
      currentComfort: 0.5, // 初始舒适度50%
      
      // 游戏状态
      gameTimer: 0, // 正向计时器，记录坚持时间
      gameStatus: 'playing',

      // 动态目标温度系统 - 重新启用
      targetTemperature: this.generateRandomTargetTemperature(), // 动态目标温度
      toleranceWidth: TOLERANCE_WIDTH, // 舒适区域宽度
      successHoldTimer: 0,
      isPlusHeld: false, // 保留以兼容现有代码
      isMinusHeld: false, // 保留以兼容现有代码

      // 干扰系统状态
      interferenceEvent: this.interferenceSystem.clearInterferenceEvent(),
      interferenceTimer: this.interferenceSystem.generateRandomInterferenceInterval(),
      isControlsReversed: false,
    };
  }

  /**
   * 生成随机目标温度（避免极端值）
   */
  private generateRandomTargetTemperature(): number {
    // 在0.25-0.75范围内生成目标温度，避免过于极端的值
    return 0.25 + Math.random() * 0.5;
  }

  /**
   * 更新游戏状态 - 主要的游戏循环逻辑 (新机制)
   */
  updateGameState(currentState: GameState, deltaTime: number): GameState {
    if (currentState.gameStatus !== 'playing') {
      return currentState;
    }

    let newState = { ...currentState };
    this.timeAccumulator += deltaTime;

    // 1. 更新正向计时器
    newState.gameTimer += deltaTime;
    newState.interferenceTimer -= deltaTime; // 干扰计时器倒计时

    // 2. 每秒更新一次的逻辑
    if (this.timeAccumulator >= 1) {
      this.timeAccumulator -= 1;

      // 2a. 温度每秒自动下降
      newState.currentTemperature -= TEMP_AUTO_DECREASE_PER_SECOND;

      // 2b. 根据动态目标温度更新舒适度
      const comfortZoneMin = newState.targetTemperature - newState.toleranceWidth;
      const comfortZoneMax = newState.targetTemperature + newState.toleranceWidth;
      const isInComfortZone = newState.currentTemperature >= comfortZoneMin && newState.currentTemperature <= comfortZoneMax;
      
      if (isInComfortZone) {
        newState.currentComfort += COMFORT_CHANGE_PER_SECOND;
      } else {
        newState.currentComfort -= COMFORT_CHANGE_PER_SECOND;
      }

      // 2c. 更新目标温度变化计时器
      this.targetTempChangeTimer -= 1;
      if (this.targetTempChangeTimer <= 0) {
        newState.targetTemperature = this.generateRandomTargetTemperature();
        this.targetTempChangeTimer = TARGET_TEMP_CHANGE_INTERVAL;
        console.log(`🎯 目标温度变化为: ${(newState.targetTemperature * 100).toFixed(0)}°`);
      }
    }
    
    // 3. 确保温度和舒适度在 0-1 范围内 (自动回弹)
    newState.currentTemperature = Math.max(0, Math.min(1, newState.currentTemperature));
    newState.currentComfort = Math.max(0, Math.min(1, newState.currentComfort));

    // 4. 检查游戏失败条件
    if (newState.currentComfort <= 0) {
      newState.gameStatus = 'failure';
      return newState;
    }

    // 5. 更新和触发干扰事件
    if (newState.interferenceEvent.isActive) {
      newState.interferenceEvent.remainingTime -= deltaTime;
      if (newState.interferenceEvent.remainingTime <= 0) {
        newState.interferenceEvent = this.interferenceSystem.clearInterferenceEvent();
        newState.isControlsReversed = false; // 确保反转状态被重置
        newState.interferenceTimer = this.interferenceSystem.generateRandomInterferenceInterval();
      }
    } else if (newState.interferenceTimer <= 0) {
        const interferenceType = this.interferenceSystem.getRandomInterferenceType();
        newState.interferenceEvent = this.interferenceSystem.createInterferenceEvent(interferenceType);
        
        if (interferenceType === 'controls_reversed') {
            newState.isControlsReversed = true;
        }
        // 其他干扰类型目前只产生视觉效果或已在新逻辑中失效
    }

    return newState;
  }

  /**
   * 处理温度增加按钮点击
   */
  handleTempIncrease(currentState: GameState): GameState {
    let newTemp = currentState.currentTemperature + TEMP_CLICK_CHANGE;
    newTemp = Math.min(1, newTemp); 
    return { ...currentState, currentTemperature: newTemp };
  }

  /**
   * 处理温度减少按钮点击
   */
  handleTempDecrease(currentState: GameState): GameState {
    let newTemp = currentState.currentTemperature - TEMP_CLICK_CHANGE;
    newTemp = Math.max(0, newTemp);
    return { ...currentState, currentTemperature: newTemp };
  }
  
  /**
   * 处理中心按钮点击（清除干扰）
   */
  handleCenterButtonClick(currentState: GameState): GameState {
    if (!currentState.interferenceEvent.isActive) {
      return currentState;
    }
    if (!this.interferenceSystem.canBeClearedByClick(currentState.interferenceEvent.type)) {
      return currentState;
    }
    return {
      ...currentState,
      interferenceEvent: this.interferenceSystem.clearInterferenceEvent(),
      isControlsReversed: false,
      interferenceTimer: this.interferenceSystem.generateRandomInterferenceInterval(),
    };
  }

  /**
   * 重置游戏状态
   */
  resetGameState(): GameState {
    return this.createInitialState();
  }

  getInterferenceSystem(): InterferenceSystem {
    return this.interferenceSystem;
  }
}
