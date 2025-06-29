/**
 * 响应式工具函数
 * Responsive Utility Functions for Devvit
 */

// 字体大小映射表 (像素 -> Devvit 枚举)
const FONT_SIZE_MAP = {
  xxlarge: 24,
  xlarge: 18,
  large: 16,
  medium: 14,
  small: 12,
  xsmall: 10,
} as const;

// 间距映射表 (像素 -> Devvit 枚举)
const SPACING_MAP = {
  large: 32,
  medium: 16,
  small: 8,
  xsmall: 4,
} as const;

/**
 * 获取响应式字体大小
 * @param baseSizeInPx 原始设计中的像素大小
 * @param scaleFactor 缩放因子 (viewport.width / 724)
 * @returns Devvit 字体大小枚举
 */
export const getResponsiveFontSize = (
  baseSizeInPx: number, 
  scaleFactor: number
): 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge' => {
  const targetSize = baseSizeInPx * scaleFactor;
  
  // 找到最接近的字体大小
  if (targetSize >= FONT_SIZE_MAP.xxlarge) return 'xxlarge';
  if (targetSize >= FONT_SIZE_MAP.xlarge) return 'xlarge';
  if (targetSize >= FONT_SIZE_MAP.large) return 'large';
  if (targetSize >= FONT_SIZE_MAP.medium) return 'medium';
  if (targetSize >= FONT_SIZE_MAP.small) return 'small';
  return 'xsmall';
};

/**
 * 获取响应式间距
 * @param baseSizeInPx 原始设计中的像素大小
 * @param scaleFactor 缩放因子 (viewport.width / 724)
 * @returns Devvit 间距枚举
 */
export const getResponsiveSpacing = (
  baseSizeInPx: number, 
  scaleFactor: number
): 'xsmall' | 'small' | 'medium' | 'large' => {
  const targetSize = baseSizeInPx * scaleFactor;
  
  // 找到最接近的间距大小
  if (targetSize >= SPACING_MAP.large) return 'large';
  if (targetSize >= SPACING_MAP.medium) return 'medium';
  if (targetSize >= SPACING_MAP.small) return 'small';
  return 'xsmall';
};

/**
 * 计算响应式尺寸
 * @param originalSize 原始像素尺寸
 * @param scaleFactor 缩放因子
 * @returns 缩放后的尺寸
 */
export const getResponsiveSize = (originalSize: number, scaleFactor: number): number => {
  return Math.round(originalSize * scaleFactor);
};

/**
 * 获取响应式宽度百分比
 * @param originalWidth 原始宽度 (像素)
 * @param containerWidth 容器宽度 (像素，默认724)
 * @returns 百分比字符串
 */
export const getResponsiveWidthPercent = (
  originalWidth: number, 
  containerWidth: number = 724
): string => {
  const percentage = (originalWidth / containerWidth) * 100;
  return `${Math.round(percentage)}%`;
};

/**
 * 响应式布局辅助函数
 */
export const ResponsiveLayout = {
  /**
   * 计算缩放因子
   */
  getScaleFactor: (viewportWidth: number, baseWidth: number = 724): number => {
    return viewportWidth / baseWidth;
  },
  
  /**
   * 获取响应式容器尺寸
   */
  getContainerSize: (
    originalWidth: number, 
    originalHeight: number, 
    scaleFactor: number
  ): { width: number; height: number } => {
    return {
      width: Math.round(originalWidth * scaleFactor),
      height: Math.round(originalHeight * scaleFactor),
    };
  },
  
  /**
   * 获取响应式图片尺寸
   */
  getImageSize: (
    originalWidth: number, 
    originalHeight: number, 
    scaleFactor: number
  ): { 
    width: number; 
    height: number; 
    imageWidth: number; 
    imageHeight: number; 
  } => {
    const scaledWidth = Math.round(originalWidth * scaleFactor);
    const scaledHeight = Math.round(originalHeight * scaleFactor);
    
    return {
      width: scaledWidth,
      height: scaledHeight,
      imageWidth: scaledWidth,
      imageHeight: scaledHeight,
    };
  },
};

/**
 * 响应式断点
 */
export const ResponsiveBreakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  
  isMobile: (viewportWidth: number): boolean => viewportWidth < ResponsiveBreakpoints.mobile,
  isTablet: (viewportWidth: number): boolean => 
    viewportWidth >= ResponsiveBreakpoints.mobile && viewportWidth < ResponsiveBreakpoints.desktop,
  isDesktop: (viewportWidth: number): boolean => viewportWidth >= ResponsiveBreakpoints.desktop,
};

/**
 * 响应式主题配置
 */
export const ResponsiveTheme = {
  /**
   * 根据视口大小获取主题配置
   */
  getThemeConfig: (viewportWidth: number) => {
    const scaleFactor = ResponsiveLayout.getScaleFactor(viewportWidth);
    
    return {
      scaleFactor,
      spacing: {
        xs: getResponsiveSpacing(4, scaleFactor),
        sm: getResponsiveSpacing(8, scaleFactor),
        md: getResponsiveSpacing(16, scaleFactor),
        lg: getResponsiveSpacing(32, scaleFactor),
      },
      fontSize: {
        xs: getResponsiveFontSize(10, scaleFactor),
        sm: getResponsiveFontSize(12, scaleFactor),
        md: getResponsiveFontSize(14, scaleFactor),
        lg: getResponsiveFontSize(16, scaleFactor),
        xl: getResponsiveFontSize(18, scaleFactor),
        xxl: getResponsiveFontSize(24, scaleFactor),
      },
    };
  },
};