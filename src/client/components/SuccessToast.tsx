/**
 * 简单的成功提示组件 - 根据Figma设计重新实现
 * 用于显示分享成功等提示信息
 */

import React, { useEffect, useState } from 'react';
import { useResponsiveSize } from '../hooks/useResponsiveScale';
import { getGameBackground } from '../utils/shareUtils';

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
  
  // 使用背景系统
  const [selectedBackground] = useState(() => getGameBackground());

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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 使用项目背景系统的背景图片 */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${selectedBackground})`
        }}
      />
      
      {/* 半透明覆盖层 */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      
      {/* 主内容容器 - 点击整个区域关闭 */}
      <div 
        className="relative cursor-pointer z-10"
        onClick={onClose}
        style={{
          width: `${scale(286)}px`,
          height: `${scale(179)}px`,
        }}
      >
        {/* 主卡片内容 - share_result.png */}
        <img
          src="/share_result.png"
          alt="Share Result"
          className="w-full h-full object-contain"
          style={{
            width: `${scale(286)}px`,
            height: `${scale(179)}px`,
          }}
          onError={(e) => {
            // 如果share_result.png加载失败，显示备用内容
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `
                <div style="
                  width: ${scale(286)}px;
                  height: ${scale(179)}px;
                  background: rgb(183, 239, 255);
                  border: ${scale(6)}px solid white;
                  border-radius: 30px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: rgb(240, 188, 8);
                  font-weight: bold;
                  font-size: ${scale(16)}px;
                  text-align: center;
                  padding: ${scale(20)}px;
                ">
                  ${message}
                </div>
              `;
            }
          }}
        />
      </div>
    </div>
  );
}; 