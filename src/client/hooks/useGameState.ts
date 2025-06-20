/**
 * 游戏状态管理 Hook
 * 封装游戏状态逻辑，供组件使用，支持测试模式
 * 
 * @author 开发者C - 数据管理负责人
 */

import { useState, useEffect, useCallback } from 'react';
import { GameState, GameConfig } from '../types/GameTypes';
import { GameStateManager } from '../systems/GameStateManager';
import { isTestMode, debugLog } from '../config/testMode';
import { mockGameApiService } from '../services/mockGameApi';

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

  // 在测试模式下，保存状态到本地存储
  const saveStateInTestMode = useCallback((state: GameState, round: number) => {
    if (isTestMode()) {
      mockGameApiService.saveGameState(state);
      mockGameApiService.saveCurrentRound(round);
    }
  }, []);

  // Temperature control handlers
  const handlePlusPress = useCallback(() => {
    setGameState(prev => {
      const newState = { ...prev, isPlusHeld: true };
      saveStateInTestMode(newState, currentRound);
      return newState;
    });
    debugLog('Plus button pressed');
  }, [saveStateInTestMode, currentRound]);

  const handlePlusRelease = useCallback(() => {
    setGameState(prev => {
      const newState = { ...prev, isPlusHeld: false };
      saveStateInTestMode(newState, currentRound);
      return newState;
    });
    debugLog('Plus button released');
  }, [saveStateInTestMode, currentRound]);

  const handleMinusPress = useCallback(() => {
    setGameState(prev => {
      const newState = { ...prev, isMinusHeld: true };
      saveStateInTestMode(newState, currentRound);
      return newState;
    });
    debugLog('Minus button pressed');
  }, [saveStateInTestMode, currentRound]);

  const handleMinusRelease = useCallback(() => {
    setGameState(prev => {
      const newState = { ...prev, isMinusHeld: false };
      saveStateInTestMode(newState, currentRound);
      return newState;
    });
    debugLog('Minus button released');
  }, [saveStateInTestMode, currentRound]);

  // Center button handler
  const handleCenterButtonClick = useCallback(() => {
    setGameState(prev => {
      const newState = gameStateManager.handleCenterButtonClick(prev);
      saveStateInTestMode(newState, currentRound);
      debugLog('Center button clicked', { interferenceCleared: newState.interferenceEvent.isActive });
      return newState;
    });
  }, [gameStateManager, saveStateInTestMode, currentRound]);

  // Reset game
  const resetGame = useCallback(() => {
    setCurrentRound(1);
    const newConfig = { ...config, GAME_DURATION: 30 };
    gameStateManager.updateConfig(newConfig);
    const newState = gameStateManager.resetGameState();
    setGameState(newState);
    saveStateInTestMode(newState, 1);
    debugLog('Game reset');
  }, [gameStateManager, config, saveStateInTestMode]);

  // Start next round
  const startNextRound = useCallback(() => {
    const nextRound = currentRound + 1;
    const newDuration = Math.max(10, 30 - ((nextRound - 1) * 10));
    const newConfig = { ...config, GAME_DURATION: newDuration };
    
    setCurrentRound(nextRound);
    gameStateManager.updateConfig(newConfig);
    const newState = gameStateManager.resetGameState();
    setGameState(newState);
    saveStateInTestMode(newState, nextRound);
    debugLog('Next round started', { round: nextRound, duration: newDuration });
  }, [currentRound, gameStateManager, config, saveStateInTestMode]);

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
        
        // 在测试模式下定期保存状态
        if (isTestMode()) {
          saveStateInTestMode(newState, currentRound);
        }
        
        return newState;
      });
    }, 1000/60);

    return () => clearInterval(gameLoop);
  }, [gameState.gameStatus, gameStateManager, saveStateInTestMode, currentRound]);

  // 在测试模式下显示调试信息
  useEffect(() => {
    if (isTestMode()) {
      debugLog('Game state updated', {
        temperature: Math.round(gameState.currentTemperature * 100),
        comfort: Math.round(gameState.currentComfort * 100),
        timer: Math.round(gameState.gameTimer),
        status: gameState.gameStatus,
        interference: gameState.interferenceEvent.type,
        controlsReversed: gameState.isControlsReversed
      });
    }
  }, [gameState]);

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