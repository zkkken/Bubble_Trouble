import { Context } from '@devvit/public-api';
import { RedisClient } from '@devvit/redis';
import { GameState, GameConfig, PostConfig, InterferenceType } from '../../shared/types/game';

const getPostConfigKey = (postId: string) => `post_config:${postId}` as const;

const GAME_CONFIG: GameConfig = {
  TEMPERATURE_CHANGE_RATE: 0.5,
  TEMPERATURE_COOLING_RATE: 0.3,
  COMFORT_CHANGE_RATE: 0.2,
  GAME_DURATION: 30,
  SUCCESS_HOLD_TIME: 5,
  INITIAL_TEMPERATURE: 0.5,
  TARGET_TEMPERATURE_MIN: 0.3,
  TARGET_TEMPERATURE_MAX: 0.7,
  TOLERANCE_WIDTH: 0.1,
  INTERFERENCE_MIN_INTERVAL: 3,
  INTERFERENCE_MAX_INTERVAL: 5,
  INTERFERENCE_DURATION: 8,
};

class TemperatureSystem {
  private config: GameConfig;

  constructor(config: GameConfig) {
    this.config = config;
  }

  updateTemperature(
    currentTemperature: number,
    isPlusHeld: boolean,
    isMinusHeld: boolean,
    isControlsReversed: boolean,
    deltaTime: number
  ): number {
    const effectivePlusHeld = isControlsReversed ? isMinusHeld : isPlusHeld;
    const effectiveMinusHeld = isControlsReversed ? isPlusHeld : isMinusHeld;

    let newTemperature = currentTemperature;

    if (effectivePlusHeld) {
      newTemperature += this.config.TEMPERATURE_CHANGE_RATE * deltaTime;
    } else if (effectiveMinusHeld) {
      newTemperature -= this.config.TEMPERATURE_CHANGE_RATE * deltaTime;
    } else {
      newTemperature -= this.config.TEMPERATURE_COOLING_RATE * deltaTime;
    }

    return Math.max(0, Math.min(1, newTemperature));
  }

  generateRandomTargetTemperature(): number {
    return Math.random() * 
      (this.config.TARGET_TEMPERATURE_MAX - this.config.TARGET_TEMPERATURE_MIN) + 
      this.config.TARGET_TEMPERATURE_MIN;
  }

  isTemperatureInRange(
    currentTemperature: number,
    targetTemperature: number,
    toleranceWidth: number
  ): boolean {
    const temperatureDifference = Math.abs(currentTemperature - targetTemperature);
    return temperatureDifference <= toleranceWidth;
  }
}

class ComfortSystem {
  private config: GameConfig;

  constructor(config: GameConfig) {
    this.config = config;
  }

  updateComfort(
    currentComfort: number,
    isInToleranceRange: boolean,
    deltaTime: number
  ): number {
    let newComfort = currentComfort;

    if (isInToleranceRange) {
      newComfort += this.config.COMFORT_CHANGE_RATE * deltaTime;
    } else {
      newComfort -= this.config.COMFORT_CHANGE_RATE * deltaTime;
    }

    return Math.max(0, Math.min(1, newComfort));
  }
}

class InterferenceSystem {
  private config: GameConfig;

  constructor(config: GameConfig) {
    this.config = config;
  }

  generateRandomInterferenceInterval(): number {
    return Math.random() * 
      (this.config.INTERFERENCE_MAX_INTERVAL - this.config.INTERFERENCE_MIN_INTERVAL) + 
      this.config.INTERFERENCE_MIN_INTERVAL;
  }

  getRandomInterferenceType(): InterferenceType {
    const types: InterferenceType[] = ['controls_reversed', 'temperature_shock', 'bubble_obstruction'];
    const randomIndex = Math.floor(Math.random() * types.length);
    return types[randomIndex] || 'controls_reversed'; // Fallback to ensure valid type
  }

  applyTemperatureShock(): number {
    return Math.random() > 0.5 ? 0.9 : 0.1;
  }
}

class GameStateManager {
  private temperatureSystem: TemperatureSystem;
  private comfortSystem: ComfortSystem;
  private interferenceSystem: InterferenceSystem;
  private config: GameConfig;

  constructor(config: GameConfig) {
    this.config = config;
    this.temperatureSystem = new TemperatureSystem(config);
    this.comfortSystem = new ComfortSystem(config);
    this.interferenceSystem = new InterferenceSystem(config);
  }

  updateConfig(newConfig: GameConfig): void {
    this.config = newConfig;
  }

  createInitialState(): GameState {
    return {
      currentTemperature: this.config.INITIAL_TEMPERATURE,
      targetTemperature: this.temperatureSystem.generateRandomTargetTemperature(),
      toleranceWidth: this.config.TOLERANCE_WIDTH,
      currentComfort: 0.5,
      gameTimer: this.config.GAME_DURATION,
      successHoldTimer: 0,
      isPlusHeld: false,
      isMinusHeld: false,
      gameStatus: 'playing',
      interferenceEvent: {
        type: 'none',
        isActive: false,
        duration: 0,
        remainingTime: 0,
      },
      interferenceTimer: this.interferenceSystem.generateRandomInterferenceInterval(),
      isControlsReversed: false,
    };
  }

