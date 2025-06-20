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

export interface PostConfig {
  gameState: GameState;
  currentRound: number;
  lastUpdated: number;
}

type Response<T> = { status: 'error'; message: string } | ({ status: 'success' } & T);

export type InitResponse = Response<{
  postId: string;
}>;

export type GameDataResponse = Response<{
  gameState: GameState;
  currentRound: number;
}>;

export type UpdateGameResponse = Response<{
  gameState: GameState;
}>;

export type ResetGameResponse = Response<{
  gameState: GameState;
  currentRound: number;
}>;