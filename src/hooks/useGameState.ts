import { useState, useEffect, useCallback } from 'react';
import { GameState, GameConfig } from '../types/GameTypes';
import { GameStateManager } from '../mechanics/GameStateManager';

const GAME_CONFIG: GameConfig = {
  TEMPERATURE_CHANGE_RATE: 0.5, // 50% per second
  TEMPERATURE_COOLING_RATE: 0.3, // 30% per second natural cooling
  COMFORT_CHANGE_RATE: 0.2, // 20% per second
  GAME_DURATION: 30, // Start with 30 seconds
  SUCCESS_HOLD_TIME: 5, // 5 seconds
  INITIAL_TEMPERATURE: 0.5,
  TARGET_TEMPERATURE_MIN: 0.3,
  TARGET_TEMPERATURE_MAX: 0.7,
  TOLERANCE_WIDTH: 0.1,
  INTERFERENCE_MIN_INTERVAL: 3, // 3 seconds
  INTERFERENCE_MAX_INTERVAL: 5, // 5 seconds
  INTERFERENCE_DURATION: 8, // 8 seconds
};

export const useGameState = () => {
  // 创建游戏状态管理器实例
  const [gameStateManager] = useState(() => new GameStateManager(GAME_CONFIG));
  
  // 初始化游戏状态
  const [gameState, setGameState] = useState<GameState>(() => 
    gameStateManager.createInitialState()
  );

  // Track current round for timer reduction
  const [currentRound, setCurrentRound] = useState(1);

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
    setGameState(prev => gameStateManager.handleCenterButtonClick(prev));
  }, [gameStateManager]);

  // Reset game
  const resetGame = useCallback(() => {
    setCurrentRound(1);
    const newConfig = { ...GAME_CONFIG, GAME_DURATION: 30 };
    gameStateManager.updateConfig(newConfig);
    setGameState(gameStateManager.resetGameState());
  }, [gameStateManager]);

  // Start next round
  const startNextRound = useCallback(() => {
    const nextRound = currentRound + 1;
    const newDuration = Math.max(10, 30 - ((nextRound - 1) * 10)); // Minimum 10 seconds
    const newConfig = { ...GAME_CONFIG, GAME_DURATION: newDuration };
    
    setCurrentRound(nextRound);
    gameStateManager.updateConfig(newConfig);
    setGameState(gameStateManager.resetGameState());
  }, [currentRound, gameStateManager]);

  // Main game loop
  useEffect(() => {
    if (gameState.gameStatus !== 'playing') return;

    const gameLoop = setInterval(() => {
      setGameState(prevState => {
        const deltaTime = 1/60; // 60 FPS simulation
        return gameStateManager.updateGameState(prevState, deltaTime);
      });
    }, 1000/60); // 60 FPS

    return () => clearInterval(gameLoop);
  }, [gameState.gameStatus, gameStateManager]);

  return {
    gameState,
    currentRound,
    handlers: {
      handlePlusPress,
      handlePlusRelease,
      handleMinusPress,
      handleMinusRelease,
      handleCenterButtonClick,
      resetGame,
      startNextRound,
    },
    config: GAME_CONFIG,
    // 暴露各个系统供UI组件使用
    systems: {
      temperature: gameStateManager.getTemperatureSystem(),
      comfort: gameStateManager.getComfortSystem(),
      interference: gameStateManager.getInterferenceSystem(),
      timer: gameStateManager.getTimerSystem(),
    },
  };
};