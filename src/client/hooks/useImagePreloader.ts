/**
 * 图片预加载 Hook - 全项目增强版
 * 提供智能图片预加载状态管理和优化功能
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  createLayeredImagePreloader, 
  createSmartPreloadStrategy,
  IMAGE_CATEGORIES,
  globalPreloadStrategy
} from '../utils/imageOptimization';

interface UseImagePreloaderOptions {
  categories?: (keyof typeof IMAGE_CATEGORIES)[];
  strategy?: 'immediate' | 'lazy' | 'smart';
  priority?: 'high' | 'low';
  autoStart?: boolean;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

interface ImagePreloaderState {
  isLoading: boolean;
  progress: number;
  loadedCategories: string[];
  failedImages: string[];
  error: string | null;
  isComplete: boolean;
}

export const useImagePreloader = (options: UseImagePreloaderOptions = {}) => {
  const {
    categories = [],
    strategy = 'smart',
    priority = 'low',
    autoStart = true,
    onProgress,
    onComplete,
    onError
  } = options;

  const [state, setState] = useState<ImagePreloaderState>({
    isLoading: false,
    progress: 0,
    loadedCategories: [],
    failedImages: [],
    error: null,
    isComplete: false
  });

  const preloaderRef = useRef(createLayeredImagePreloader());
  const strategyRef = useRef(createSmartPreloadStrategy());
  const isStartedRef = useRef(false);

  // 更新进度
  const updateProgress = useCallback(() => {
    const progress = preloaderRef.current.getProgress();
    const newProgress = categories.length > 0 
      ? Math.round((state.loadedCategories.length / categories.length) * 100)
      : progress.percentage;
    
    setState(prev => ({ ...prev, progress: newProgress }));
    onProgress?.(newProgress);
  }, [categories.length, state.loadedCategories.length, onProgress]);

  // 预加载指定类别
  const preloadCategories = useCallback(async (categoriesToLoad: (keyof typeof IMAGE_CATEGORIES)[]) => {
    if (categoriesToLoad.length === 0) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const results = await Promise.allSettled(
        categoriesToLoad.map(category => 
          preloaderRef.current.preloadCategory(category, priority)
        )
      );

      const newLoadedCategories: string[] = [];
      const newFailedImages: string[] = [];

      results.forEach((result, index) => {
        const categoryName = categoriesToLoad[index];
        if (result.status === 'fulfilled') {
          newLoadedCategories.push(categoryName);
          newFailedImages.push(...result.value.failed);
        } else {
          const errorMsg = `Failed to load category ${categoryName}: ${result.reason}`;
          console.error(errorMsg);
          onError?.(errorMsg);
        }
      });

      setState(prev => ({
        ...prev,
        loadedCategories: [...prev.loadedCategories, ...newLoadedCategories],
        failedImages: [...prev.failedImages, ...newFailedImages],
        isLoading: false,
        isComplete: newLoadedCategories.length === categoriesToLoad.length
      }));

      if (newLoadedCategories.length === categoriesToLoad.length) {
        onComplete?.();
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown preload error';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMsg 
      }));
      onError?.(errorMsg);
    }
  }, [priority, onComplete, onError]);

  // 智能预加载策略
  const executeSmartStrategy = useCallback(async (strategyName: string) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      switch (strategyName) {
        case 'launch':
          await strategyRef.current.preloadForLaunch();
          break;
        case 'game':
          await strategyRef.current.preloadForGame();
          break;
        case 'tutorial':
          await strategyRef.current.preloadForTutorial();
          break;
        case 'selection':
          await strategyRef.current.preloadForSelection();
          break;
        case 'leaderboard':
          await strategyRef.current.preloadForLeaderboard();
          break;
        case 'completion':
          await strategyRef.current.preloadForCompletion();
          break;
        case 'help':
          await strategyRef.current.preloadForHelp();
          break;
        case 'all':
          await strategyRef.current.preloadAll();
          break;
        default:
          console.warn(`Unknown strategy: ${strategyName}`);
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isComplete: true,
        progress: 100
      }));
      onComplete?.();

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Strategy execution failed';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMsg 
      }));
      onError?.(errorMsg);
    }
  }, [onComplete, onError]);

  // 开始预加载
  const startPreloading = useCallback(async (customCategories?: (keyof typeof IMAGE_CATEGORIES)[]) => {
    if (isStartedRef.current) return;
    isStartedRef.current = true;

    const categoriesToLoad = customCategories || categories;

    if (strategy === 'smart') {
      // 使用智能策略，根据当前页面自动选择
      const currentPath = window.location.pathname;
      let strategyName = 'launch';
      
      if (currentPath.includes('game')) strategyName = 'game';
      else if (currentPath.includes('tutorial')) strategyName = 'tutorial';
      else if (currentPath.includes('selection')) strategyName = 'selection';
      else if (currentPath.includes('leaderboard')) strategyName = 'leaderboard';
      else if (currentPath.includes('completion')) strategyName = 'completion';
      else if (currentPath.includes('help')) strategyName = 'help';
      
      await executeSmartStrategy(strategyName);
    } else if (categoriesToLoad.length > 0) {
      await preloadCategories(categoriesToLoad);
    }
  }, [categories, strategy, preloadCategories, executeSmartStrategy]);

  // 自动开始预加载
  useEffect(() => {
    if (autoStart && !isStartedRef.current) {
      startPreloading();
    }
  }, [autoStart, startPreloading]);

  // 更新进度
  useEffect(() => {
    updateProgress();
  }, [updateProgress]);

  return {
    // 状态
    ...state,
    
    // 方法
    startPreloading,
    preloadCategories,
    executeSmartStrategy,
    
    // 工具方法
    preloadForCurrentPage: () => {
      const currentComponent = document.querySelector('[data-component]')?.getAttribute('data-component');
      if (currentComponent) {
        executeSmartStrategy(currentComponent);
      }
    },
    
    // 重置
    reset: () => {
      isStartedRef.current = false;
      setState({
        isLoading: false,
        progress: 0,
        loadedCategories: [],
        failedImages: [],
        error: null,
        isComplete: false
      });
    },
    
    // 获取实例
    getPreloader: () => preloaderRef.current,
    getStrategy: () => strategyRef.current,
    
    // 统计信息
    stats: {
      totalCategories: Object.keys(IMAGE_CATEGORIES).length,
      availableCategories: Object.keys(IMAGE_CATEGORIES),
      loadedCount: state.loadedCategories.length,
      failedCount: state.failedImages.length
    }
  };
};

/**
 * 页面级图片预加载 Hook
 */
