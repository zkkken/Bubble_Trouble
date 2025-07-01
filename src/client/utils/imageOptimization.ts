/**
 * 图片优化工具函数
 * 提供图片预加载、懒加载和性能优化功能
 */

interface ImagePreloadOptions {
  priority?: 'high' | 'low';
  timeout?: number;
}

/**
 * 预加载单个图片
 */
export const preloadImage = (src: string, options: ImagePreloadOptions = {}): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timeout = options.timeout || 10000; // 10秒超时
    
    let timeoutId: NodeJS.Timeout;
    
    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      img.onload = null;
      img.onerror = null;
    };
    
    img.onload = () => {
      cleanup();
      resolve(img);
    };
    
    img.onerror = () => {
      cleanup();
      reject(new Error(`Failed to load image: ${src}`));
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
    
    img.src = src;
  });
};

/**
 * 批量预加载图片
 */
export const preloadImages = async (
  sources: string[], 
  options: ImagePreloadOptions = {}
): Promise<{ loaded: HTMLImageElement[], failed: string[] }> => {
  const results = await Promise.allSettled(
    sources.map(src => preloadImage(src, options))
  );
  
  const loaded: HTMLImageElement[] = [];
  const failed: string[] = [];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      loaded.push(result.value);
    } else {
      failed.push(sources[index] || '');
      console.warn(`Failed to preload image: ${sources[index]}`, result.reason);
    }
  });
  
  return { loaded, failed };
};

/**
 * 创建响应式图片加载器
 */
export const createResponsiveImageLoader = () => {
  const imageCache = new Map<string, HTMLImageElement>();
  
  return {
    /**
     * 加载图片（带缓存）
     */
    loadImage: async (src: string, options: ImagePreloadOptions = {}): Promise<HTMLImageElement> => {
      // 检查缓存
      if (imageCache.has(src)) {
        return imageCache.get(src)!;
      }
      
      try {
        const img = await preloadImage(src, options);
        imageCache.set(src, img);
        return img;
      } catch (error) {
        console.error(`Failed to load image: ${src}`, error);
        throw error;
      }
    },
    
    /**
     * 批量加载图片
     */
    loadImages: async (sources: string[], options: ImagePreloadOptions = {}) => {
      return preloadImages(sources, options);
    },
    
    /**
     * 清除缓存
     */
    clearCache: () => {
      imageCache.clear();
    },
    
    /**
     * 获取缓存大小
     */
    getCacheSize: () => imageCache.size
  };
};

/**
 * 游戏关键图片列表
 */
export const CRITICAL_IMAGES = [
  "/Title_BubbleTrouble.png",
  "/Are_You_Ready_For_A_Wash.png", 
  "/Button_Start.png",
  "/Bg_Main.png"
];

export const GAME_IMAGES = [
  "/Button_Music_On.png",
  "/Button_Music_Off.png",
  "/Button_Help.png",
  "/Cat_1.png",
  "/Cat_2.png",
  "/Cat_3.png",
  "/Cat_4.png",
  "/Cat_5.png",
  "/Cat_6.png",
  "/Cat_7.png",
  "/background-1.png",
  "/background-2.png",
  "/background-3.png",
  "/background-4.png",
  "/background-5.png"
];

/**
 * 创建图片预加载管理器
 */
export const createImagePreloadManager = () => {
  let isPreloading = false;
  const loader = createResponsiveImageLoader();
  
  return {
    /**
     * 预加载关键图片
     */
    preloadCriticalImages: async (): Promise<void> => {
      if (isPreloading) return;
      isPreloading = true;
      
      try {
        console.log('🖼️ 开始预加载关键图片...');
        const { loaded, failed } = await loader.loadImages(CRITICAL_IMAGES, { priority: 'high' });
        console.log(`✅ 关键图片预加载完成: ${loaded.length}/${CRITICAL_IMAGES.length}`);
        
        if (failed.length > 0) {
          console.warn('⚠️ 部分关键图片加载失败:', failed);
        }
      } catch (error) {
        console.error('❌ 关键图片预加载失败:', error);
      } finally {
        isPreloading = false;
      }
    },
    
    /**
     * 预加载游戏图片（低优先级）
     */
    preloadGameImages: async (): Promise<void> => {
      try {
        console.log('🎮 开始预加载游戏图片...');
        const { loaded, failed } = await loader.loadImages(GAME_IMAGES, { priority: 'low' });
        console.log(`✅ 游戏图片预加载完成: ${loaded.length}/${GAME_IMAGES.length}`);
        
        if (failed.length > 0) {
          console.warn('⚠️ 部分游戏图片加载失败:', failed);
        }
      } catch (error) {
        console.error('❌ 游戏图片预加载失败:', error);
      }
    },
    
    /**
     * 获取加载器实例
     */
    getLoader: () => loader
  };
};

/**
 * 创建懒加载观察器
 */
export const createLazyLoadObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };
  
  return new IntersectionObserver(callback, defaultOptions);
};

/**
 * 优化图片元素
 */
export const optimizeImageElement = (img: HTMLImageElement, options: {
  loading?: 'eager' | 'lazy';
  decoding?: 'sync' | 'async' | 'auto';
  fetchPriority?: 'high' | 'low' | 'auto';
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
  
  // 设置图片渲染优化
  img.style.imageRendering = 'crisp-edges';
  
  return img;
};