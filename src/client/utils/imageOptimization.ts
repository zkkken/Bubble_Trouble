/**
 * 图片优化工具函数 - 全项目版本
 * 提供图片预加载、懒加载和性能优化功能
 */

interface ImagePreloadOptions {
  priority?: 'high' | 'low';
  timeout?: number;
  retries?: number;
}

interface ImageLoadResult {
  success: boolean;
  element?: HTMLImageElement;
  error?: string;
}

/**
 * 预加载单个图片（增强版）
 */
export const preloadImage = (src: string, options: ImagePreloadOptions = {}): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timeout = options.timeout || 15000; // 15秒超时
    const retries = options.retries || 2;
    
    let timeoutId: NodeJS.Timeout;
    let retryCount = 0;
    
    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      img.onload = null;
      img.onerror = null;
    };
    
    const attemptLoad = () => {
      img.onload = () => {
        cleanup();
        resolve(img);
      };
      
      img.onerror = () => {
        if (retryCount < retries) {
          retryCount++;
          console.warn(`Retrying image load (${retryCount}/${retries}): ${src}`);
          setTimeout(attemptLoad, 1000 * retryCount); // 递增延迟重试
        } else {
          cleanup();
          reject(new Error(`Failed to load image after ${retries} retries: ${src}`));
        }
      };
      
      // 设置超时
      timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error(`Image load timeout: ${src}`));
      }, timeout);
      
      // 设置图片属性
      if (options.priority === 'high') {
        img.fetchPriority = 'high';
      }
      img.crossOrigin = 'anonymous';
      img.decoding = 'async';
      
      img.src = src;
    };
    
    attemptLoad();
  });
};

/**
 * 批量预加载图片（增强版）
 */
export const preloadImages = async (
  sources: string[], 
  options: ImagePreloadOptions = {}
): Promise<{ loaded: HTMLImageElement[], failed: string[], results: ImageLoadResult[] }> => {
  const results = await Promise.allSettled(
    sources.map(async (src) => {
      try {
        const img = await preloadImage(src, options);
        return { success: true, element: img, src };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          src 
        };
      }
    })
  );
  
  const loaded: HTMLImageElement[] = [];
  const failed: string[] = [];
  const loadResults: ImageLoadResult[] = [];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const data = result.value;
      if (data.success && data.element) {
        loaded.push(data.element);
        loadResults.push({ success: true, element: data.element });
      } else {
        failed.push(sources[index] || '');
        loadResults.push({ success: false, error: data.error || 'Unknown error' });
        console.warn(`Failed to preload image: ${sources[index]}`, data.error);
      }
    } else {
      failed.push(sources[index] || '');
      loadResults.push({ success: false, error: String(result.reason || 'Unknown error') });
      console.warn(`Failed to preload image: ${sources[index]}`, result.reason);
    }
  });
  
  return { loaded, failed, results: loadResults };
};

/**
 * 创建高级图片加载器
 */
export const createAdvancedImageLoader = () => {
  const imageCache = new Map<string, HTMLImageElement>();
  const loadingPromises = new Map<string, Promise<HTMLImageElement>>();
  
  return {
    /**
     * 加载图片（带缓存和去重）
     */
    loadImage: async (src: string, options: ImagePreloadOptions = {}): Promise<HTMLImageElement> => {
      // 检查缓存
      if (imageCache.has(src)) {
        return imageCache.get(src)!;
      }
      
      // 检查是否正在加载
      if (loadingPromises.has(src)) {
        return loadingPromises.get(src)!;
      }
      
      // 开始加载
      const loadPromise = preloadImage(src, options).then(img => {
        imageCache.set(src, img);
        loadingPromises.delete(src);
        return img;
      }).catch(error => {
        loadingPromises.delete(src);
        throw error;
      });
      
      loadingPromises.set(src, loadPromise);
      return loadPromise;
    },
    
    /**
     * 批量加载图片
     */
    loadImages: async (sources: string[], options: ImagePreloadOptions = {}) => {
      return preloadImages(sources, options);
    },
    
    /**
     * 预热缓存
     */
    warmCache: async (sources: string[], options: ImagePreloadOptions = {}) => {
      const promises = sources.map(src => 
        this.loadImage(src, options).catch((error: any) => {
          console.warn(`Failed to warm cache for: ${src}`, error);
          return null;
        })
      );
      
      const results = await Promise.all(promises);
      return results.filter(Boolean) as HTMLImageElement[];
    },
    
    /**
     * 清除缓存
     */
    clearCache: () => {
      imageCache.clear();
      loadingPromises.clear();
    },
    
    /**
     * 获取缓存统计
     */
    getStats: () => ({
      cached: imageCache.size,
      loading: loadingPromises.size,
      total: imageCache.size + loadingPromises.size
    })
  };
};

