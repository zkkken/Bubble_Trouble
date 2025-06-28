/**
 * 游戏状态管理器 - 协调所有游戏系统并管理整体游戏状态
 * Game State Manager - Coordinates all game systems and manages overall game state
 * 
 * @author 开发者A - 游戏核心逻辑负责人
 */

import { GameState, GameConfig } from '../types/GameTypes';
import { TemperatureSystem } from './TemperatureSystem';
import { ComfortSystem } from './ComfortSystem';
import { InterferenceSystem } from './InterferenceSystem';
import { TimerSystem } from './TimerSystem';

export class GameStateManager {
  private temperatureSystem: TemperatureSystem;
  private comfortSystem: ComfortSystem;
  private interferenceSystem: InterferenceSystem;
  private timerSystem: TimerSystem;
  private config: GameConfig;

  constructor(config: GameConfig) {
    this.config = config;
    this.temperatureSystem = new TemperatureSystem(config);
    this.comfortSystem = new ComfortSystem(config);
    this.interferenceSystem = new InterferenceSystem(config);
    this.timerSystem = new TimerSystem(config);
  }

  /**
   * Update game configuration
   */
  updateConfig(newConfig: GameConfig): void {
    this.config = newConfig;
    this.timerSystem = new TimerSystem(newConfig);
  }

  /**
   * 创建初始游戏状态
   * Create initial game state
   */
  createInitialState(): GameState {
    return {
      currentTemperature: this.config.INITIAL_TEMPERATURE,
      targetTemperature: this.temperatureSystem.generateRandomTargetTemperature(),
      toleranceWidth: this.config.TOLERANCE_WIDTH,
      currentComfort: 0.5,
      gameTimer: 0, // 现在从0开始计时（坚持时长）
      successHoldTimer: 0,
      isPlusHeld: false,
      isMinusHeld: false,
      gameStatus: 'playing',
      interferenceEvent: this.interferenceSystem.clearInterferenceEvent(),
      interferenceTimer: this.interferenceSystem.generateRandomInterferenceInterval(),
      isControlsReversed: false,
    };
  }

  /**
   * 更新游戏状态 - 主要的游戏循环逻辑
   * Update game state - Main game loop logic
   */
  updateGameState(currentState: GameState, deltaTime: number): GameState {
    if (currentState.gameStatus !== 'playing') {
      return currentState;
    }

    let newState = { ...currentState };

    // 1. 更新计时器（现在是正计时，记录坚持时长）
    newState.gameTimer = this.timerSystem.updateGameTimer(newState.gameTimer, deltaTime);
    newState.interferenceTimer = this.timerSystem.updateInterferenceTimer(newState.interferenceTimer, deltaTime);

    // 2. 检查舒适度失败条件 - 舒适度过低时游戏结束
    if (this.timerSystem.isComfortFailure(newState.currentComfort)) {
      newState.gameStatus = 'failure';
      return newState;
    }

    // 3. 更新活跃干扰事件的剩余时间
    if (newState.interferenceEvent.isActive) {
      newState.interferenceEvent = {
        ...newState.interferenceEvent,
        remainingTime: newState.interferenceEvent.remainingTime - deltaTime
      };

      // 如果干扰时间耗尽，自动清除干扰
      if (newState.interferenceEvent.remainingTime <= 0) {
        console.log(`🎯 Interference ${newState.interferenceEvent.type} ended`); // Debug log
        newState.interferenceEvent = this.interferenceSystem.clearInterferenceEvent();
        newState.isControlsReversed = false;
        newState.interferenceTimer = this.interferenceSystem.generateRandomInterferenceInterval();
      }
    }

    // 4. 处理新的干扰事件触发
    if (this.interferenceSystem.shouldTriggerInterference(newState.interferenceTimer, newState.interferenceEvent.isActive)) {
      const interferenceType = this.interferenceSystem.getRandomInterferenceType();
      newState.interferenceEvent = this.interferenceSystem.createInterferenceEvent(interferenceType);

      // 应用干扰效果
      switch (interferenceType) {
        case 'controls_reversed':
          newState.isControlsReversed = true;
          break;
        case 'temperature_shock':
          newState.targetTemperature = this.interferenceSystem.applyTemperatureShock();
          break;
        case 'bubble_obstruction':
          // 视觉干扰在UI层处理
          break;
      }
    }

    // 5. 更新温度
    newState.currentTemperature = this.temperatureSystem.updateTemperature(
      newState.currentTemperature,
      newState.isPlusHeld,
      newState.isMinusHeld,
      newState.isControlsReversed,
      deltaTime
    );

    // 6. 更新舒适度
    const isInToleranceRange = this.temperatureSystem.isTemperatureInRange(
      newState.currentTemperature,
      newState.targetTemperature,
      newState.toleranceWidth
    );
    
    newState.currentComfort = this.comfortSystem.updateComfort(
      newState.currentComfort,
      isInToleranceRange,
      deltaTime
    );

    // 7. Comfort can go to 0 but game doesn't end - only when time runs out

    // 8. 更新成功保持计时器（仅用于UI显示，不触发游戏结束）
    const isMaxComfort = this.comfortSystem.isMaxComfort(newState.currentComfort);
    newState.successHoldTimer = this.timerSystem.updateSuccessHoldTimer(
      newState.successHoldTimer,
      isMaxComfort,
      deltaTime
    );

    // 注意：移除了成功条件检查，游戏只会因为舒适度过低而失败
    // 玩家需要尽可能长时间地维持猫咪的舒适度

    return newState;
  }

  /**
   * 处理中心按钮点击（清除干扰）
   * Handle center button click (clear interference)
   */
  handleCenterButtonClick(currentState: GameState): GameState {
    if (!currentState.interferenceEvent.isActive) {
      return currentState;
    }

    // Controls reversed cannot be cleared by clicking
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
   * Reset game state
   */
  resetGameState(): GameState {
    return this.createInitialState();
  }

  // 获取各个系统的实例，供UI组件使用
  getTemperatureSystem(): TemperatureSystem {
    return this.temperatureSystem;
  }

  getComfortSystem(): ComfortSystem {
    return this.comfortSystem;
  }

  getInterferenceSystem(): InterferenceSystem {
    return this.interferenceSystem;
  }

  getTimerSystem(): TimerSystem {
    return this.timerSystem;
  }
}