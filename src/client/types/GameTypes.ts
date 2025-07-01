/**
 * 游戏类型定义
 * Game Type Definitions
 * 
 * @author 全团队共享
 */

export type GameStatus = 'ready' | 'playing' | 'success' | 'failure' | 'paused';
export type InterferenceType = 'bubble_time' | 'controls_reversed' | 'electric_leakage' | 'surprise_drop' | 'cold_wind' | 'none';

export interface InterferenceEvent {
  type: InterferenceType;
  isActive: boolean;
  duration: number;
  remainingTime: number;
  id?: string; // 添加ID以支持多个同时发生的事件
}

// 新增：难度等级接口
export interface DifficultyLevel {
  level: number;
  interferenceMinInterval: number; // 事件最小间隔
  interferenceMaxInterval: number; // 事件最大间隔
  maxSimultaneousEvents: number;   // 最大同时事件数
}

// 新增：掉落物品接口
export interface FallingObject {
  id: string;
  type: 'rubber_duck' | 'fish' | 'comb' | 'grime_goblin' | 'alarm_clock';
  yPosition: number;
  xPosition: number;
  imageSrc: string;
  comfortEffect: number; // 对舒适度的影响（可以是负数）
}

// 新增：泡泡接口 - 复杂运动系统
export interface Bubble {
  id: number;              // 唯一标识符
  x: number;               // 水平位置
  y: number;               // 垂直位置
  size: number;            // 泡泡大小
  opacity: number;         // 透明度
  speed: number;           // 垂直下降速度
  horizontalSpeed: number; // 水平漂移速度
  swayAmplitude: number;   // 摆动幅度
  swayFrequency: number;   // 摆动频率
  time: number;            // 时间参数（用于摆动计算）
}

// 新增：泡泡时间状态接口
export interface BubbleTimeState {
  isActive: boolean;
  bubbles: Bubble[];
  lastClickTime: number;
  rhythmClickCount: number;
}

// 新增：风效果接口
export interface WindObject {
  id: number;
  x: number;
  y: number;
  direction: 'left' | 'right'; // 移动方向
  speed: number; // 穿越速度
  opacity: number;
}

export interface GameState {
  currentTemperature: number;
  targetTemperature: number;
  toleranceWidth: number;
  currentComfort: number;
  gameTimer: number;
  successHoldTimer: number;
  isPlusHeld: boolean;
  isMinusHeld: boolean;
  gameStatus: GameStatus;
  
  // 修改：支持多个同时发生的干扰事件
  interferenceEvents: InterferenceEvent[]; // 改为数组支持多个事件
  interferenceTimer: number;
  isControlsReversed: boolean;
  
  // 新增：难度系统
  difficultyLevel: number; // 当前难度等级
  
  // 新增：干扰机制相关状态
  temperatureOffset: number; // 漏电效果：温度指针显示偏移
  bubbleTimeState: BubbleTimeState; // 泡泡时间状态
  fallingObjects: FallingObject[]; // 惊喜掉落物品
  windObjects: WindObject[]; // 冷风效果：风效果对象

  // 新增：Tap图标旋转状态
  tapIconRotation: number; // 当前旋转角度
  tapIconAnimationTrigger: number; // 动画触发计数器
  
  // 新增：当前温度区域（0-3，每15秒轮换）
  currentTemperatureZone: number;
  
  // 为了兼容性保留单个干扰事件接口
  interferenceEvent: InterferenceEvent;
}

export interface GameConfig {
  TEMPERATURE_CHANGE_RATE: number;
  TEMPERATURE_COOLING_RATE: number;
  COMFORT_CHANGE_RATE: number;
  GAME_DURATION: number;
  SUCCESS_HOLD_TIME: number;
  INITIAL_TEMPERATURE: number;
  TARGET_TEMPERATURE_MIN: number;
  TARGET_TEMPERATURE_MAX: number;
  TOLERANCE_WIDTH: number;
  INTERFERENCE_MIN_INTERVAL: number;
  INTERFERENCE_MAX_INTERVAL: number;
  INTERFERENCE_DURATION: number;
  IMMORTAL_MODE?: boolean; // 移除不死模式
}

// 图片资源配置
export interface ImageAssets {
  background: string | null;
  avatarBad: string | null;
  avatarHappy: string | null;
  buttonMinus: string | null;
  buttonPlus: string | null;
  buttonCenter: string | null;
}