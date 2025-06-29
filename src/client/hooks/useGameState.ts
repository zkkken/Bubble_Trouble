/**
 * 游戏状态管理 Hook
 * 封装游戏状态逻辑，供组件使用
 * 
 * @author 开发者C - 数据管理负责人
 */

import { useState, useEffect, useCallback } from 'react';
import { GameState, GameConfig } from '../types/GameTypes';
import { GameStateManager } from '../systems/GameStateManager';

interface UseGameStateReturn {
  gameState: GameState;
  currentRound: number;
  handlePlusPress: () => void;
  handlePlusRelease: () => void;
  handleMinusPress: () => void;
  handleMinusRelease: () => void;
  handleCenterButtonClick: () => void;
  resetGame: () => void;
  startNextRound: () => void;
  formatTime: (seconds: number) => string;
}

export const useGameState = (config: GameConfig): UseGameStateReturn => {
  const [gameStateManager] = useState(() => new GameStateManager(config));
  const [gameState, setGameState] = useState<GameState>(() => 
    gameStateManager.createInitialState()
  );
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

  // Center button handler
  const handleCenterButtonClick = useCallback(() => {
    setGameState(prev => gameStateManager.handleCenterButtonClick(prev));
  }, [gameStateManager]);

  // Reset game
  const resetGame = useCallback(() => {
    setCurrentRound(1);
    const newConfig = { ...config, GAME_DURATION: 30 };
    gameStateManager.updateConfig(newConfig);
    const newState = gameStateManager.resetGameState();
    setGameState(newState);
  }, [gameStateManager, config]);

  // Start next round
  const startNextRound = useCallback(() => {
    const nextRound = currentRound + 1;
    const newDuration = Math.max(10, 30 - ((nextRound - 1) * 10));
    const newConfig = { ...config, GAME_DURATION: newDuration };
    
    setCurrentRound(nextRound);
    gameStateManager.updateConfig(newConfig);
    const newState = gameStateManager.resetGameState();
    setGameState(newState);
  }, [currentRound, gameStateManager, config]);

  // Format time
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Main game loop
  useEffect(() => {
    if (gameState.gameStatus !== 'playing') return;

    const gameLoop = setInterval(() => {
      setGameState(prevState => {
        const deltaTime = 1/60;
        const newState = gameStateManager.updateGameState(prevState, deltaTime);
        return newState;
      });
    }, 1000/60);

    return () => clearInterval(gameLoop);
  }, [gameState.gameStatus, gameStateManager]);

  return {
    gameState,
    currentRound,
    handlePlusPress,
    handlePlusRelease,
    handleMinusPress,
    handleMinusRelease,
    handleCenterButtonClick,
    resetGame,
    startNextRound,
    formatTime,
  };
};