/**
 * 全项目图片资源配置
 */
export const IMAGE_CATEGORIES = {
  // 启动界面关键图片
  LAUNCH_CRITICAL: [
    "/Title_BubbleTrouble.png",
    "/Button_Start.png",
    "/Bg_Main.png",
    "/bg-main.png"
  ],
  
  // 启动界面次要图片
  LAUNCH_SECONDARY: [
    "/Button_Music_On.png",
    "/Button_Music_Off.png",
    "/Button_Help.png"
  ],
  
  // 游戏界面核心图片
  GAME_CORE: [
    "/button-temp-minus.png",
    "/button-temp-plus.png",
    "/icon-tap.png",
    "/clock-icon.png",
    "/icon-comfortbar-fail.png",
    "/icon-comfortbar-succ.png"
  ],
  
  // 猫咪头像
  CAT_AVATARS: [
    "/Cat_1.png",
    "/Cat_2.png",
    "/Cat_3.png",
    "/Cat_4.png",
    "/Cat_5.png",
    "/Cat_6.png",
    "/Cat_7.png"
  ],
  
  // 游戏背景
  BACKGROUNDS: [
    "/background-1.png",
    "/background-2.png",
    "/background-3.png",
    "/background-4.png",
    "/background-5.png"
  ],
  
  // 干扰事件图片
  INTERFERENCE: [
    "/Bubble_Time!.png",
    "/Electric_leakage.png",
    "/Controls_reversed.png",
    "/Surprise_Drop!.png",
    "/Cold_wind.png"
  ],
  
  // 掉落物品
  FALLING_ITEMS: [
    "/Rubber_Duck.png",
    "/Fish.png",
    "/Comb.png",
    "/Grime_Goblin.png",
    "/Alarm_Clock.png"
  ],
  
  // 教程界面
  TUTORIAL: [
    "/bg-tutorial.png",
    "/image-dialog-1.png",
    "/image-dialog-2.png",
    "/image-dialog-3.png",
    "/image-dialog-4.png",
    "/image-dialog-5.png",
    "/icon-hand.png",
    "/icon-hand-3.png",
    "/icon-hand-4.png",
    "/icon-hand-5.png",
    "/icon-sparklers-1.png",
    "/icon-sparklers-2.png",
    "/icon-sparklers-3.png"
  ],
  
  // 选择界面
  SELECTION: [
    "/Title_ChooseYouCat.png",
    "/map.png",
    "/Button_Random.png",
    "/Close_button.png",
    "/nametag.png"
  ],
  
  // 地区图片
  CONTINENTS: [
    "/asia.png",
    "/africa.png",
    "/europe.png",
    "/namerica.png",
    "/samerica.png",
    "/oceania.png"
  ],
  
  // 排行榜界面
  LEADERBOARD: [
    "/banner-succ.png",
    "/banner-succ-5.png",
    "/card-bg-1.png",
    "/card-bg-s-5.png",
    "/rankingbadge--1.png",
    "/rankingbadge--2.png",
    "/rankingbadge--3.png",
    "/rankingbadge-normal-2.png",
    "/icon-back.png",
    "/icon-ranking.png"
  ],
  
  // 结算界面
  COMPLETION: [
    "/icon-restart.png",
    "/icon-share.png",
    "/icon-victoryhand.png",
    "/share_result.png"
  ],
  
  // 帮助界面
  HELP: [
    "/instructions-title.png",
    "/keep-your-cat-comfortable.png",
    "/start-button.png"
  ],
  
  // 温度指示器
  TEMPERATURE: [
    "/18°C.png",
    "/28°C.png",
    "/38°C.png",
    "/48°C.png"
  ],
  
  // 其他UI元素
  UI_ELEMENTS: [
    "/bubble.png",
    "/redom-below.png",
    "/diff-up.png",
    "/icon-skip-1.png"
  ]
};

