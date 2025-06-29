/**
 * Devvit 响应式工具函数集
 * 实现像素级完美缩放，基于 724px 设计基准
 * 兼容当前 Devvit API
 */

// 设计基准宽度
export const BASE_WIDTH = 724;

// 预设的视口宽度映射（关键断点）
export const VIEWPORT_PRESETS = {
  mobile: 344,      // 移动端参考基准
  desktop: 724,     // 桌面基准
  large: 1024       // 大屏
} as const;

/**
 * 计算全局缩放因子
 * @param viewportWidth 当前视口宽度（如果不可用则使用移动端默认值）
 * @returns 缩放因子
 */
export function getScaleFactor(viewportWidth?: number): number {
  // 如果没有提供视口宽度，使用移动端默认值
  const actualWidth = viewportWidth || VIEWPORT_PRESETS.mobile;
  return actualWidth / BASE_WIDTH;
}

/**
 * 获取响应式字体大小
 * @param baseSizeInPx 基础像素大小（在724px设计稿中的大小）
 * @param scaleFactor 缩放因子
 * @returns Devvit字体大小枚举
 */
export function getResponsiveFontSize(
  baseSizeInPx: number, 
  scaleFactor: number
): 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge' {
  const targetSize = baseSizeInPx * scaleFactor;
  
  if (targetSize >= 24) return 'xxlarge';
  if (targetSize >= 18) return 'xlarge';
  if (targetSize >= 16) return 'large';
  if (targetSize >= 14) return 'medium';
  if (targetSize >= 12) return 'small';
  return 'xsmall';
}

/**
 * 获取响应式间距大小
 * @param baseSizeInPx 基础像素大小（在724px设计稿中的大小）
 * @param scaleFactor 缩放因子
 * @returns Devvit间距大小枚举
 */
export function getResponsiveSpacing(
  baseSizeInPx: number, 
  scaleFactor: number
): 'small' | 'medium' | 'large' {
  const targetSize = baseSizeInPx * scaleFactor;
  
  if (targetSize >= 32) return 'large';
  if (targetSize >= 16) return 'medium';
  return 'small';
}

/**
 * 获取响应式像素值
 * @param baseSizeInPx 基础像素大小
 * @param scaleFactor 缩放因子
 * @returns 缩放后的像素值字符串
 */
export function getResponsivePixels(baseSizeInPx: number, scaleFactor: number): string {
  return `${Math.round(baseSizeInPx * scaleFactor)}px`;
}

/**
 * 获取响应式图片尺寸
 * @param baseWidthInPx 基础宽度像素
 * @param baseHeightInPx 基础高度像素
 * @param scaleFactor 缩放因子
 * @returns 缩放后的图片尺寸，符合Devvit类型要求
 */
export function getResponsiveImageSize(
  baseWidthInPx: number, 
  baseHeightInPx: number, 
  scaleFactor: number
): { 
  width: 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge'; 
  height: 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge'; 
  imageWidth: number; 
  imageHeight: number 
} {
  const widthPx = Math.round(baseWidthInPx * scaleFactor);
  const heightPx = Math.round(baseHeightInPx * scaleFactor);
  
  // 将像素值映射到Devvit的尺寸枚举
  const getDevvitSize = (pixels: number): 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge' => {
    if (pixels >= 200) return 'xxlarge';
    if (pixels >= 150) return 'xlarge'; 
    if (pixels >= 100) return 'large';
    if (pixels >= 60) return 'medium';
    if (pixels >= 30) return 'small';
    return 'xsmall';
  };
  
  return {
    width: getDevvitSize(widthPx),
    height: getDevvitSize(heightPx),
    imageWidth: widthPx,
    imageHeight: heightPx
  };
}

/**
 * 尝试获取视口宽度（兼容性优先）
 * @param context Devvit context对象
 * @returns 视口宽度或默认值
 */
export function getViewportWidth(context: any): number {
  try {
    // 尝试获取视口信息（可能在某些Devvit版本中不可用）
    if (context?.uiEnvironment?.viewport?.width) {
      return context.uiEnvironment.viewport.width;
    }
    
    // 回退到其他可能的属性
    if (context?.dimensions?.width) {
      return context.dimensions.width;
    }
    
    // 如果都不可用，返回移动端默认值以确保在小屏幕上正常显示
    console.log('🎯 Viewport width not available, using mobile default');
    return VIEWPORT_PRESETS.mobile;
  } catch (error) {
    console.log('🎯 Error getting viewport width, using mobile fallback:', error);
    return VIEWPORT_PRESETS.mobile;
  }
}

/**
 * 响应式调试信息
 * @param viewportWidth 视口宽度
 * @param scaleFactor 缩放因子
 */
export function logResponsiveInfo(viewportWidth: number, scaleFactor: number): void {
  console.log(`🎯 Responsive Debug Info:
    - Viewport: ${viewportWidth}px
    - Base: ${BASE_WIDTH}px  
    - Scale Factor: ${scaleFactor.toFixed(3)}
    - Target Range: ${VIEWPORT_PRESETS.mobile}px-${VIEWPORT_PRESETS.large}px+`);
}

/**
 * 获取响应式预设（基于已知设备类型）
 * @param deviceType 设备类型
 * @returns 缩放因子
 */
export function getResponsivePreset(deviceType: keyof typeof VIEWPORT_PRESETS): number {
  return getScaleFactor(VIEWPORT_PRESETS[deviceType]);
} 