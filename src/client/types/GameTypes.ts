/**
 * 游戏类型定义
 * Game Type Definitions
 * 
 * @author 全团队共享
 */

export type GameStatus = 'playing' | 'success' | 'failure' | 'paused';
export type InterferenceType = 'controls_reversed' | 'temperature_shock' | 'bubble_obstruction' | 'none';

export interface InterferenceEvent {
  type: InterferenceType;
  isActive: boolean;
  duration: number;
  remainingTime: number;
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