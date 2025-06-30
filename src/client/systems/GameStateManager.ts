/**
 * 游戏状态管理器 - 协调所有游戏系统并管理整体游戏状态 (V2 - 新机制)
 * Game State Manager - Coordinates all game systems and manages overall game state (V2 - New Mechanics)
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

export class GameStateManager {
  private interferenceSystem: InterferenceSystem;
  private config: GameConfig;
  private timeAccumulator: number = 0;
  private comfortUpdateAccumulator: number = 0; // 舒适度更新计时器 (80ms间隔)
  private targetTempChangeTimer: number = 0;
  private electricLeakageTimer: number = 0; // 漏电偏移更新计时器
  private fallingObjectSpawnTimer: number = 0; // 掉落物品生成计时器

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

    // 1. 更新正向计时器
    newState.gameTimer += deltaTime;
    newState.interferenceTimer -= deltaTime; // 干扰计时器倒计时

    // 2. 每80ms更新舒适度 - 按照用户规格
    if (this.comfortUpdateAccumulator >= COMFORT_UPDATE_INTERVAL) {
      this.comfortUpdateAccumulator -= COMFORT_UPDATE_INTERVAL;

      // 2a. 基于固定60%-80%区域更新舒适度
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

    // 3. 每秒更新一次的逻辑
    if (this.timeAccumulator >= 1) {
      this.timeAccumulator -= 1;

      // 3a. 温度每秒自动下降（应用冷风效果）- 速度同步15%/秒
      newState.currentTemperature -= TEMP_AUTO_DECREASE_PER_SECOND * newState.temperatureCoolingMultiplier;

      // 3b. 更新目标温度变化计时器（保留用于显示，但不影响舒适度计算）
      this.targetTempChangeTimer -= 1;
      if (this.targetTempChangeTimer <= 0) {
        newState.targetTemperature = this.generateRandomTargetTemperature();
        this.targetTempChangeTimer = TARGET_TEMP_CHANGE_INTERVAL;
        console.log(`🎯 目标温度变化为: ${(newState.targetTemperature * 100).toFixed(0)}°`);
      }
    }
    
    // 4. 处理干扰效果特殊逻辑
    this.handleInterferenceEffects(newState, deltaTime);

    // 5. 确保温度和舒适度在 0-1 范围内 (自动回弹)
    newState.currentTemperature = Math.max(0, Math.min(1, newState.currentTemperature));
    newState.currentComfort = Math.max(0, Math.min(1, newState.currentComfort));

    // 6. 检查游戏失败条件 (除非开启不死模式)
    if (newState.currentComfort <= 0 && !this.config.IMMORTAL_MODE) {
      newState.gameStatus = 'failure';
      return newState;
    }

    // 7. 更新和触发干扰事件
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

    // 处理惊喜掉落：生成和更新掉落物品
    if (state.interferenceEvent.type === 'surprise_drop' && state.interferenceEvent.isActive) {
      // 生成新的掉落物品
      this.fallingObjectSpawnTimer += deltaTime;
      if (this.fallingObjectSpawnTimer >= 2) { // 每2秒生成一个新物品
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
   * 处理中心按钮点击（清除干扰或特殊交互）
   */
  handleCenterButtonClick(currentState: GameState): GameState {
    let newState = { ...currentState };

    // 处理泡泡时间的节奏点击
    if (newState.interferenceEvent.type === 'bubble_time' && newState.bubbleTimeState.isActive) {
      const currentTime = Date.now();
      const isValidRhythm = this.interferenceSystem.isValidRhythmClick(
        currentTime, 
        newState.bubbleTimeState.lastClickTime
      );

      if (isValidRhythm) {
        newState.bubbleTimeState.rhythmClickCount += 1;
        newState.currentComfort += 0.1; // 增加10%舒适度
        console.log(`🎵 节奏点击成功！连击数: ${newState.bubbleTimeState.rhythmClickCount}`);
      } else {
        newState.bubbleTimeState.rhythmClickCount = 0; // 重置连击数
      }

      newState.bubbleTimeState.lastClickTime = currentTime;
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
          console.log(`🎁 接住了 ${obj.type}！舒适度变化: ${obj.comfortEffect > 0 ? '+' : ''}${(obj.comfortEffect * 100).toFixed(0)}%`);
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

  /**
   * 手动触发特定干扰机制 (用于调试/作弊)
   */
  triggerInterference(state: GameState, interferenceType: 'electric_leakage' | 'cold_wind' | 'controls_reversed' | 'bubble_time' | 'surprise_drop'): GameState {
    // 清除当前干扰
    let newState = this.clearInterferenceEffects(state);
    
    // 创建新的干扰事件
    newState.interferenceEvent = this.interferenceSystem.createInterferenceEvent(interferenceType);
    newState = this.activateInterferenceEffects(newState, interferenceType);
    
    console.log(`🔧 手动触发干扰: ${interferenceType}`);
    return newState;
  }

  /**
   * 设置不死模式
   */
  setImmortalMode(enabled: boolean): void {
    this.config.IMMORTAL_MODE = enabled;
    console.log(`🛡️ 不死模式已${enabled ? '开启' : '关闭'}`);
  }
}
