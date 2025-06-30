/**
 * 游戏类型定义
 * Game Type Definitions
 * 
 * @author 全团队共享
 */

export type GameStatus = 'playing' | 'success' | 'failure' | 'paused';
export type InterferenceType = 'bubble_time' | 'cold_wind' | 'controls_reversed' | 'electric_leakage' | 'surprise_drop' | 'none';

export interface InterferenceEvent {
  type: InterferenceType;
  isActive: boolean;
  duration: number;
  remainingTime: number;
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
  interferenceEvent: InterferenceEvent;
  interferenceTimer: number;
  isControlsReversed: boolean;
  
  // 新增：干扰机制相关状态
  temperatureOffset: number; // 漏电效果：温度指针显示偏移
  temperatureCoolingMultiplier: number; // 冷风效果：冷却速率倍数
  bubbleTimeState: BubbleTimeState; // 泡泡时间状态
  fallingObjects: FallingObject[]; // 惊喜掉落物品
  windObjects: WindObject[]; // 冷风效果：风效果对象

  // 新增：Tap图标旋转状态
  tapIconRotation: number; // 当前旋转角度
  tapIconAnimationTrigger: number; // 动画触发计数器
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