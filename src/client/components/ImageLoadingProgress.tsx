/**
 * 图片加载进度指示器组件
 * 显示图片预加载进度，提升用户体验
 */

import React from 'react';
import { useResponsiveSize } from '../hooks/useResponsiveScale';

interface ImageLoadingProgressProps {
  progress: number;
  isLoading: boolean;
  onComplete?: () => void;
}

export const ImageLoadingProgress: React.FC<ImageLoadingProgressProps> = ({
  progress,
  isLoading,
  onComplete
}) => {
  const { scale } = useResponsiveSize();

  // 当加载完成时调用回调
  React.useEffect(() => {
    if (progress >= 100 && !isLoading && onComplete) {
      const timer = setTimeout(onComplete, 500);
      return () => clearTimeout(timer);
    }
  }, [progress, isLoading, onComplete]);

  if (!isLoading && progress >= 100) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
      style={{
        backdropFilter: 'blur(8px)',
      }}
    >
      <div 
        className="bg-white rounded-lg p-8 text-center"
        style={{
          width: `${scale(400)}px`,
          maxWidth: '90vw',
        }}
      >
        {/* 标题 */}
        <h2 
          className="text-purple-800 font-bold mb-6"
          style={{
            fontSize: `${scale(24)}px`,
          }}
        >
          🖼️ loading...
        </h2>

        {/* 进度条容器 */}
        <div 
          className="bg-gray-200 rounded-full overflow-hidden mb-4"
          style={{
            height: `${scale(20)}px`,
          }}
        >
          {/* 进度条填充 */}
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300 ease-out"
            style={{
              width: `${Math.max(0, Math.min(100, progress))}%`,
            }}
          />
        </div>

        {/* 进度文字 */}
        <div 
          className="text-gray-600"
          style={{
            fontSize: `${scale(16)}px`,
          }}
        >
          {progress < 100 ? `${Math.round(progress)}}
        </div>

        {/* 加载动画小图标 */}
        <div 
          className="mt-4 flex justify-center"
          style={{
            fontSize: `${scale(32)}px`,
          }}
        >
          <div className="animate-bounce">🐱</div>
          <div className="animate-bounce" style={{ animationDelay: '0.1s' }}>💧</div>
          <div className="animate-bounce" style={{ animationDelay: '0.2s' }}>🛁</div>
        </div>

        {/* 加载提示文字 */}
        <p 
          className="text-gray-500 mt-4"
          style={{
            fontSize: `${scale(14)}px`,
          }}
        >
        </p>
      </div>
    </div>
  );
};

/**
 * 简化版加载指示器（适用于页面切换）
 */
export const SimpleLoadingIndicator: React.FC<{
  text?: string;
}> = ({ text = '加载中...' }) => {
  const { scale } = useResponsiveSize();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div 
        className="bg-white rounded-lg p-6 text-center"
        style={{
          minWidth: `${scale(200)}px`,
        }}
      >
        <div 
          className="animate-spin rounded-full border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"
          style={{
            width: `${scale(40)}px`,
            height: `${scale(40)}px`,
          }}
        />
        <p 
          className="text-gray-700"
          style={{
            fontSize: `${scale(16)}px`,
          }}
        >
          {text}
        </p>
      </div>
    </div>
  );
}; 