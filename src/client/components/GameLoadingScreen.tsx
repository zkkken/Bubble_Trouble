/**
 * 游戏开始Loading界面组件
 * Game Loading Screen Component
 * 
 * @author 开发者B - UI/UX 界面负责人
 */

import React, { useState, useEffect } from 'react';

interface GameLoadingScreenProps {
  onStartGame: () => void;
  onShowLeaderboard: () => void;
  isLoading?: boolean;
}

export const GameLoadingScreen: React.FC<GameLoadingScreenProps> = ({
  onStartGame,
  onShowLeaderboard,
  isLoading = false
}) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showStartButton, setShowStartButton] = useState(false);

  // 模拟加载进度
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setShowStartButton(true);
            return 100;
          }
          return prev + 2;
        });
      }, 50);

      return () => clearInterval(interval);
    } else {
      setShowStartButton(true);
    }
  }, [isLoading]);

  return (
    <div className="w-[390px] h-[844px] relative bg-gradient-to-br from-blue-400 via-blue-300 to-green-400 overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0">
        {/* 装饰性圆圈 */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-white bg-opacity-10 rounded-full animate-pulse" />
        <div className="absolute top-40 right-8 w-24 h-24 bg-white bg-opacity-15 rounded-full animate-bounce" />
        <div className="absolute bottom-32 left-6 w-20 h-20 bg-white bg-opacity-20 rounded-full animate-pulse" />
        <div className="absolute bottom-60 right-12 w-16 h-16 bg-white bg-opacity-10 rounded-full animate-bounce" />
      </div>

      {/* 主要内容区域 */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-8">
        
        {/* 游戏标题 */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4 animate-bounce">🐱</div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            Cat Comfort
          </h1>
          <h2 className="text-2xl font-bold text-white mb-4 drop-shadow-lg">
            Game
          </h2>
          <p className="text-white text-lg opacity-90 drop-shadow">
            Keep your cat happy and comfortable!
          </p>
        </div>

        {/* 游戏预览元素 */}
        <div className="mb-12">
          <div className="bg-white bg-opacity-20 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <div className="text-2xl mb-1">😿</div>
                <div className="text-white text-sm">Sad</div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                  -
                </div>
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                  🔧
                </div>
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  +
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl mb-1">😻</div>
                <div className="text-white text-sm">Happy</div>
              </div>
            </div>
            
            {/* 温度条预览 */}
            <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-green-400 rounded-full transition-all duration-1000"
                   style={{ width: '60%' }} />
            </div>
            <div className="text-center text-white text-xs mt-2 opacity-80">
              Temperature Control
            </div>
          </div>
        </div>

        {/* 加载进度 */}
        {isLoading && (
          <div className="mb-8 w-full max-w-xs">
            <div className="text-white text-center mb-2">Loading...</div>
            <div className="w-full h-2 bg-white bg-opacity-30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-100"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <div className="text-white text-center text-sm mt-1 opacity-80">
              {loadingProgress}%
            </div>
          </div>
        )}

        {/* 按钮区域 */}
        {showStartButton && (
          <div className="space-y-4 w-full max-w-xs animate-fadeIn">
            {/* 开始游戏按钮 */}
            <button
              onClick={onStartGame}
              className="w-full bg-white bg-opacity-90 hover:bg-opacity-100 text-blue-600 font-bold py-4 px-8 rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">🎮</span>
                <span className="text-xl">Start Game</span>
              </div>
            </button>

            {/* 排行榜按钮 */}
            <button
              onClick={onShowLeaderboard}
              className="w-full bg-yellow-500 bg-opacity-90 hover:bg-opacity-100 text-white font-bold py-3 px-8 rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">🏆</span>
                <span className="text-lg">Leaderboard</span>
              </div>
            </button>

            {/* 游戏说明 */}
            <div className="text-center mt-6">
              <div className="text-white text-sm opacity-80 mb-2">How to Play:</div>
              <div className="text-white text-xs opacity-70 space-y-1">
                <div>🌡️ Control temperature with +/- buttons</div>
                <div>😸 Keep your cat comfortable</div>
                <div>🔄 Watch out for interference events!</div>
                <div>⏰ Complete rounds within time limit</div>
              </div>
            </div>
          </div>
        )}

        {/* 版本信息 */}
        <div className="absolute bottom-4 left-4 right-4 text-center">
          <div className="text-white text-xs opacity-60">
            Cat Comfort Game v1.0 • Made with ❤️
          </div>
        </div>
      </div>

      {/* 浮动动画元素 */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        {/* 浮动的猫咪表情 */}
        <div className="absolute top-1/4 left-1/4 text-4xl animate-float opacity-30">😸</div>
        <div className="absolute top-1/3 right-1/4 text-3xl animate-float-delayed opacity-20">🐱</div>
        <div className="absolute bottom-1/3 left-1/3 text-2xl animate-float opacity-25">😻</div>
        
        {/* 温度相关图标 */}
        <div className="absolute top-1/2 left-1/6 text-2xl animate-pulse opacity-20">🌡️</div>
        <div className="absolute bottom-1/4 right-1/6 text-2xl animate-pulse opacity-15">❄️</div>
        <div className="absolute top-1/6 right-1/3 text-2xl animate-pulse opacity-20">🔥</div>
      </div>
    </div>
  );
};

// 添加自定义动画样式
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes float-delayed {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.6s ease-out;
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  .animate-float-delayed {
    animation: float-delayed 4s ease-in-out infinite;
  }
`;

// 将样式注入到文档中
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}