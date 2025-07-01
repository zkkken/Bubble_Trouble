/**
 * 图片预加载 Hook
 * 提供图片预加载状态管理和优化功能
 */

import { useState, useEffect, useCallback } from 'react';
import { createImagePreloadManager, CRITICAL_IMAGES, GAME_IMAGES } from '../utils/imageOptimization';

interface UseImagePreloaderOptions {
  preloadCritical?: boolean;
  preloadGame?: boolean;
  autoStart?: boolean;
}

interface ImagePreloaderState {
  criticalLoaded: boolean;
  gameLoaded: boolean;
  isLoading: boolean;
  progress: number;
  error: string | null;
}

export const useImagePreloader = (options: UseImagePreloaderOptions = {}) => {
  const {
    preloadCritical = true,
    preloadGame = false,
    autoStart = true
  } = options;

  const [state, setState] = useState<ImagePreloaderState>({
    criticalLoaded: false,
    gameLoaded: false,
    isLoading: false,
    progress: 0,
    error: null
  });

  const [manager] = useState(() => createImagePreloadManager());

  // 预加载关键图片
  const preloadCriticalImages = useCallback(async () => {
    if (!preloadCritical || state.criticalLoaded) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await manager.preloadCriticalImages();
      setState(prev => ({ 
        ...prev, 
        criticalLoaded: true,
        progress: preloadGame ? 50 : 100
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load critical images'
      }));
    }
  }, [manager, preloadCritical, preloadGame, state.criticalLoaded]);

  // 预加载游戏图片
  const preloadGameImages = useCallback(async () => {
    if (!preloadGame || state.gameLoaded) return;

    try {
      await manager.preloadGameImages();
      setState(prev => ({ 
        ...prev, 
        gameLoaded: true,
        progress: 100
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load game images'
      }));
    }
  }, [manager, preloadGame, state.gameLoaded]);

  // 开始预加载
  const startPreloading = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, progress: 0, error: null }));

    try {
      // 先加载关键图片
      if (preloadCritical) {
        await preloadCriticalImages();
      }

      // 然后加载游戏图片
      if (preloadGame) {
        await preloadGameImages();
      }

      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Preloading failed'
      }));
    }
  }, [preloadCritical, preloadGame, preloadCriticalImages, preloadGameImages]);

  // 自动开始预加载
  useEffect(() => {
    if (autoStart) {
      startPreloading();
    }
  }, [autoStart, startPreloading]);

  // 计算总体完成状态
  const isComplete = preloadCritical ? state.criticalLoaded : true && 
                    preloadGame ? state.gameLoaded : true;

  return {
    // 状态
    ...state,
    isComplete,
    
    // 方法
    startPreloading,
    preloadCriticalImages,
    preloadGameImages,
    
    // 工具
    manager,
    
    // 统计信息
    stats: {
      criticalImagesCount: CRITICAL_IMAGES.length,
      gameImagesCount: GAME_IMAGES.length,
      totalImages: CRITICAL_IMAGES.length + (preloadGame ? GAME_IMAGES.length : 0)
    }
  };
};

/**
 * 简化的图片预加载 Hook（仅关键图片）
 */
export const useCriticalImagePreloader = () => {
  return useImagePreloader({
    preloadCritical: true,
    preloadGame: false,
    autoStart: true
  });
};

/**
 * 完整的图片预加载 Hook（所有图片）
 */
export const useFullImagePreloader = () => {
  return useImagePreloader({
    preloadCritical: true,
    preloadGame: true,
    autoStart: true
  });
};