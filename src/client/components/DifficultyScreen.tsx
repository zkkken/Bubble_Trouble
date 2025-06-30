import React from "react";
import { useResponsiveScale, useResponsiveSize } from '../hooks/useResponsiveScale';

interface DifficultyScreenProps {
  onContinue: () => void;
}

export const DifficultyScreen: React.FC<DifficultyScreenProps> = ({ onContinue }) => {
  // 响应式设计hooks
  const { cssVars } = useResponsiveScale();
  const { scale } = useResponsiveSize();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="bg-[#2f2f2f] relative cursor-pointer"
        style={{
          width: `${scale(724)}px`,
          height: `${scale(584)}px`,
          ...cssVars
        }}
        onClick={onContinue}
      >
        {/* diff-up.png 图片拉满整个容器 */}
        <img
          className="w-full h-full object-cover"
          alt="Difficulty Up"
          src="/diff-up.png"
          onError={(e) => {
            // 如果图片加载失败，显示简单的背景色
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            }
          }}
        />
      </div>
    </div>
  );
};