export const usePageImagePreloader = (pageName: string) => {
  const getCategoriesForPage = (page: string): (keyof typeof IMAGE_CATEGORIES)[] => {
    switch (page) {
      case 'launch':
        return ['LAUNCH_CRITICAL', 'LAUNCH_SECONDARY'];
      case 'game':
        return ['GAME_CORE', 'CAT_AVATARS', 'BACKGROUNDS', 'INTERFERENCE', 'FALLING_ITEMS'];
      case 'tutorial':
        return ['TUTORIAL', 'GAME_CORE'];
      case 'selection':
        return ['SELECTION', 'CONTINENTS', 'CAT_AVATARS'];
      case 'leaderboard':
        return ['LEADERBOARD', 'CONTINENTS'];
      case 'completion':
        return ['COMPLETION', 'LEADERBOARD'];
      case 'help':
        return ['HELP'];
      default:
        return [];
    }
  };

  return useImagePreloader({
    categories: getCategoriesForPage(pageName),
    strategy: 'immediate',
    priority: 'high',
    autoStart: true
  });
};

/**
 * 全局图片预加载 Hook
 */
export const useGlobalImagePreloader = () => {
  const [globalState, setGlobalState] = useState({
    isInitialized: false,
    progress: 0
  });

  useEffect(() => {
    if (!globalState.isInitialized) {
      // 使用全局策略进行预加载
      globalPreloadStrategy.preloadForLaunch().then(() => {
        setGlobalState({ isInitialized: true, progress: 100 });
      });
    }
  }, [globalState.isInitialized]);

  return {
    ...globalState,
    preloadForPage: (pageName: string) => {
      switch (pageName) {
        case 'game':
          return globalPreloadStrategy.preloadForGame();
        case 'tutorial':
          return globalPreloadStrategy.preloadForTutorial();
        case 'selection':
          return globalPreloadStrategy.preloadForSelection();
        case 'leaderboard':
          return globalPreloadStrategy.preloadForLeaderboard();
        case 'completion':
          return globalPreloadStrategy.preloadForCompletion();
        case 'help':
          return globalPreloadStrategy.preloadForHelp();
        default:
          return Promise.resolve();
      }
    }
  };
};

/**
 * 简化的关键图片预加载 Hook
 */
export const useCriticalImagePreloader = () => {
  return useImagePreloader({
    categories: ['LAUNCH_CRITICAL', 'GAME_CORE'],
    strategy: 'immediate',
    priority: 'high',
    autoStart: true
  });
};

/**
 * 懒加载图片 Hook
 */
export const useLazyImageLoader = (threshold = 0.1, rootMargin = '50px') => {
  const [loadedImages, setLoadedImages] = useState(new Set<string>());
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const dataSrc = img.dataset.src;
            
            if (dataSrc && !loadedImages.has(dataSrc)) {
              img.src = dataSrc;
              img.removeAttribute('data-src');
              setLoadedImages(prev => new Set(prev).add(dataSrc));
              observer.unobserve(img);
            }
          }
        });
      },
      { threshold, rootMargin }
    );

    return () => observer.disconnect();
  }, [threshold, rootMargin, loadedImages]);

  const observeImage = useCallback((img: HTMLImageElement) => {
    if (img.dataset.src) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const image = entry.target as HTMLImageElement;
              const dataSrc = image.dataset.src;
              if (dataSrc) {
                image.src = dataSrc;
                image.removeAttribute('data-src');
                observer.unobserve(image);
              }
            }
          });
        },
        { threshold, rootMargin }
      );
      
      observer.observe(img);
    }
  }, [threshold, rootMargin]);

  return { observeImage, loadedImages };
};