  updateGameState(currentState: GameState, deltaTime: number): GameState {
    if (currentState.gameStatus !== 'playing') {
      return currentState;
    }

    let newState = { ...currentState };

    // Update timers
    newState.gameTimer = Math.max(0, newState.gameTimer - deltaTime);
    newState.interferenceTimer = Math.max(0, newState.interferenceTimer - deltaTime);

    // Check time failure condition
    if (newState.gameTimer <= 0) {
      if (newState.currentComfort >= 0.8) {
        newState.gameStatus = 'success';
      } else {
        newState.gameStatus = 'failure';
      }
      return newState;
    }

    // Handle interference events
    if (newState.interferenceTimer <= 0 && !newState.interferenceEvent.isActive) {
      const interferenceType = this.interferenceSystem.getRandomInterferenceType();
      newState.interferenceEvent = {
        type: interferenceType,
        isActive: true,
        duration: this.config.INTERFERENCE_DURATION,
        remainingTime: this.config.INTERFERENCE_DURATION,
      };

      switch (interferenceType) {
        case 'controls_reversed':
          newState.isControlsReversed = true;
          break;
        case 'temperature_shock':
          newState.targetTemperature = this.interferenceSystem.applyTemperatureShock();
          break;
        case 'bubble_obstruction':
          break;
      }
    }

    // Update temperature
    newState.currentTemperature = this.temperatureSystem.updateTemperature(
      newState.currentTemperature,
      newState.isPlusHeld,
      newState.isMinusHeld,
      newState.isControlsReversed,
      deltaTime
    );

    // Update comfort
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

    return newState;
  }

  handleCenterButtonClick(currentState: GameState): GameState {
    if (!currentState.interferenceEvent.isActive) {
      return currentState;
    }

    return {
      ...currentState,
      interferenceEvent: {
        type: 'none',
        isActive: false,
        duration: 0,
        remainingTime: 0,
      },
      isControlsReversed: false,
      interferenceTimer: this.interferenceSystem.generateRandomInterferenceInterval(),
    };
  }
}

// Create a single instance to avoid state issues
let gameStateManager: GameStateManager;

function getGameStateManager(): GameStateManager {
  if (!gameStateManager) {
    gameStateManager = new GameStateManager(GAME_CONFIG);
  }
  return gameStateManager;
}

export const postConfigMaybeGet = async ({
  redis,
  postId,
}: {
  redis: Context['redis'] | RedisClient;
  postId: string;
}): Promise<PostConfig | undefined> => {
  try {
    const config = await redis.get(getPostConfigKey(postId));
    return config ? JSON.parse(config) : undefined;
  } catch (error) {
    console.error('Error getting post config:', error);
    return undefined;
  }
};

export const postConfigGet = async ({
  redis,
  postId,
}: {
  redis: Context['redis'] | RedisClient;
  postId: string;
}): Promise<PostConfig> => {
  const config = await postConfigMaybeGet({ redis, postId });
  if (!config) throw new Error('Post config not found');
  return config;
};

export const postConfigSet = async ({
  redis,
  postId,
  config,
}: {
  redis: Context['redis'];
  postId: string;
  config: Partial<PostConfig>;
}): Promise<void> => {
  try {
    const existingConfig = await postConfigMaybeGet({ redis, postId });
    const newConfig = { ...existingConfig, ...config };
    await redis.set(getPostConfigKey(postId), JSON.stringify(newConfig));
  } catch (error) {
    console.error('Error setting post config:', error);
    throw error;
  }
};

export const postConfigNew = async ({
  redis,
  postId,
}: {
  redis: Context['redis'] | RedisClient;
  postId: string;
}): Promise<void> => {
  try {
    const manager = getGameStateManager();
    const config: PostConfig = {
      gameState: manager.createInitialState(),
      currentRound: 1,
      lastUpdated: Date.now(),
    };

    await redis.set(getPostConfigKey(postId), JSON.stringify(config));
  } catch (error) {
    console.error('Error creating new post config:', error);
    throw error;
  }
};

export const updateGameState = async ({
  redis,
  postId,
  gameState,
}: {
  redis: Context['redis'];
  postId: string;
  gameState: GameState;
}): Promise<GameState> => {
  await postConfigSet({
    redis,
    postId,
    config: { 
      gameState,
      lastUpdated: Date.now()
    },
  });
  
  return gameState;
};

export const handleButtonPress = async ({
  redis,
  postId,
  buttonType,
  isPressed,
}: {
  redis: Context['redis'];
  postId: string;
  buttonType: 'plus' | 'minus' | 'center';
  isPressed: boolean;
}): Promise<GameState> => {
  const config = await postConfigGet({ redis, postId });
  let newState = { ...config.gameState };

  const manager = getGameStateManager();

  if (buttonType === 'center') {
    newState = manager.handleCenterButtonClick(newState);
  } else if (buttonType === 'plus') {
    newState.isPlusHeld = isPressed;
  } else if (buttonType === 'minus') {
    newState.isMinusHeld = isPressed;
  }

  await updateGameState({ redis, postId, gameState: newState });
  return newState;
};

export const resetGame = async ({
  redis,
  postId,
  newRound,
}: {
  redis: Context['redis'];
  postId: string;
  newRound?: number;
}): Promise<{ gameState: GameState; currentRound: number }> => {
  const currentRound = newRound || 1;
  const newDuration = Math.max(10, 30 - ((currentRound - 1) * 10));
  
  // Update config for new round
  const newConfig = { ...GAME_CONFIG, GAME_DURATION: newDuration };
  const manager = getGameStateManager();
  manager.updateConfig(newConfig);
  
  const gameState = manager.createInitialState();
  
  await postConfigSet({
    redis,
    postId,
    config: { 
      gameState,
      currentRound,
      lastUpdated: Date.now()
    },
  });
  
  return { gameState, currentRound };
};

export const processGameUpdate = async ({
  redis,
  postId,
  deltaTime,
}: {
  redis: Context['redis'];
  postId: string;
  deltaTime: number;
}): Promise<GameState> => {
  const config = await postConfigGet({ redis, postId });
  const manager = getGameStateManager();
  const updatedGameState = manager.updateGameState(config.gameState, deltaTime);
  
  await updateGameState({ redis, postId, gameState: updatedGameState });
  return updatedGameState;
};