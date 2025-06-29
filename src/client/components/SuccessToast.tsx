/**
 * 简单的成功提示组件
 * 用于显示分享成功等提示信息
 */

import React, { useEffect } from 'react';
import { useResponsiveSize } from '../hooks/useResponsiveScale';

interface SuccessToastProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
  autoCloseDelay?: number; // 自动关闭延迟，毫秒
}

export const SuccessToast: React.FC<SuccessToastProps> = ({
  isOpen,
  message,
  onClose,
  autoCloseDelay = 3000
}) => {
  const { scale } = useResponsiveSize();

  // 自动关闭
  useEffect(() => {
    if (isOpen && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        className="bg-[#28A745] border-4 border-[#34CE57] rounded-lg overflow-hidden relative animate-bounce"
        style={{
          width: `${scale(400)}px`,
          minHeight: `${scale(150)}px`,
        }}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 bg-[#FF4500] hover:bg-[#FF5722] text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors text-sm"
        >
          ✕
        </button>

        {/* 内容区域 */}
        <div className="p-6 text-center text-white">
          {/* 成功图标 */}
          <div className="text-4xl mb-3">✅</div>
          
          {/* 标题 */}
          <h2 className="silkscreen-bold text-xl mb-3">操作成功！</h2>
          
          {/* 消息内容 */}
          <p className="silkscreen-bold text-sm leading-relaxed">
            {message}
          </p>

          {/* 自动关闭提示 */}
          <p className="text-xs text-green-200 mt-4">
            {autoCloseDelay > 0 && `${Math.ceil(autoCloseDelay / 1000)}秒后自动关闭`}
          </p>
        </div>
      </div>
    </div>
  );
}; 