// 响应式设计工具函数
// 基于原始设计稿的 724px 宽度进行等比例缩放

// 设计基准和限制
export const BASE_WIDTH = 724;
export const MAX_CONTAINER_WIDTH = 800; // 最大容器宽度限制
export const MIN_SCALE_FACTOR = 0.4;    // 最小缩放因子 (约290px视口)
export const MAX_SCALE_FACTOR = MAX_CONTAINER_WIDTH / BASE_WIDTH; // 最大缩放因子 (约1.105)

// 关键断点
export const VIEWPORT_BREAKPOINTS = {
  mobile: 344,      // 移动端
  tablet: 568,      // 平板
  desktop: 724,     // 桌面基准
  large: 1024,      // 大屏
  xlarge: 1440      // 超宽屏
} as const;

/**
 * 获取精准的响应式字体大小（像素值）
 * @param baseSizeInPx 在 724px 设计稿下的原始像素大小
 * @param scaleFactor 缩放因子
 * @return 精确的像素字体大小
 */
export function getResponsiveFontSizePx(baseSizeInPx: number, scaleFactor: number): number {
  const targetSize = Math.round(baseSizeInPx * scaleFactor);
  // 确保最小字体大小为10px，最大为36px
  return Math.max(10, Math.min(36, targetSize));
}

/**
 * 获取响应式字体大小类名（用于Tailwind）
 * @param baseSizeInPx 在 724px 设计稿下的原始像素大小
 * @param scaleFactor 缩放因子
 * @return 对应的字体大小类名字符串
 */
export function getResponsiveFontSize(baseSizeInPx: number, scaleFactor: number): string {
  const targetSize = getResponsiveFontSizePx(baseSizeInPx, scaleFactor);
  
  if (targetSize >= 30) return 'text-3xl';      // 30px+
  if (targetSize >= 24) return 'text-2xl';      // 24px+
  if (targetSize >= 20) return 'text-xl';       // 20px+
  if (targetSize >= 18) return 'text-lg';       // 18px+
  if (targetSize >= 16) return 'text-base';     // 16px+
  if (targetSize >= 14) return 'text-sm';       // 14px+
  if (targetSize >= 12) return 'text-xs';       // 12px+
  return 'text-xs';                              // 10px+
}

/**
 * 获取精准的响应式图片尺寸
 * @param baseWidthInPx 基础宽度像素
 * @param baseHeightInPx 基础高度像素  
 * @param scaleFactor 缩放因子
 * @return 缩放后的图片尺寸
 */
export function getResponsiveImageSize(
  baseWidthInPx: number, 
  baseHeightInPx: number, 
  scaleFactor: number
): { width: number; height: number; widthPx: string; heightPx: string } {
  const width = Math.round(baseWidthInPx * scaleFactor);
  const height = Math.round(baseHeightInPx * scaleFactor);
  
  return {
    width,
    height,
    widthPx: `${width}px`,
    heightPx: `${height}px`
  };
}

/**
 * 获取响应式间距大小（像素值）
 * @param baseSizeInPx 在 724px 设计稿下的原始像素大小
 * @param scaleFactor 缩放因子
 * @return 缩放后的间距像素值
 */
export function getResponsiveSpacingPx(baseSizeInPx: number, scaleFactor: number): number {
  return Math.round(baseSizeInPx * scaleFactor);
}

/**
 * 获取响应式间距大小（Tailwind类名）
 * @param baseSizeInPx 在 724px 设计稿下的原始像素大小
 * @param scaleFactor 缩放因子
 * @return 对应的间距类名字符串
 */
export function getResponsiveSpacing(baseSizeInPx: number, scaleFactor: number): string {
  const targetSize = getResponsiveSpacingPx(baseSizeInPx, scaleFactor);
  
  if (targetSize >= 32) return 'p-8';      // 32px+
  if (targetSize >= 24) return 'p-6';      // 24px+
  if (targetSize >= 16) return 'p-4';      // 16px+
  if (targetSize >= 12) return 'p-3';      // 12px+
  if (targetSize >= 8) return 'p-2';       // 8px+
  if (targetSize >= 4) return 'p-1';       // 4px+
  return 'p-0.5';                           // 2px+
}

