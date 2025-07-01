/**
 * 游戏状态管理器 - 协调所有游戏系统并管理整体游戏状态 (V2.2 - 新机制)
 * Game State Manager - Coordinates all game systems and manages overall game state (V2.2 - New Mechanics)
 * 
 * @author 开发者A - 游戏核心逻辑负责人 & Gemini
 */

import { GameState, GameConfig, BubbleTimeState, DifficultyLevel } from '../types/GameTypes';
import { InterferenceSystem } from './InterferenceSystem';
import { audioManager } from '../services/audioManager';

// 定义新机制的常量 - 按照用户详细规格
const TEMP_CLICK_CHANGE = 0.05; // 点击按钮温度变化5%
const COMFORT_CHANGE_PER_SECOND = 0.15; // 舒适度每秒变化15% (1.2% per 80ms = 15%/秒)
const COMFORT_UPDATE_INTERVAL = 0.08; // 舒适度更新间隔80ms
const TARGET_TEMP_CHANGE_INTERVAL = 10; // 目标温度变化间隔（秒）
const TOLERANCE_WIDTH = 0.15; // 舒适区域宽度（目标温度±15%）

// 新增：温度指针掉落机制常量
const TEMP_DROP_INTERVAL = 0.04; // 40ms间隔
const TEMP_DROP_AMOUNT = 0.006; // 单次减量0.6%

// 难度提升机制常量
const DIFFICULTY_INCREASE_INTERVAL = 30; // 每30秒增加难度
const TEMPERATURE_ZONE_INTERVAL = 15; // 温度区域轮换间隔改为15秒，同时更换地图

// 新增：温度条边缘无效区域（两侧各40px）
const EDGE_ZONE_WIDTH = 0.08; // 两侧各8%的区域为无效区域

// 难度等级配置
const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  { level: 1, interferenceMinInterval: 8, interferenceMaxInterval: 15, maxSimultaneousEvents: 1 },
  { level: 2, interferenceMinInterval: 6, interferenceMaxInterval: 12, maxSimultaneousEvents: 1 },
  { level: 3, interferenceMinInterval: 4, interferenceMaxInterval: 10, maxSimultaneousEvents: 1 },
  { level: 4, interferenceMinInterval: 3, interferenceMaxInterval: 8, maxSimultaneousEvents: 2 },
  { level: 5, interferenceMinInterval: 2, interferenceMaxInterval: 6, maxSimultaneousEvents: 2 },
  { level: 6, interferenceMinInterval: 1.5, interferenceMaxInterval: 5, maxSimultaneousEvents: 3 },
];

export class GameStateManager {
  private interferenceSystem: InterferenceSystem;
  private timeAccumulator: number = 0;
  private comfortUpdateAccumulator: number = 0; // 舒适度更新计时器 (80ms间隔)
  private targetTempChangeTimer: number = 0;
  private electricLeakageTimer: number = 0; // 漏电偏移更新计时器
  private fallingObjectSpawnTimer: number = 0; // 掉落物品生成计时器
  private tempDropAccumulator: number = 0; // 温度掉落计时器 (40ms间隔)
  private temperatureZoneTimer: number = 0; // 温度区域轮换计时器 (15秒间隔)
  private difficultyTimer: number = 0; // 难度提升计时器（纯净游戏时间）
  private coldWindCoolingMultiplier: number = 1; // 冷风冷却速率倍数
  private lastWindGenerateTime: number = 0; // 冷风生成计时器

  constructor(config: GameConfig) {
    this.interferenceSystem = new InterferenceSystem(config);
  }

  updateConfig(newConfig: GameConfig): void {
    this.interferenceSystem = new InterferenceSystem(newConfig);
  }

