import { useState, useEffect } from 'react';
import { 
  getScaleFactor, 
  getResponsiveCSSVars, 
  getViewportType, 
  getScaleDebugInfo,
  getResponsiveFontSizePx,
  getResponsiveImageSize,
  getResponsiveSpacingPx,
  createResponsiveStyles,
  VIEWPORT_BREAKPOINTS,
  BASE_WIDTH 
} from '../utils';

export interface ResponsiveScale {
  scaleFactor: number;
  cssVars: Record<string, string>;
  viewportType: keyof typeof VIEWPORT_BREAKPOINTS | 'unknown';
  debugInfo: string;
  isSmallScreen: boolean;
  isMediumScreen: boolean;
  isLargeScreen: boolean;
  containerWidth: number;
  maxWidth: number;
}

/**
 * 响应式缩放 Hook (精准版本，含800px限制)
 * 基于 724px 原始设计稿进行等比例缩放
 */
export function useResponsiveScale(): ResponsiveScale {
  const [scaleFactor, setScaleFactor] = useState<number>(() => getScaleFactor());
  const [viewportType, setViewportType] = useState(() => getViewportType());

  useEffect(() => {
    const updateScaleFactor = () => {
      const newScaleFactor = getScaleFactor();
      const newViewportType = getViewportType();
      
      setScaleFactor(newScaleFactor);
      setViewportType(newViewportType);
    };

    // 监听窗口大小变化
    window.addEventListener('resize', updateScaleFactor);
    
    // 立即执行一次以确保正确的初始值
    updateScaleFactor();

    return () => {
      window.removeEventListener('resize', updateScaleFactor);
    };
  }, []);

  // 生成 CSS 变量
  const cssVars = getResponsiveCSSVars(scaleFactor);
  
  // 调试信息
  const debugInfo = getScaleDebugInfo(scaleFactor);

  // 屏幕尺寸分类（基于新的断点）
  const isSmallScreen = viewportType === 'mobile';
  const isMediumScreen = viewportType === 'tablet';
  const isLargeScreen = ['desktop', 'large', 'xlarge'].includes(viewportType);
  
  // 计算容器尺寸
  const containerWidth = Math.round(BASE_WIDTH * scaleFactor);
  const maxWidth = 800; // 最大宽度限制

  return {
    scaleFactor,
    cssVars,
    viewportType,
    debugInfo,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    containerWidth,
    maxWidth,
  };
}

/**
 * 获取响应式尺寸的辅助函数（精准版本）
 */
export function useResponsiveSize() {
  const { scaleFactor } = useResponsiveScale();
  
  return {
    /**
     * 缩放尺寸（通用）
     */
    scale: (size: number): number => {
      const result = Math.round(size * scaleFactor);
      return isNaN(result) ? size : result;
    },
    
    /**
     * 缩放字体大小（像素值）
     */
    scaleFont: (size: number): number => {
      return getResponsiveFontSizePx(size, scaleFactor);
    },
    
    /**
     * 缩放字体大小（CSS字符串）
     */
    scaleFontPx: (size: number): string => {
      const result = getResponsiveFontSizePx(size, scaleFactor);
      return `${result}px`;
    },
    
    /**
     * 缩放图片尺寸
     */
    scaleImage: (width: number, height: number) => {
      return getResponsiveImageSize(width, height, scaleFactor);
    },
    
    /**
     * 缩放间距（像素值）
     */
    scaleSpacing: (size: number): number => {
      return getResponsiveSpacingPx(size, scaleFactor);
    },
    
    /**
     * 创建响应式样式对象
     */
    createStyles: (baseStyles: Parameters<typeof createResponsiveStyles>[0]) => {
      return createResponsiveStyles(baseStyles, scaleFactor);
    },
    
    /**
     * 缩放百分比字符串（保留旧版本兼容性）
     */
    scaleRem: (size: number): string => {
      const result = size * scaleFactor;
      return isNaN(result) ? `${size}rem` : `${result}rem`;
    },
  };
} 