/**
 * 获取响应式尺寸（通用）
 * @param baseSizeInPx 基础像素大小
 * @param scaleFactor 缩放因子
 * @return 缩放后的像素值
 */
export function getResponsiveSize(baseSizeInPx: number, scaleFactor: number): number {
  return Math.round(baseSizeInPx * scaleFactor);
}

/**
 * 获取当前视口的缩放因子（精准计算，含800px限制）
 * @param originalWidth 原始设计稿宽度 (默认 724px)
 * @return 缩放因子
 */
export function getScaleFactor(originalWidth: number = BASE_WIDTH): number {
  if (typeof window === 'undefined') {
    // 服务端渲染时使用移动端默认缩放
    return VIEWPORT_BREAKPOINTS.mobile / originalWidth;
  }
  
  const viewportWidth = window.innerWidth;
  
  // 如果视口宽度会导致容器超过800px，则限制缩放
  const rawScaleFactor = viewportWidth / originalWidth;
  const maxAllowedScale = MAX_CONTAINER_WIDTH / originalWidth;
  
  // 应用最小和最大缩放限制
  const scaleFactor = Math.min(maxAllowedScale, Math.max(MIN_SCALE_FACTOR, rawScaleFactor));
  
  // 调试信息已移除
  
  return scaleFactor;
}

/**
 * 获取响应式 CSS 变量
 * @param scaleFactor 缩放因子
 * @return CSS 变量对象
 */
export function getResponsiveCSSVars(scaleFactor: number): Record<string, string> {
  return {
    '--scale-factor': scaleFactor.toString(),
    '--scaled-base-unit': `${16 * scaleFactor}px`,
    '--scaled-small-unit': `${8 * scaleFactor}px`,
    '--scaled-large-unit': `${32 * scaleFactor}px`,
    '--container-width': `${BASE_WIDTH * scaleFactor}px`,
    '--max-container-width': `${MAX_CONTAINER_WIDTH}px`,
  };
}

/**
 * 获取当前视口类型
 * @returns 视口类型
 */
export function getViewportType(): keyof typeof VIEWPORT_BREAKPOINTS | 'unknown' {
  if (typeof window === 'undefined') return 'mobile';
  
  const width = window.innerWidth;
  if (width < VIEWPORT_BREAKPOINTS.tablet) return 'mobile';
  if (width < VIEWPORT_BREAKPOINTS.desktop) return 'tablet';
  if (width < VIEWPORT_BREAKPOINTS.large) return 'desktop';
  if (width < VIEWPORT_BREAKPOINTS.xlarge) return 'large';
  return 'xlarge';
}

/**
 * 创建响应式样式对象
 * @param baseStyles 基础样式配置
 * @param scaleFactor 缩放因子
 * @returns 响应式样式对象
 */
export function createResponsiveStyles(
  baseStyles: {
    width?: number;
    height?: number;
    fontSize?: number;
    padding?: number;
    margin?: number;
    borderRadius?: number;
    borderWidth?: number;
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
    gap?: number;
  },
  scaleFactor: number
): React.CSSProperties {
  const styles: Record<string, string> = {};
  
  Object.entries(baseStyles).forEach(([key, value]) => {
    if (typeof value === 'number') {
      const scaledValue = Math.round(value * scaleFactor);
      styles[key] = `${scaledValue}px`;
    }
  });
  
  return styles as React.CSSProperties;
}

/**
 * 获取缩放调试信息
 * @param scaleFactor 缩放因子
 * @returns 调试信息字符串
 */
export function getScaleDebugInfo(scaleFactor: number): string {
  const viewportType = getViewportType();
  const containerWidth = Math.round(BASE_WIDTH * scaleFactor);
  
  return `📱 ${viewportType} | 缩放: ${(scaleFactor * 100).toFixed(1)}% | 容器: ${containerWidth}px`;
} 