/**
 * 创建分层图片预加载管理器
 */
export const createLayeredImagePreloader = () => {
  const loader = createAdvancedImageLoader();
  const loadedCategories = new Set<string>();
  
  return {
    /**
     * 预加载指定类别的图片
     */
    preloadCategory: async (categoryName: keyof typeof IMAGE_CATEGORIES, priority: 'high' | 'low' = 'low') => {
      const category = IMAGE_CATEGORIES[categoryName];
      if (!category || loadedCategories.has(categoryName)) {
        return { loaded: [], failed: [] };
      }
      
      console.log(`🖼️ 预加载图片类别: ${categoryName} (${category.length}张)`);
      
      try {
        const result = await loader.loadImages(category, { priority, timeout: 20000 });
        loadedCategories.add(categoryName);
        
        console.log(`✅ ${categoryName} 预加载完成: ${result.loaded.length}/${category.length}`);
        if (result.failed.length > 0) {
          console.warn(`⚠️ ${categoryName} 部分图片失败:`, result.failed);
        }
        
        return result;
      } catch (error) {
        console.error(`❌ ${categoryName} 预加载失败:`, error);
        throw error;
      }
    },
    
    /**
     * 预加载多个类别
     */
    preloadCategories: async (categories: (keyof typeof IMAGE_CATEGORIES)[], priority: 'high' | 'low' = 'low') => {
      const results = await Promise.allSettled(
        categories.map(category => this.preloadCategory(category, priority))
      );
      
      let totalLoaded = 0;
      let totalFailed = 0;
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          totalLoaded += result.value.loaded.length;
          totalFailed += result.value.failed.length;
        } else {
          console.error(`Failed to preload category ${categories[index] || 'unknown'}:`, result.reason);
        }
      });
      
      console.log(`📊 批量预加载完成: ${totalLoaded} 成功, ${totalFailed} 失败`);
      return { totalLoaded, totalFailed };
    },
    
    /**
     * 获取预加载进度
     */
    getProgress: () => {
      const totalCategories = Object.keys(IMAGE_CATEGORIES).length;
      const loadedCount = loadedCategories.size;
      return {
        loaded: loadedCount,
        total: totalCategories,
        percentage: Math.round((loadedCount / totalCategories) * 100)
      };
    },
    
    /**
     * 检查类别是否已加载
     */
    isCategoryLoaded: (categoryName: keyof typeof IMAGE_CATEGORIES) => {
      return loadedCategories.has(categoryName);
    },
    
    /**
     * 获取加载器实例
     */
    getLoader: () => loader,
    
    /**
     * 清除所有缓存
     */
    clearAll: () => {
      loader.clearCache();
      loadedCategories.clear();
    }
  };
};

/**
 * 创建智能图片预加载策略
 */
