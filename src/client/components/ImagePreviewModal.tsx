/**
 * 简单的图片预览模态框
 * 用于展示下载的游戏截图
 */

import React from 'react';
import { useResponsiveSize } from '../hooks/useResponsiveScale';

interface ImagePreviewModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  imageUrl,
  onClose
}) => {
  const { scale } = useResponsiveSize();

  if (!isOpen || !imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={onClose} // 点击空白区域关闭
    >
      <div 
        className="bg-[#2f2f2f] border-4 border-[#F0BC08] rounded-lg overflow-hidden relative"
        style={{
          width: `${scale(600)}px`,
          maxHeight: `${scale(700)}px`,
        }}
        onClick={(e) => e.stopPropagation()} // 阻止事件冒泡
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-[#FF4500] hover:bg-[#FF5722] text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          style={{ fontSize: '18px' }}
        >
          ✕
        </button>

        {/* 标题栏 */}
        <div 
          className="bg-[#F0BC08] text-[#2f2f2f] px-4 py-3"
          style={{ height: `${scale(50)}px` }}
        >
          <h2 className="silkscreen-bold text-lg">游戏截图已生成</h2>
        </div>

        {/* 图片区域 */}
        <div className="p-4">
          <div 
            className="border-2 border-[#3A368E] bg-[#1a1a1a] flex items-center justify-center rounded"
            style={{ 
              width: '100%', 
              height: `${scale(400)}px`,
            }}
          >
            <img 
              src={imageUrl} 
              alt="游戏截图" 
              className="max-w-full max-h-full object-contain rounded"
            />
          </div>

          {/* 说明文字 */}
          <div className="mt-4 text-center text-white silkscreen-bold">
            <p className="text-sm">截图已自动下载到您的设备</p>
            <p className="text-xs text-gray-400 mt-2">点击右上角关闭按钮或点击空白区域关闭</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 