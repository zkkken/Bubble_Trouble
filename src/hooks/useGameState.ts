import { useState, useEffect, useCallback } from 'react';
import { GameState, GameConfig, InterferenceType } from '../types/GameTypes';

const GAME_CONFIG: GameConfig = {
  TEMPERATURE_CHANGE_RATE: 0.5, // 50% per second
  TEMPERATURE_COOLING_RATE: 0.3, // 30% per second natural cooling
  COMFORT_CHANGE_RATE: 0.2, // 20% per second
  GAME_DURATION: 60, // 60 seconds
  SUCCESS_HOLD_TIME: 5, // 5 seconds
  INITIAL_TEMPERATURE: 0.5,
  TARGET_TEMPERATURE_MIN: 0.3,
  TARGET_TEMPERATURE_MAX: 0.7,
  TOLERANCE_WIDTH: 0.1,
  INTERFERENCE_MIN_INTERVAL: 3, // 3 seconds (reduced from 8)
  INTERFERENCE_MAX_INTERVAL: 5, // 5 seconds (reduced from 15)
  INTERFERENCE_DURATION: 8, // 8 seconds
};

const generateRandomTargetTemperature = () => {
  return Math.random() * (GAME_CONFIG.TARGET_TEMPERATURE_MAX - GAME_CONFIG.TARGET_TEMPERATURE_MIN) + GAME_CONFIG.TARGET_TEMPERATURE_MIN;
};

const generateRandomInterferenceInterval = () => {
  return Math.random() * (GAME_CONFIG.INTERFERENCE_MAX_INTERVAL - GAME_CONFIG.INTERFERENCE_MIN_INTERVAL) + GAME_CONFIG.INTERFERENCE_MIN_INTERVAL;
};