export const createSmartPreloadStrategy = () => {
  const preloader = createLayeredImagePreloader();
  
  return {
    /**
     * 启动界面预加载策略
     */
    preloadForLaunch: async () => {
      // 高优先级：关键启动图片
      await preloader.preloadCategory('LAUNCH_CRITICAL', 'high');
      
      // 低优先级：次要启动图片
      setTimeout(() => {
        preloader.preloadCategory('LAUNCH_SECONDARY', 'low');
      }, 100);
    },
    
    /**
     * 游戏界面预加载策略
     */
    preloadForGame: async () => {
      // 并行加载游戏核心资源
      await Promise.all([
        preloader.preloadCategory('GAME_CORE', 'high'),
        preloader.preloadCategory('CAT_AVATARS', 'high'),
        preloader.preloadCategory('BACKGROUNDS', 'high')
      ]);
      
      // 延迟加载干扰和物品图片
      setTimeout(() => {
        Promise.all([
          preloader.preloadCategory('INTERFERENCE', 'low'),
          preloader.preloadCategory('FALLING_ITEMS', 'low'),
          preloader.preloadCategory('TEMPERATURE', 'low'),
          preloader.preloadCategory('UI_ELEMENTS', 'low')
        ]);
      }, 500);
    },
    
    /**
     * 教程界面预加载策略
     */
    preloadForTutorial: async () => {
      await preloader.preloadCategory('TUTORIAL', 'high');
    },
    
    /**
     * 选择界面预加载策略
     */
    preloadForSelection: async () => {
      await Promise.all([
        preloader.preloadCategory('SELECTION', 'high'),
        preloader.preloadCategory('CONTINENTS', 'high')
      ]);
    },
    
    /**
     * 排行榜界面预加载策略
     */
    preloadForLeaderboard: async () => {
      await preloader.preloadCategory('LEADERBOARD', 'high');
    },
    
    /**
     * 结算界面预加载策略
     */
    preloadForCompletion: async () => {
      await preloader.preloadCategory('COMPLETION', 'high');
    },
    
    /**
     * 帮助界面预加载策略
     */
    preloadForHelp: async () => {
      await preloader.preloadCategory('HELP', 'high');
    },
    
    /**
     * 全量预加载（用于性能充足的环境）
     */
    preloadAll: async () => {
      const allCategories = Object.keys(IMAGE_CATEGORIES) as (keyof typeof IMAGE_CATEGORIES)[];
      return preloader.preloadCategories(allCategories, 'low');
    },
    
    /**
     * 获取预加载器实例
     */
    getPreloader: () => preloader
  };
};

/**
 * 创建懒加载观察器（增强版）
 */
export const createAdvancedLazyLoader = (options: {
  rootMargin?: string;
  threshold?: number;
  unobserveAfterLoad?: boolean;
} = {}) => {
  const {
    rootMargin = '100px',
    threshold = 0.1,
    unobserveAfterLoad = true
  } = options;
  
  const loadedElements = new WeakSet<Element>();
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !loadedElements.has(entry.target)) {
        const img = entry.target as HTMLImageElement;
        const dataSrc = img.dataset.src;
        
        if (dataSrc) {
          img.src = dataSrc;
          img.removeAttribute('data-src');
          loadedElements.add(img);
          
          if (unobserveAfterLoad) {
            observer.unobserve(img);
          }
        }
      }
    });
  }, {
    rootMargin,
    threshold
  });
  
  return {
    observe: (element: Element) => observer.observe(element),
    unobserve: (element: Element) => observer.unobserve(element),
    disconnect: () => observer.disconnect(),
    isLoaded: (element: Element) => loadedElements.has(element)
  };
};

/**
 * 优化图片元素（增强版）
 */
export const optimizeImageElement = (img: HTMLImageElement, options: {
  loading?: 'eager' | 'lazy';
  decoding?: 'sync' | 'async' | 'auto';
  fetchPriority?: 'high' | 'low' | 'auto';
  sizes?: string;
  srcset?: string;
} = {}) => {
  // 设置加载属性
  if (options.loading) {
    img.loading = options.loading;
  }
  
  if (options.decoding) {
    img.decoding = options.decoding;
  }
  
  if (options.fetchPriority) {
    img.fetchPriority = options.fetchPriority;
  }
  
  if (options.sizes) {
    img.sizes = options.sizes;
  }
  
  if (options.srcset) {
    img.srcset = options.srcset;
  }
  
  // 设置图片渲染优化
  img.style.imageRendering = 'crisp-edges';
  
  // 添加错误处理
  img.onerror = () => {
    console.warn(`Failed to load image: ${img.src}`);
    img.style.display = 'none';
  };
  
  return img;
};

// 导出全局预加载策略实例
export const globalPreloadStrategy = createSmartPreloadStrategy();