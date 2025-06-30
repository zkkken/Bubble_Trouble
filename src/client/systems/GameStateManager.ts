/**
 * 游戏状态管理器 - 协调所有游戏系统并管理整体游戏状态 (V2.2 - 新机制)
 * Game State Manager - Coordinates all game systems and manages overall game state (V2.2 - New Mechanics)
 * 
 * @author 开发者A - 游戏核心逻辑负责人 & Gemini
 */

import { GameState, GameConfig, BubbleTimeState } from '../types/GameTypes';
import { InterferenceSystem } from './InterferenceSystem';

// 定义新机制的常量 - 按照用户详细规格
const TEMP_CLICK_CHANGE = 0.05; // 点击按钮温度变化5%
const TEMP_AUTO_DECREASE_PER_SECOND = 0.15; // 每秒自动下降15% (与舒适度变化速度同步)
const COMFORT_CHANGE_PER_SECOND = 0.15; // 舒适度每秒变化15% (1.2% per 80ms = 15%/秒)
const COMFORT_UPDATE_INTERVAL = 0.08; // 舒适度更新间隔80ms
const TARGET_TEMP_CHANGE_INTERVAL = 8; // 目标温度变化间隔（秒）
const TOLERANCE_WIDTH = 0.1; // 舒适区域宽度（目标温度±10%）
// 固定舒适区域：60%-80% (按照用户规格)
const FIXED_COMFORT_ZONE_MIN = 0.6; // 60%
const FIXED_COMFORT_ZONE_MAX = 0.8; // 80%

// 新增：温度指针掉落机制常量
const TEMP_DROP_INTERVAL = 0.04; // 40ms间隔
const TEMP_DROP_AMOUNT = 0.006; // 单次减量0.6%

export class GameStateManager {
  private interferenceSystem: InterferenceSystem;
  private config: GameConfig;
  private timeAccumulator: number = 0;
  private comfortUpdateAccumulator: number = 0; // 舒适度更新计时器 (80ms间隔)
  private targetTempChangeTimer: number = 0;
  private electricLeakageTimer: number = 0; // 漏电偏移更新计时器
  private fallingObjectSpawnTimer: number = 0; // 掉落物品生成计时器
  private tempDropAccumulator: number = 0; // 温度掉落计时器 (40ms间隔)

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
    this.comfortUpdateAccumulator = 0;
    this.targetTempChangeTimer = TARGET_TEMP_CHANGE_INTERVAL;
    this.electricLeakageTimer = 0;
    this.fallingObjectSpawnTimer = 0;
    this.tempDropAccumulator = 0;
    
    const initialBubbleState: BubbleTimeState = {
      isActive: false,
      bubbles: [],
      lastClickTime: 0,
      rhythmClickCount: 0,
    };

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

      // 新增：干扰机制相关状态
      temperatureOffset: 0, // 漏电效果：温度指针显示偏移
      temperatureCoolingMultiplier: 1, // 冷风效果：冷却速率倍数
      bubbleTimeState: initialBubbleState, // 泡泡时间状态
      fallingObjects: [], // 惊喜掉落物品
      windObjects: [], // 冷风效果：风效果对象

      // 新增：Tap图标旋转状态
      tapIconRotation: 0, // 当前旋转角度
      tapIconAnimationTrigger: 0, // 动画触发计数器
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
    this.comfortUpdateAccumulator += deltaTime;
    this.tempDropAccumulator += deltaTime;

    // 1. 更新正向计时器
    newState.gameTimer += deltaTime;
    newState.interferenceTimer -= deltaTime; // 干扰计时器倒计时

    // 2. 新增：温度指针掉落机制 - 40ms间隔，0.6%减量 = 15%/秒
    if (this.tempDropAccumulator >= TEMP_DROP_INTERVAL) {
      this.tempDropAccumulator -= TEMP_DROP_INTERVAL;
      
      // 应用冷风效果的冷却倍数
      const dropAmount = TEMP_DROP_AMOUNT * newState.temperatureCoolingMultiplier;
      newState.currentTemperature = Math.max(0, newState.currentTemperature - dropAmount);
    }

