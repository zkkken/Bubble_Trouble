import React, { useState } from 'react';
import { TutorialScreen } from './components/TutorialScreen';
import { useResponsiveScale, useResponsiveSize } from './hooks/useResponsiveScale';

export const TutorialDemo = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [showGameStart, setShowGameStart] = useState(false);
  
  // Add responsive scaling
  const { cssVars } = useResponsiveScale();
  const { scaleFont } = useResponsiveSize();

  const handleStartTutorial = () => {
    setShowTutorial(true);
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setShowGameStart(true);
  };

  const handleTutorialSkip = () => {
    setShowTutorial(false);
    setShowGameStart(true);
  };

  const handleBackToStart = () => {
    setShowTutorial(false);
    setShowGameStart(false);
  };

  if (showTutorial) {
    return (
      <TutorialScreen 
        onSkip={handleTutorialSkip}
        onComplete={handleTutorialComplete}
      />
    );
  }

  if (showGameStart) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen"
        style={{ ...cssVars } as React.CSSProperties}
      >
        <div className="text-center text-white">
          <h1 
            className="font-bold mb-4"
            style={{ fontSize: `${scaleFont(32)}px` }}
          >
            教程完成！
          </h1>
          <p 
            className="mb-8"
            style={{ fontSize: `${scaleFont(20)}px` }}
          >
            现在可以开始正式游戏了
          </p>
          <button 
            onClick={handleBackToStart}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold rounded"
            style={{ 
              fontSize: `${scaleFont(16)}px`,
              padding: `${scaleFont(8)}px ${scaleFont(16)}px`
            }}
          >
            返回开始
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex items-center justify-center min-h-screen"
      style={{ ...cssVars } as React.CSSProperties}
    >
      <div className="text-center text-white">
        <h1 
          className="font-bold mb-4"
          style={{ fontSize: `${scaleFont(32)}px` }}
        >
          猫咪洗澡游戏
        </h1>
        <p 
          className="mb-8"
          style={{ fontSize: `${scaleFont(20)}px` }}
        >
          点击开始体验教程
        </p>
        <button 
          onClick={handleStartTutorial}
          className="bg-green-500 hover:bg-green-700 text-white font-bold rounded"
          style={{ 
            fontSize: `${scaleFont(20)}px`,
            padding: `${scaleFont(16)}px ${scaleFont(32)}px`
          }}
        >
          开始游戏 (进入教程)
        </button>
      </div>
    </div>
  );
}; 