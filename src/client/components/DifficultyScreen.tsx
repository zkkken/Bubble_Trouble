import React from "react";
import { Card, CardContent } from "./ui/card";
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
        className="bg-[#2f2f2f] relative"
        style={{
          width: `${scale(724)}px`,
          height: `${scale(584)}px`,
          ...cssVars
        }}
      >
        {/* 背景图片 */}
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{
            backgroundImage: `url(/background-1.png)`
          }}
        />

        {/* 半透明遮罩 */}
        <div className="absolute inset-0 bg-black bg-opacity-50" />

        {/* 主内容 */}
        <div className="relative h-full flex items-center justify-center">
          <Card 
            className="bg-transparent border-0 shadow-none"
            style={{
              width: `${scale(600)}px`,
              height: `${scale(400)}px`
            }}
          >
            <CardContent className="p-0 h-full flex flex-col items-center justify-center">
              {/* diff-up.png 图片 */}
              <div 
                className="mb-8 cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={onContinue}
                style={{
                  width: `${scale(400)}px`,
                  height: `${scale(300)}px`
                }}
              >
                <img
                  className="w-full h-full object-contain"
                  alt="Difficulty Up"
                  src="/diff-up.png"
                  onError={(e) => {
                    // 如果图片加载失败，显示文字替代
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div style="
                          width: 100%; 
                          height: 100%; 
                          display: flex; 
                          flex-direction: column; 
                          align-items: center; 
                          justify-content: center; 
                          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                          border-radius: 20px;
                          color: white;
                          font-family: 'Silkscreen', monospace;
                          font-weight: bold;
                          text-align: center;
                          cursor: pointer;
                        ">
                          <div style="font-size: 48px; margin-bottom: 20px;">⚡</div>
                          <div style="font-size: 24px; margin-bottom: 10px;">DIFFICULTY UP!</div>
                          <div style="font-size: 16px;">准备好迎接挑战了吗？</div>
                          <div style="font-size: 14px; margin-top: 20px; opacity: 0.8;">点击继续</div>
                        </div>
                      `;
                    }
                  }}
                />
              </div>

              {/* 提示文字 */}
              <div 
                className="text-center text-white font-bold silkscreen-bold"
                style={{
                  fontSize: `${scale(18)}px`,
                  WebkitTextStroke: `${scale(2)}px #000`,
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
                }}
              >
                点击图片进入正式游戏
              </div>

              {/* 副标题 */}
              <div 
                className="text-center text-gray-300 mt-4"
                style={{
                  fontSize: `${scale(14)}px`,
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
                }}
              >
                教程已完成，准备好迎接真正的挑战！
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};