    // 3. 每80ms更新舒适度 - 按照用户规格
    if (this.comfortUpdateAccumulator >= COMFORT_UPDATE_INTERVAL) {
      this.comfortUpdateAccumulator -= COMFORT_UPDATE_INTERVAL;

      // 3a. 基于固定60%-80%区域更新舒适度
      const currentTemp = newState.currentTemperature;
      const isInFixedComfortZone = currentTemp >= FIXED_COMFORT_ZONE_MIN && currentTemp <= FIXED_COMFORT_ZONE_MAX;
      
      if (isInFixedComfortZone) {
        // 在60%-80%区域内，每80ms +1.2% (15%/秒)
        newState.currentComfort += COMFORT_CHANGE_PER_SECOND * COMFORT_UPDATE_INTERVAL;
      } else {
        // 在60%-80%区域外，每80ms -1.2% (15%/秒)
        newState.currentComfort -= COMFORT_CHANGE_PER_SECOND * COMFORT_UPDATE_INTERVAL;
      }
    }

    // 4. 每秒更新一次的逻辑
    if (this.timeAccumulator >= 1) {
      this.timeAccumulator -= 1;

      // 4a. 更新目标温度变化计时器（保留用于显示，但不影响舒适度计算）
      this.targetTempChangeTimer -= 1;
      if (this.targetTempChangeTimer <= 0) {
        newState.targetTemperature = this.generateRandomTargetTemperature();
        this.targetTempChangeTimer = TARGET_TEMP_CHANGE_INTERVAL;
      }
    }

    // 处理干扰效果的特殊逻辑
    this.handleInterferenceEffects(newState, deltaTime);

    // 6. 确保温度和舒适度在 0-1 范围内 (自动回弹)
    newState.currentTemperature = Math.max(0, Math.min(1, newState.currentTemperature));
    newState.currentComfort = Math.max(0, Math.min(1, newState.currentComfort));

    // 7. 检查游戏失败条件 (正常模式)
    if (newState.currentComfort <= 0) {
      newState.gameStatus = 'failure';
      return newState;
    }

    // 8. 更新和触发干扰事件
    if (newState.interferenceEvent.isActive) {
      newState.interferenceEvent.remainingTime -= deltaTime;
      if (newState.interferenceEvent.remainingTime <= 0) {
        newState = this.clearInterferenceEffects(newState);
        newState.interferenceEvent = this.interferenceSystem.clearInterferenceEvent();
        newState.interferenceTimer = this.interferenceSystem.generateRandomInterferenceInterval();
      }
    } else if (newState.interferenceTimer <= 0) {
        const interferenceType = this.interferenceSystem.getRandomInterferenceType();
        newState.interferenceEvent = this.interferenceSystem.createInterferenceEvent(interferenceType);
        newState = this.activateInterferenceEffects(newState, interferenceType);
    }

