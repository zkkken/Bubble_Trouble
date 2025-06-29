/**
 * 游戏状态管理 Hook (V2.1 - 新机制)
 * 封装游戏状态逻辑，供组件使用
 * 
 * @author 开发者C - 数据管理负责人 & Gemini
 */

import { useState, useEffect, useCallback } from 'react';
import { GameState, GameConfig } from '../types/GameTypes';
import { GameStateManager } from '../systems/GameStateManager';

interface UseGameStateReturn {
  gameState: GameState;
  handleLeftButtonClick: () => void;
  handleRightButtonClick: () => void;
  handleCenterButtonClick: () => void;
  resetGame: () => void;
}

export const useGameState = (config: GameConfig): UseGameStateReturn => {
  const [gameStateManager] = useState(() => new GameStateManager(config));
  const [gameState, setGameState] = useState<GameState>(() => 
    gameStateManager.createInitialState()
  );

  // Handler for the LEFT temperature button
  const handleLeftButtonClick = useCallback(() => {
    setGameState(prev => {
      if (prev.isControlsReversed) {
        return gameStateManager.handleTempIncrease(prev);
      }
      return gameStateManager.handleTempDecrease(prev);
    });
  }, [gameStateManager]);

  // Handler for the RIGHT temperature button
  const handleRightButtonClick = useCallback(() => {
    setGameState(prev => {
      if (prev.isControlsReversed) {
        return gameStateManager.handleTempDecrease(prev);
      }
      return gameStateManager.handleTempIncrease(prev);
    });
  }, [gameStateManager]);

  // Center button handler
  const handleCenterButtonClick = useCallback(() => {
    setGameState(prev => gameStateManager.handleCenterButtonClick(prev));
  }, [gameStateManager]);

  // Reset game
  const resetGame = useCallback(() => {
    const newState = gameStateManager.resetGameState();
    setGameState(newState);
  }, [gameStateManager]);


  // Main game loop
  useEffect(() => {
    if (gameState.gameStatus !== 'playing') return;

    const gameLoop = setInterval(() => {
      setGameState(prevState => {
        const deltaTime = 1 / 60; // Simulate 60 FPS
        return gameStateManager.updateGameState(prevState, deltaTime);
      });
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [gameState.gameStatus, gameStateManager]);

  return {
    gameState,
    handleLeftButtonClick,
    handleRightButtonClick,
    handleCenterButtonClick,
    resetGame,
  };
};