const getRandomInterferenceType = (): InterferenceType => {
  const types: InterferenceType[] = ['controls_reversed', 'temperature_shock', 'bubble_obstruction'];
  return types[Math.floor(Math.random() * types.length)];
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentTemperature: GAME_CONFIG.INITIAL_TEMPERATURE,
    targetTemperature: generateRandomTargetTemperature(),
    toleranceWidth: GAME_CONFIG.TOLERANCE_WIDTH,
    currentComfort: 0.5,
    gameTimer: GAME_CONFIG.GAME_DURATION,
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
    interferenceTimer: generateRandomInterferenceInterval(),
    isControlsReversed: false,
  });

  // Temperature control handlers
  const handlePlusPress = useCallback(() => {
    setGameState(prev => ({ ...prev, isPlusHeld: true }));
  }, []);

  const handlePlusRelease = useCallback(() => {
    setGameState(prev => ({ ...prev, isPlusHeld: false }));
  }, []);

  const handleMinusPress = useCallback(() => {
    setGameState(prev => ({ ...prev, isMinusHeld: true }));
  }, []);

  const handleMinusRelease = useCallback(() => {
    setGameState(prev => ({ ...prev, isMinusHeld: false }));
  }, []);

  // Center button handler for interference events
  const handleCenterButtonClick = useCallback(() => {
    setGameState(prev => {
      if (prev.interferenceEvent.isActive) {
        return {
          ...prev,
          interferenceEvent: {
            type: 'none',
            isActive: false,
            duration: 0,
            remainingTime: 0,
          },
          isControlsReversed: false,
          gameStatus: 'playing',
          interferenceTimer: generateRandomInterferenceInterval(),
        };
      }
      return prev;
    });
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    setGameState({
      currentTemperature: GAME_CONFIG.INITIAL_TEMPERATURE,
      targetTemperature: generateRandomTargetTemperature(),
      toleranceWidth: GAME_CONFIG.TOLERANCE_WIDTH,
      currentComfort: 0.5,
      gameTimer: GAME_CONFIG.GAME_DURATION,
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
      interferenceTimer: generateRandomInterferenceInterval(),
      isControlsReversed: false,
    });
  }, []);

  // Main game loop
  useEffect(() => {
    if (gameState.gameStatus !== 'playing') return;

    const gameLoop = setInterval(() => {
      setGameState(prevState => {
        const deltaTime = 1/60; // 60 FPS simulation
        let newState = { ...prevState };

        // Update game timer
        newState.gameTimer = Math.max(0, newState.gameTimer - deltaTime);

        // Check for time-based failure
        if (newState.gameTimer <= 0) {
          newState.gameStatus = 'failure';
          return newState;
        }

        // Update interference timer
        newState.interferenceTimer = Math.max(0, newState.interferenceTimer - deltaTime);

        // Trigger interference event
        if (newState.interferenceTimer <= 0 && !newState.interferenceEvent.isActive) {
          const interferenceType = getRandomInterferenceType();
          newState.interferenceEvent = {
            type: interferenceType,
            isActive: true,
            duration: GAME_CONFIG.INTERFERENCE_DURATION,
            remainingTime: GAME_CONFIG.INTERFERENCE_DURATION,
          };
          // Don't pause the game, keep it playing during interference
          // newState.gameStatus = 'paused';

          // Apply interference effects
          switch (interferenceType) {
            case 'controls_reversed':
              newState.isControlsReversed = true;
              break;
            case 'temperature_shock':
              // Temporarily shift target temperature
              newState.targetTemperature = Math.random() > 0.5 ? 0.9 : 0.1;
              break;
            case 'bubble_obstruction':
              // Visual obstruction handled in UI
              break;
          }
        }

        // Update temperature based on button states (considering reversed controls)
        const effectivePlusHeld = newState.isControlsReversed ? newState.isMinusHeld : newState.isPlusHeld;
        const effectiveMinusHeld = newState.isControlsReversed ? newState.isPlusHeld : newState.isMinusHeld;

        if (effectivePlusHeld) {
          newState.currentTemperature += GAME_CONFIG.TEMPERATURE_CHANGE_RATE * deltaTime;
        } else if (effectiveMinusHeld) {
          newState.currentTemperature -= GAME_CONFIG.TEMPERATURE_CHANGE_RATE * deltaTime;
        } else {
          // Natural cooling when no buttons are pressed
          newState.currentTemperature -= GAME_CONFIG.TEMPERATURE_COOLING_RATE * deltaTime;
        }

        // Clamp temperature between 0 and 1
        newState.currentTemperature = Math.max(0, Math.min(1, newState.currentTemperature));

        // Update comfort based on temperature accuracy
        const temperatureDifference = Math.abs(newState.currentTemperature - newState.targetTemperature);
        const isInToleranceRange = temperatureDifference <= newState.toleranceWidth;

        if (isInToleranceRange) {
          newState.currentComfort += GAME_CONFIG.COMFORT_CHANGE_RATE * deltaTime;
        } else {
          newState.currentComfort -= GAME_CONFIG.COMFORT_CHANGE_RATE * deltaTime;
        }

        // Clamp comfort between 0 and 1
        newState.currentComfort = Math.max(0, Math.min(1, newState.currentComfort));

        // Check for comfort-based failure
        if (newState.currentComfort <= 0) {
          newState.gameStatus = 'failure';
          return newState;
        }

        // Handle success logic
        if (newState.currentComfort >= 1.0) {
          newState.successHoldTimer += deltaTime;
          if (newState.successHoldTimer >= GAME_CONFIG.SUCCESS_HOLD_TIME) {
            newState.gameStatus = 'success';
          }
        } else {
          newState.successHoldTimer = 0;
        }

        return newState;
      });
    }, 1000/60); // 60 FPS

    return () => clearInterval(gameLoop);
  }, [gameState.gameStatus]);

  return {
    gameState,
    handlers: {
      handlePlusPress,
      handlePlusRelease,
      handleMinusPress,
      handleMinusRelease,
      handleCenterButtonClick,
      resetGame,
    },
    config: GAME_CONFIG,
  };
};