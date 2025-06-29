import * as React from 'react';
import { useState, useEffect } from 'react';
import { useResponsiveSize } from '../hooks/useResponsiveScale';

interface TutorialTemperatureBarProps {
  tempPointer: number;
  tempBarFill: { start: number; end: number };
  onTempChange: (newTemp: number) => void;
  onAddButtonClick: () => void;
  minusButtonAnimationActive: boolean;
  isAddButtonDisabled: boolean;
  isMinusButtonDisabled: boolean;
  onMinusButtonClick: () => void;
}

export const TutorialTemperatureBar: React.FC<TutorialTemperatureBarProps> = ({
  tempPointer,
  onTempChange,
  onAddButtonClick,
  minusButtonAnimationActive,
  isAddButtonDisabled,
  isMinusButtonDisabled,
  onMinusButtonClick,
}) => {
  // 添加响应式缩放
  const { scale, createStyles } = useResponsiveSize();
  
  const [isBouncing, setIsBouncing] = useState(false);
  const [bounceDirection, setBounceDirection] = useState<'left' | 'right' | null>(null);
  const [isAddButtonAnimating, setIsAddButtonAnimating] = useState(false);
  const [isMinusButtonAnimating, setIsMinusButtonAnimating] = useState(false);
  
  const totalWidth = scale(628);
  const pointerWidth = scale(16);
  
  // 填充条逻辑：内容区域分为5个部分，只有第4部分被填充
  const fillBarSidePadding = scale(40);
  const fillBarContentWidth = totalWidth - (2 * fillBarSidePadding);
  const fillBarLeftMargin = fillBarSidePadding;
  const sections = 5;
  const sectionWidth = fillBarContentWidth / sections;
  
  // 第4部分（第四个部分）：从第3部分结束到第4部分结束
  const fillSectionIndex = 4;
  const fillSectionLeft = fillBarLeftMargin + sectionWidth * (fillSectionIndex - 1);
  const fillSectionWidth = sectionWidth;
  
  // 指针移动范围
  const tempBarBorderWidth = scale(4);
  const tempBarInnerWidth = totalWidth - (2 * tempBarBorderWidth);
  const tempBarInnerLeft = tempBarBorderWidth;
  
  const pointerMinLeft = tempBarInnerLeft;
  const pointerMaxLeft = tempBarInnerLeft + tempBarInnerWidth - pointerWidth;
  const pointerRange = pointerMaxLeft - pointerMinLeft;
  
  const pointerPosition = pointerMinLeft + (tempPointer / 100) * pointerRange;

  // 加号按钮的自动循环弹跳动画
  useEffect(() => {
    if (minusButtonAnimationActive || isAddButtonDisabled) {
      setIsAddButtonAnimating(false);
      return;
    }

    const startAnimation = () => {
      setIsAddButtonAnimating(true);
      
      setTimeout(() => {
        setIsAddButtonAnimating(false);
      }, 600);
    };

    startAnimation();
    const interval = setInterval(startAnimation, 2000);

    return () => clearInterval(interval);
  }, [minusButtonAnimationActive, isAddButtonDisabled]);

  // 减号按钮的自动循环弹跳动画
  useEffect(() => {
    if (!minusButtonAnimationActive || isMinusButtonDisabled) {
      setIsMinusButtonAnimating(false);
      return;
    }

    const startAnimation = () => {
      setIsMinusButtonAnimating(true);
      
      setTimeout(() => {
        setIsMinusButtonAnimating(false);
      }, 600);
    };

    startAnimation();
    const interval = setInterval(startAnimation, 2000);

    return () => clearInterval(interval);
  }, [minusButtonAnimationActive, isMinusButtonDisabled]);

  // 触及边界时的弹跳效果
  useEffect(() => {
    if (tempPointer <= 0) {
      setIsBouncing(true);
      setBounceDirection('left');
      const timer = setTimeout(() => {
        setIsBouncing(false);
        setBounceDirection(null);
      }, 600);
      return () => clearTimeout(timer);
    } else if (tempPointer >= 100) {
      setIsBouncing(true);
      setBounceDirection('right');
      const timer = setTimeout(() => {
        setIsBouncing(false);
        setBounceDirection(null);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [tempPointer]);

  const handleTempIncrease = () => {
    if (isAddButtonDisabled) {
      onAddButtonClick();
      return;
    }
    
    const newTemp = Math.min(100, tempPointer + 5);
    onTempChange(newTemp);
    onAddButtonClick();
  };

  const handleTempDecrease = () => {
    if (isMinusButtonDisabled) {
      onMinusButtonClick();
      return;
    }
    
    const newTemp = Math.max(0, tempPointer - 5);
    onTempChange(newTemp);
    onMinusButtonClick();
  };

  // 计算水平弹跳偏移量
  const getBounceOffset = () => {
    if (!isBouncing) return 0;
    
    const bounceDistance = scale(8);
    
    if (bounceDirection === 'left') {
      return Math.max(-bounceDistance, -pointerPosition + pointerMinLeft);
    } else if (bounceDirection === 'right') {
      return Math.min(bounceDistance, pointerMaxLeft - pointerPosition);
    }
    return 0;
  };

  const bounceOffset = getBounceOffset();

  return (
    <div className="relative">
      {/* 温度条容器 */}
      <div 
        className="absolute"
        style={createStyles({
          width: 628,
          height: 24,
          top: 142,
          left: 48
        })}
      >
        <div className="relative" style={{ height: `${scale(24)}px` }}>
          {/* 背景条 - 全宽度灰色 */}
          <div 
            className="absolute bg-[#d9d9d9] border-solid border-[#39358e]"
            style={{
              width: `${totalWidth}px`,
              height: `${scale(24)}px`,
              borderWidth: `${scale(4)}px`
            }}
          />
          
          {/* 填充条 - 仅第4部分（第四个部分）为蓝色 */}
          <div 
            className="absolute bg-[#728CFF] border-solid border-[#39358e]"
            style={{
              left: `${fillSectionLeft}px`,
              width: `${fillSectionWidth}px`,
              height: `${scale(24)}px`,
              borderTopWidth: `${scale(4)}px`,
              borderBottomWidth: `${scale(4)}px`
            }}
          />
          
          {/* 温度指针 */}
          <div 
            className={`absolute bg-[#f8cb56] border-solid border-[#39358e] ${
              isBouncing 
                ? 'transition-all duration-300 ease-out' 
                : 'transition-all duration-300 ease-out'
            }`}
            style={{
              width: `${pointerWidth}px`,
              height: `${scale(40)}px`,
              top: `${scale(-8)}px`,
              left: `${pointerPosition + bounceOffset}px`,
              borderWidth: `${scale(4.9)}px`,
              transform: isBouncing ? 'scaleX(1.1)' : 'scaleX(1)',
            }}
          />
        </div>
      </div>

      {/* 控制按钮 */}
      <button
        onClick={handleTempDecrease}
        className={`absolute p-0 bg-transparent border-none transition-transform duration-200 ${
          isMinusButtonDisabled ? 'cursor-default' : 'cursor-pointer hover:scale-110'
        }`}
        style={createStyles({
          width: 56,
          height: 56,
          left: 84,
          top: 460
        })}
      >
        <img
          className={`object-cover w-full h-full transition-transform duration-300 ease-out ${
            isMinusButtonAnimating ? 'scale-110' : 'scale-100'
          } ${
            isMinusButtonDisabled ? 'opacity-70' : 'opacity-100'
          }`}
          alt="Decrease temperature"
          src="/button-temp-minus.png"
        />
      </button>

      <button
        onClick={handleTempIncrease}
        className={`absolute p-0 bg-transparent border-none transition-transform duration-200 ${
          isAddButtonDisabled ? 'cursor-default' : 'cursor-pointer hover:scale-110'
        }`}
        style={createStyles({
          width: 56,
          height: 56,
          left: 584,
          top: 460
        })}
      >
        <img
          className={`object-cover w-full h-full transition-transform duration-300 ease-out ${
            isAddButtonAnimating ? 'scale-110' : 'scale-100'
          } ${
            isAddButtonDisabled ? 'opacity-70' : 'opacity-100'
          }`}
          alt="Increase temperature"
          src="/button-temp-plus.png"
        />
      </button>
    </div>
  );
}; 