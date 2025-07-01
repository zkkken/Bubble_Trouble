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
  startGame: () => void;
}

export const useGameState = (config: GameConfig): UseGameStateReturn => {
  const [gameStateManager] = useState(() => new GameStateManager(config));
  const [gameState, setGameState] = useState<GameState>(() => 
    gameStateManager.createInitialState()
  );

  // Handler for the LEFT temperature button
  const handleLeftButtonClick = useCallback(() => {
    setGameState(prev => {
      // 如果游戏还未开始，先启动游戏
      if (prev.gameStatus === 'ready') {
        const startedState = gameStateManager.startGame(prev);
        // 启动后立即处理按钮点击
        if (startedState.isControlsReversed) {
          return gameStateManager.handleTempIncrease(startedState);
        }
        return gameStateManager.handleTempDecrease(startedState);
      }
      
      if (prev.isControlsReversed) {
        return gameStateManager.handleTempIncrease(prev);
      }
      return gameStateManager.handleTempDecrease(prev);
    });
  }, [gameStateManager]);

  // Handler for the RIGHT temperature button
  const handleRightButtonClick = useCallback(() => {
    setGameState(prev => {
      // 如果游戏还未开始，先启动游戏
      if (prev.gameStatus === 'ready') {
        const startedState = gameStateManager.startGame(prev);
        // 启动后立即处理按钮点击
        if (startedState.isControlsReversed) {
          return gameStateManager.handleTempDecrease(startedState);
        }
        return gameStateManager.handleTempIncrease(startedState);
      }
      
      if (prev.isControlsReversed) {
        return gameStateManager.handleTempDecrease(prev);
      }
      return gameStateManager.handleTempIncrease(prev);
    });
  }, [gameStateManager]);

  // Center button handler
  const handleCenterButtonClick = useCallback(() => {
    setGameState(prev => {
      // 如果游戏还未开始，先启动游戏
      if (prev.gameStatus === 'ready') {
        const startedState = gameStateManager.startGame(prev);
        return gameStateManager.handleCenterButtonClick(startedState);
      }
      
      return gameStateManager.handleCenterButtonClick(prev);
    });
  }, [gameStateManager]);

  // Reset game
  const resetGame = useCallback(() => {
    const newState = gameStateManager.resetGameState();
    setGameState(newState);
  }, [gameStateManager]);

  // 手动启动游戏方法
  const startGame = useCallback(() => {
    setGameState(prev => gameStateManager.startGame(prev));
  }, [gameStateManager]);

  // Main game loop
  useEffect(() => {
    // 游戏循环在ready和playing状态下都运行，但只有playing状态会更新游戏逻辑
    if (gameState.gameStatus !== 'ready' && gameState.gameStatus !== 'playing') return;

    const gameLoop = setInterval(() => {
      setGameState(prevState => {
        // 只有在playing状态下才执行游戏逻辑更新
        if (prevState.gameStatus === 'playing') {
          const deltaTime = 1 / 60; // Simulate 60 FPS
          return gameStateManager.updateGameState(prevState, deltaTime);
        }
        return prevState; // ready状态下保持状态不变
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
    startGame,
  };
};