  createInitialState(): GameState {
    this.timeAccumulator = 0;
    this.comfortUpdateAccumulator = 0;
    this.targetTempChangeTimer = TARGET_TEMP_CHANGE_INTERVAL;
    this.electricLeakageTimer = 0;
    this.fallingObjectSpawnTimer = 0;
    this.tempDropAccumulator = 0;
    this.temperatureZoneTimer = 0;
    this.difficultyTimer = 0;
    
    const initialBubbleState: BubbleTimeState = {
      isActive: false,
      bubbles: [],
      lastClickTime: 0,
      rhythmClickCount: 0,
    };

    // 初始温度区域设为1（25-50%区域），初始温度设为37.5%（在该区域中心）
    const initialTemperatureZone = 1;
    const initialTemperature = 0.375; // 37.5%，在区域1（25-50%）的中心位置

    return {
      // 温度和舒适度
      currentTemperature: initialTemperature, // 设置在对应温度区域内
      currentComfort: 0.5, // 初始舒适度50%
      
      // 游戏状态
      gameTimer: 0, // 正向计时器，记录坚持时间
      gameStatus: 'ready', // 修改：初始状态为准备就绪，而不是直接开始

      // 动态目标温度系统 - 重新启用
      targetTemperature: this.generateRandomTargetTemperature(), // 动态目标温度
      toleranceWidth: TOLERANCE_WIDTH, // 舒适区域宽度
      successHoldTimer: 0,
      isPlusHeld: false, // 保留以兼容现有代码
      isMinusHeld: false, // 保留以兼容现有代码

      // 干扰系统状态 - 新的多事件系统
      interferenceEvents: [], // 多个同时发生的干扰事件
      interferenceTimer: this.getInterferenceInterval(1), // 基于难度等级的间隔
      isControlsReversed: false,
      
      // 难度系统
      difficultyLevel: 1, // 初始难度等级

      // 新增：干扰机制相关状态
      temperatureOffset: 0, // 漏电效果：温度指针显示偏移
      bubbleTimeState: initialBubbleState, // 泡泡时间状态
      fallingObjects: [], // 惊喜掉落物品
      windObjects: [], // 冷风效果：风效果对象

      // 新增：Tap图标旋转状态
      tapIconRotation: 0, // 当前旋转角度
      tapIconAnimationTrigger: 0, // 动画触发计数器
      
      // 新增：当前温度区域（初始设为1，对应25-50%区域）
      currentTemperatureZone: initialTemperatureZone,
      
      // 兼容性：保留单个干扰事件接口
      interferenceEvent: this.interferenceSystem.clearInterferenceEvent()
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
   * 获取基于难度等级的干扰间隔
   */
  private getInterferenceInterval(difficultyLevel: number): number {
    const levelIndex = Math.min(Math.max(difficultyLevel - 1, 0), DIFFICULTY_LEVELS.length - 1);
    const level = DIFFICULTY_LEVELS[levelIndex];
    if (!level) {
      throw new Error(`Invalid difficulty level index: ${levelIndex}`);
    }
    return level.interferenceMinInterval + Math.random() * (level.interferenceMaxInterval - level.interferenceMinInterval);
  }

  /**
   * 获取当前难度等级配置
   */
  private getCurrentDifficultyLevel(level: number): DifficultyLevel {
    const levelIndex = Math.min(Math.max(level - 1, 0), DIFFICULTY_LEVELS.length - 1);
    const selectedLevel = DIFFICULTY_LEVELS[levelIndex];
    if (!selectedLevel) {
      throw new Error(`Invalid difficulty level: ${level}`);
    }
    return selectedLevel;
  }

  /**
   * 检查温度是否在边缘无效区域
   * 两侧各8%的区域为无效区域（对应UI中的左右各40px）
   */
  private isTemperatureInEdgeZone(temperature: number): boolean {
    return temperature < EDGE_ZONE_WIDTH || temperature > (1 - EDGE_ZONE_WIDTH);
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
    this.temperatureZoneTimer += deltaTime;

    // 1. 更新正向计时器
    newState.gameTimer += deltaTime;
    newState.interferenceTimer -= deltaTime; // 干扰计时器倒计时

    // 1.5. 难度提升计时器（只在没有干扰事件时累计）
    if (newState.interferenceEvents.length === 0) {
      this.difficultyTimer += deltaTime;
      
      // 每30秒触发难度提升
      if (this.difficultyTimer >= DIFFICULTY_INCREASE_INTERVAL) {
        this.difficultyTimer = 0;
        
        // 提升难度等级
        const currentLevel = newState.difficultyLevel;
        const newLevel = Math.min(currentLevel + 1, DIFFICULTY_LEVELS.length);
        newState.difficultyLevel = newLevel;
        
        // 播放难度提升音效
        if (!audioManager.isMutedState()) {
          audioManager.playSound('difficultyUp');
        }
        
        // 更新干扰计时器以使用新的难度间隔
        newState.interferenceTimer = this.getInterferenceInterval(newLevel);
        
        console.log(`🔥 难度提升! 等级: ${currentLevel} -> ${newLevel}, 游戏时间: ${Math.floor(newState.gameTimer)}s`);
      }
    }

    // 2. 新增：温度指针掉落机制 - 40ms间隔，0.6%减量 = 15%/秒，应用冷风倍数
    if (this.tempDropAccumulator >= TEMP_DROP_INTERVAL) {
      this.tempDropAccumulator -= TEMP_DROP_INTERVAL;
      
      // 固定温度下降量，应用冷风冷却倍数
      const dropAmount = TEMP_DROP_AMOUNT * this.coldWindCoolingMultiplier;
      newState.currentTemperature = Math.max(0, newState.currentTemperature - dropAmount);
    }

    // 2.5. 新增：温度区域轮换机制 - 每15秒轮换一次（0-3），同时切换背景地图
    if (this.temperatureZoneTimer >= TEMPERATURE_ZONE_INTERVAL) {
      this.temperatureZoneTimer -= TEMPERATURE_ZONE_INTERVAL;
      newState.currentTemperatureZone = (newState.currentTemperatureZone + 1) % 4;
      console.log(`🌡️ 温度区域轮换: ${newState.currentTemperatureZone}, 游戏时间: ${Math.floor(newState.gameTimer)}s`);
    }

    // 3. 每80ms更新舒适度 - 基于当前显示的温度区域
    if (this.comfortUpdateAccumulator >= COMFORT_UPDATE_INTERVAL) {
      this.comfortUpdateAccumulator -= COMFORT_UPDATE_INTERVAL;

      // 3a. 基于当前显示的温度区域更新舒适度
      const currentTemp = newState.currentTemperature;
      const currentZone = newState.currentTemperatureZone;
      
      // 定义4个温度区域的范围（每个区域占25%）
      const temperatureZones = [
        { min: 0.0, max: 0.25 },  // 区域0: 0-25%
        { min: 0.25, max: 0.5 },  // 区域1: 25-50%
        { min: 0.5, max: 0.75 },  // 区域2: 50-75%
        { min: 0.75, max: 1.0 }   // 区域3: 75-100%
      ];
      
      const activeZone = temperatureZones[currentZone];
      
      // 检查是否在边缘无效区域
      const isInEdgeZone = this.isTemperatureInEdgeZone(currentTemp);
      
      // 只有在有效区域内且在当前温度区域内才增加舒适度
      if (!isInEdgeZone && activeZone && currentTemp >= activeZone.min && currentTemp <= activeZone.max) {
        // 在当前显示的温度区域内，每80ms +1.2% (15%/秒)
        newState.currentComfort += COMFORT_CHANGE_PER_SECOND * COMFORT_UPDATE_INTERVAL;
      } else {
        // 在当前显示的温度区域外或在边缘无效区域，每80ms -1.2% (15%/秒)
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

    // 处理干扰效果的特殊逻辑 - 支持多事件
    this.handleInterferenceEffects(newState, deltaTime);

    // 6. 确保温度和舒适度在 0-1 范围内 (自动回弹)
    newState.currentTemperature = Math.max(0, Math.min(1, newState.currentTemperature));
    newState.currentComfort = Math.max(0, Math.min(1, newState.currentComfort));

    // 7. 检查游戏失败条件 (正常模式) - 添加严格检查
    if (newState.currentComfort <= 0 && newState.gameTimer > 1.0) {
      // 只有在游戏运行超过1秒后才允许失败，防止初始化时意外触发
      console.log(`💀 游戏失败! 舒适度: ${(newState.currentComfort * 100).toFixed(1)}%, 游戏时间: ${newState.gameTimer.toFixed(2)}s`);
      newState.gameStatus = 'failure';
      return newState;
    } else if (newState.currentComfort <= 0 && newState.gameTimer <= 1.0) {
      // 游戏开始1秒内，如果舒适度过低，强制设为1%避免意外失败
      console.warn(`⚠️ 游戏开始阶段舒适度异常，已修正: ${(newState.currentComfort * 100).toFixed(1)}% -> 1%`);
      newState.currentComfort = 0.01;
    }

    // 8. 更新和触发多个干扰事件
    // 8a. 更新现有的干扰事件
    newState.interferenceEvents = newState.interferenceEvents.filter(event => {
      event.remainingTime -= deltaTime;
      if (event.remainingTime <= 0) {
        // 事件结束，清除对应效果
        this.clearSpecificInterferenceEffect(newState, event.type);
        return false; // 移除已结束的事件
      }
      return true; // 保留仍在进行的事件
    });

    // 8b. 触发新的干扰事件
    if (newState.interferenceTimer <= 0) {
      const currentDifficulty = this.getCurrentDifficultyLevel(newState.difficultyLevel);
      const canAddMoreEvents = newState.interferenceEvents.length < currentDifficulty.maxSimultaneousEvents;
      
      if (canAddMoreEvents) {
        const interferenceType = this.interferenceSystem.getRandomInterferenceType();
        const newEvent = this.interferenceSystem.createInterferenceEvent(interferenceType);
        newEvent.id = `${interferenceType}_${Date.now()}_${Math.random()}`;
        
        // 添加新的干扰事件
        newState.interferenceEvents.push(newEvent);
        this.activateSpecificInterferenceEffect(newState, interferenceType);
        
        console.log(`🎯 新干扰事件: ${interferenceType}, 当前活跃事件数: ${newState.interferenceEvents.length}/${currentDifficulty.maxSimultaneousEvents}`);
      }
      
      // 重置干扰计时器
      newState.interferenceTimer = this.getInterferenceInterval(newState.difficultyLevel);
    }

    // 8c. 更新兼容性的单个干扰事件接口
    if (newState.interferenceEvents.length > 0) {
      const firstEvent = newState.interferenceEvents[0];
      if (firstEvent) {
        newState.interferenceEvent = firstEvent;
      } else {
        newState.interferenceEvent = this.interferenceSystem.clearInterferenceEvent();
      }
    } else {
      newState.interferenceEvent = this.interferenceSystem.clearInterferenceEvent();
    }

    return newState;
  }

  /**
   * 处理干扰效果的特殊逻辑 - 支持多事件
   */
  private handleInterferenceEffects(state: GameState, deltaTime: number): void {
    // 获取当前活跃的各种干扰事件
    const electricEvents = state.interferenceEvents.filter(event => event.type === 'electric_leakage');
    const bubbleEvents = state.interferenceEvents.filter(event => event.type === 'bubble_time');
    const dropEvents = state.interferenceEvents.filter(event => event.type === 'surprise_drop');
    const coldWindEvents = state.interferenceEvents.filter(event => event.type === 'cold_wind');

    // 处理漏电效果：定期更新温度偏移
    if (electricEvents.length > 0) {
      this.electricLeakageTimer += deltaTime;
      if (this.electricLeakageTimer >= 1) { // 每秒更新一次偏移
        state.temperatureOffset = this.interferenceSystem.generateElectricLeakageOffset();
        this.electricLeakageTimer = 0;
      }
    } else {
      state.temperatureOffset = 0; // 没有漏电事件时重置偏移
    }

    // 处理泡泡时间：60fps动画循环更新泡泡位置
    if (bubbleEvents.length > 0 && state.bubbleTimeState.isActive) {
      state.bubbleTimeState.bubbles = this.interferenceSystem.updateBubbles(state.bubbleTimeState.bubbles);
    }

    // 处理惊喜掉落：间隔生成和更新掉落物品
    if (dropEvents.length > 0) {
      // 使用间隔生成器：每1.5-3秒生成一个新物品
      this.fallingObjectSpawnTimer += deltaTime;
      const spawnInterval = 1.5 + Math.random() * 1.5; // 1.5-3秒间隔
      
      if (this.fallingObjectSpawnTimer >= spawnInterval) {
        const newObject = this.interferenceSystem.generateFallingObject();
        state.fallingObjects.push(newObject);
        this.fallingObjectSpawnTimer = 0;
        
        // 播放礼物掉落音效
        if (!audioManager.isMutedState()) {
          audioManager.playSound('giftDrop');
        }
      }
    }

    // 无论是否有活跃的掉落事件，都要更新现有的掉落物品直到它们落完
    if (state.fallingObjects.length > 0) {
      state.fallingObjects = this.interferenceSystem.updateFallingObjects(state.fallingObjects, deltaTime);
    }

    // 处理冷风效果：增强自然冷却速率并更新风对象
    if (coldWindEvents.length > 0) {
      // 增强自然冷却速率
      this.coldWindCoolingMultiplier = 3.0; // 冷却速率提升3倍
      
      // 更新风对象
      if (!this.lastWindGenerateTime) {
        this.lastWindGenerateTime = Date.now();
        state.windObjects = this.interferenceSystem.createColdWindState();
      }
      
      // 更新现有风对象
      state.windObjects = this.interferenceSystem.updateWindObjects(state.windObjects);
      
      // 检查是否需要生成新风对象
      const currentTime = Date.now();
      
      // 优先确保最少2朵云
      if (state.windObjects.length < 2) {
        state.windObjects.push(this.interferenceSystem.generateWindObject());
        this.lastWindGenerateTime = currentTime;
      } else if (this.interferenceSystem.shouldGenerateNewWind(this.lastWindGenerateTime, currentTime)) {
        // 确保同时最多5个风对象
        if (state.windObjects.length < 5) {
          state.windObjects.push(this.interferenceSystem.generateWindObject());
        }
        this.lastWindGenerateTime = currentTime;
      }
    } else {
      // 重置冷风冷却倍数
      this.coldWindCoolingMultiplier = 1;
    }
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
   * 处理中心按钮点击（清除干扰或特殊交互）- 支持多事件
   */
  handleCenterButtonClick(currentState: GameState): GameState {
    let newState = { ...currentState };

    // 处理泡泡时间的节奏点击 - 改为任何点击都会结束该模式
    const bubbleEvents = newState.interferenceEvents.filter(event => event.type === 'bubble_time');
    if (bubbleEvents.length > 0) {
      // 停止泡泡时间音效
      if (!audioManager.isMutedState()) {
        audioManager.stopSound('bubbleTime');
      }
      
      // 清除所有泡泡事件
      newState.interferenceEvents = newState.interferenceEvents.filter(event => event.type !== 'bubble_time');
      this.clearSpecificInterferenceEffect(newState, 'bubble_time');
      newState.interferenceTimer = this.getInterferenceInterval(newState.difficultyLevel);
      // 点击还会获得少量奖励
      newState.currentComfort = Math.min(1, newState.currentComfort + 0.05); // +5% comfort
      
      // 更新兼容性接口
      const firstEvent = newState.interferenceEvents[0];
      if (newState.interferenceEvents.length > 0 && firstEvent) {
        newState.interferenceEvent = firstEvent;
      } else {
        newState.interferenceEvent = this.interferenceSystem.clearInterferenceEvent();
      }
      
      console.log('🫧 泡泡时间结束，获得舒适度奖励!');
      return newState; // 提前返回，避免进入其他逻辑
    }

    // 处理惊喜掉落的接住逻辑
    const dropEvents = newState.interferenceEvents.filter(event => event.type === 'surprise_drop');
    if (dropEvents.length > 0 && newState.fallingObjects.length > 0) {
      const caughtObjects = newState.fallingObjects.filter(obj => 
        this.interferenceSystem.isObjectInCatchZone(obj)
      );

      if (caughtObjects.length > 0) {
        // 应用接住物品的效果并播放相应音效
        caughtObjects.forEach(obj => {
          newState.currentComfort += obj.comfortEffect;
          
          // 根据物品效果播放音效
          if (!audioManager.isMutedState()) {
            if (obj.comfortEffect > 0) {
              // 正面效果物品：橡皮鸭、鱼
              audioManager.playSound('giftCaught');
            } else {
              // 负面效果物品：梳子、水垢怪、闹钟
              audioManager.playSound('giftMissed');
            }
          }
        });

        // 移除已接住的物品
        newState.fallingObjects = newState.fallingObjects.filter(obj => 
          !this.interferenceSystem.isObjectInCatchZone(obj)
        );
        
        console.log(`🎁 接住了 ${caughtObjects.length} 个物品!`);
      }
    }

    // 其他干扰事件的清除逻辑 - 支持多事件
    const clearableEvents = newState.interferenceEvents.filter(event => 
      this.interferenceSystem.canBeClearedByClick(event.type)
    );

    if (clearableEvents.length > 0) {
      // 清除所有可清除的干扰事件
      clearableEvents.forEach(event => {
        this.clearSpecificInterferenceEffect(newState, event.type);
      });
      
      // 从事件列表中移除已清除的事件
      newState.interferenceEvents = newState.interferenceEvents.filter(event => 
        !this.interferenceSystem.canBeClearedByClick(event.type)
      );
      
      newState.interferenceTimer = this.getInterferenceInterval(newState.difficultyLevel);
      
      // 更新兼容性接口
      const firstEvent = newState.interferenceEvents[0];
      if (newState.interferenceEvents.length > 0 && firstEvent) {
        newState.interferenceEvent = firstEvent;
      } else {
        newState.interferenceEvent = this.interferenceSystem.clearInterferenceEvent();
      }
      
      console.log(`🔧 清除了 ${clearableEvents.length} 个干扰事件!`);
    }

    return newState;
  }

  /**
   * 重置游戏状态
   */
  resetGameState(): GameState {
    // 重置所有内部计时器
    this.timeAccumulator = 0;
    this.comfortUpdateAccumulator = 0;
    this.targetTempChangeTimer = TARGET_TEMP_CHANGE_INTERVAL;
    this.electricLeakageTimer = 0;
    this.fallingObjectSpawnTimer = 0;
    this.tempDropAccumulator = 0;
    this.temperatureZoneTimer = 0;
    this.difficultyTimer = 0;
    this.coldWindCoolingMultiplier = 1;
    this.lastWindGenerateTime = 0;
    
    return this.createInitialState();
  }

  getInterferenceSystem(): InterferenceSystem {
    return this.interferenceSystem;
  }

  /**
   * 启动游戏 - 将状态从'ready'切换到'playing'
   */
  startGame(currentState: GameState): GameState {
    if (currentState.gameStatus !== 'ready') {
      console.warn(`游戏启动失败: 当前状态为 ${currentState.gameStatus}, 应为 ready`);
      return currentState;
    }

    console.log('🎮 游戏正式开始!');
    return {
      ...currentState,
      gameStatus: 'playing'
    };
  }

  /**
   * 清除特定干扰效果
   */
  private clearSpecificInterferenceEffect(state: GameState, interferenceType: string): void {
    switch (interferenceType) {
      case 'controls_reversed':
        // 检查是否还有其他控制反转事件
        const hasOtherControlsReversed = state.interferenceEvents.some(
          event => event.type === 'controls_reversed' && event.remainingTime > 0
        );
        if (!hasOtherControlsReversed) {
          state.isControlsReversed = false;
        }
        break;
      case 'electric_leakage':
        // 检查是否还有其他漏电事件
        const hasOtherElectric = state.interferenceEvents.some(
          event => event.type === 'electric_leakage' && event.remainingTime > 0
        );
        if (!hasOtherElectric) {
          state.temperatureOffset = 0;
        }
        break;
      case 'bubble_time':
        // 泡泡时间总是清除
        state.bubbleTimeState = {
          isActive: false,
          bubbles: [],
          lastClickTime: 0,
          rhythmClickCount: 0,
        };
        break;
      case 'surprise_drop':
        // 惊喜掉落保留物品，但停止生成新物品
        // state.fallingObjects 保持不变，让现有物品继续下落
        break;
      case 'cold_wind':
        // 检查是否还有其他冷风事件
        const hasOtherColdWind = state.interferenceEvents.some(
          event => event.type === 'cold_wind' && event.remainingTime > 0
        );
        if (!hasOtherColdWind) {
          state.windObjects = [];
          this.coldWindCoolingMultiplier = 1;
          this.lastWindGenerateTime = 0;
        }
        break;
    }
  }

  /**
   * 激活特定干扰效果
   */
  private activateSpecificInterferenceEffect(state: GameState, interferenceType: string): void {
    switch (interferenceType) {
      case 'controls_reversed':
        state.isControlsReversed = true;
        break;
      case 'electric_leakage':
        state.temperatureOffset = this.interferenceSystem.generateElectricLeakageOffset();
        this.electricLeakageTimer = 0;
        break;
      case 'bubble_time':
        state.bubbleTimeState = this.interferenceSystem.createBubbleTimeState();
        break;
      case 'surprise_drop':
        // 不清除现有掉落物品，重置生成计时器
        this.fallingObjectSpawnTimer = 0;
        break;
      case 'cold_wind':
        if (state.windObjects.length === 0) {
          state.windObjects = this.interferenceSystem.createColdWindState();
        }
        this.lastWindGenerateTime = Date.now();
        this.coldWindCoolingMultiplier = 3.0;
        break;
    }
  }
}