    return newState;
  }

  /**
   * 处理干扰效果的特殊逻辑
   */
  private handleInterferenceEffects(state: GameState, deltaTime: number): void {
    // 处理漏电效果：定期更新温度偏移
    if (state.interferenceEvent.type === 'electric_leakage' && state.interferenceEvent.isActive) {
      this.electricLeakageTimer += deltaTime;
      if (this.electricLeakageTimer >= 1) { // 每秒更新一次偏移
        state.temperatureOffset = this.interferenceSystem.generateElectricLeakageOffset();
        this.electricLeakageTimer = 0;
      }
    }

    // 处理泡泡时间：60fps动画循环更新泡泡位置
    if (state.interferenceEvent.type === 'bubble_time' && state.bubbleTimeState.isActive) {
      state.bubbleTimeState.bubbles = this.interferenceSystem.updateBubbles(state.bubbleTimeState.bubbles);
    }

    // 处理惊喜掉落：间隔生成和更新掉落物品 (Devvit风格实现)
    if (state.interferenceEvent.type === 'surprise_drop' && state.interferenceEvent.isActive) {
      // 使用间隔生成器：每1.5-3秒生成一个新物品
      this.fallingObjectSpawnTimer += deltaTime;
      const spawnInterval = 1.5 + Math.random() * 1.5; // 1.5-3秒间隔
      
      if (this.fallingObjectSpawnTimer >= spawnInterval) {
        const newObject = this.interferenceSystem.generateFallingObject();
        state.fallingObjects.push(newObject);
        this.fallingObjectSpawnTimer = 0;
      }

      // 更新所有掉落物品的位置
      state.fallingObjects = this.interferenceSystem.updateFallingObjects(state.fallingObjects, deltaTime);
    }
  }

  /**
   * 激活干扰效果
   */
  private activateInterferenceEffects(state: GameState, interferenceType: string): GameState {
    switch (interferenceType) {
      case 'controls_reversed':
        state.isControlsReversed = true;
        break;
      case 'electric_leakage':
        state.temperatureOffset = this.interferenceSystem.generateElectricLeakageOffset();
        this.electricLeakageTimer = 0;
        break;
      case 'cold_wind':
        state.temperatureCoolingMultiplier = this.interferenceSystem.getColdWindCoolingMultiplier();
        break;
      case 'bubble_time':
        state.bubbleTimeState = this.interferenceSystem.createBubbleTimeState();
        break;
      case 'surprise_drop':
        state.fallingObjects = [];
        this.fallingObjectSpawnTimer = 0;
        break;
    }
    return state;
  }

  /**
   * 清除干扰效果
   */
  private clearInterferenceEffects(state: GameState): GameState {
    state.isControlsReversed = false;
    state.temperatureOffset = 0;
    state.temperatureCoolingMultiplier = 1;
    state.bubbleTimeState = {
      isActive: false,
      bubbles: [],
      lastClickTime: 0,
      rhythmClickCount: 0,
    };
    state.fallingObjects = [];
    state.windObjects = [];
    return state;
  }

  /**
   * 处理温度增加按钮点击
   */
  handleTempIncrease(currentState: GameState): GameState {
    let newTemp = currentState.currentTemperature + TEMP_CLICK_CHANGE;
    newTemp = Math.min(1, newTemp); 
    
    // 新增：Tap图标顺时针旋转90度
    const newRotation = currentState.tapIconRotation + 90;
    const newAnimationTrigger = currentState.tapIconAnimationTrigger + 1;
    
    return { 
      ...currentState, 
      currentTemperature: newTemp,
      tapIconRotation: newRotation,
      tapIconAnimationTrigger: newAnimationTrigger
    };
  }

  /**
   * 处理温度减少按钮点击
   */
  handleTempDecrease(currentState: GameState): GameState {
    let newTemp = currentState.currentTemperature - TEMP_CLICK_CHANGE;
    newTemp = Math.max(0, newTemp);
    
    // 新增：Tap图标逆时针旋转90度
    const newRotation = currentState.tapIconRotation - 90;
    const newAnimationTrigger = currentState.tapIconAnimationTrigger + 1;
    
    return { 
      ...currentState, 
      currentTemperature: newTemp,
      tapIconRotation: newRotation,
      tapIconAnimationTrigger: newAnimationTrigger
    };
  }
  
  /**
   * 处理中心按钮点击（清除干扰或特殊交互）
   */
  handleCenterButtonClick(currentState: GameState): GameState {
    let newState = { ...currentState };

    // 处理泡泡时间的节奏点击 - 改为任何点击都会结束该模式
    if (newState.interferenceEvent.type === 'bubble_time' && newState.bubbleTimeState.isActive) {
      // 清除泡泡效果并重置干扰计时器
      newState = this.clearInterferenceEffects(newState);
      newState.interferenceEvent = this.interferenceSystem.clearInterferenceEvent();
      newState.interferenceTimer = this.interferenceSystem.generateRandomInterferenceInterval();
      // 点击还会获得少量奖励
      newState.currentComfort = Math.min(1, newState.currentComfort + 0.05); // +5% comfort
      return newState; // 提前返回，避免进入其他逻辑
    }

    // 处理惊喜掉落的接住逻辑
    if (newState.interferenceEvent.type === 'surprise_drop' && newState.fallingObjects.length > 0) {
      const caughtObjects = newState.fallingObjects.filter(obj => 
        this.interferenceSystem.isObjectInCatchZone(obj)
      );

      if (caughtObjects.length > 0) {
        // 应用接住物品的效果
        caughtObjects.forEach(obj => {
          newState.currentComfort += obj.comfortEffect;
        });

        // 移除已接住的物品
        newState.fallingObjects = newState.fallingObjects.filter(obj => 
          !this.interferenceSystem.isObjectInCatchZone(obj)
        );
      }
    }

    // 其他干扰事件的清除逻辑
    if (newState.interferenceEvent.isActive && 
        this.interferenceSystem.canBeClearedByClick(newState.interferenceEvent.type)) {
      newState = this.clearInterferenceEffects(newState);
      newState.interferenceEvent = this.interferenceSystem.clearInterferenceEvent();
      newState.interferenceTimer = this.interferenceSystem.generateRandomInterferenceInterval();
    }

    return newState;
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