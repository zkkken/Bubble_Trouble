import React, { useState, useEffect } from 'react';

interface TemperatureBarProps {
  tempPointer: number;
  tempBarFill: { start: number; end: number };
  onTempChange: (newTemp: number) => void;
  onAddButtonClick: () => void;
  minusButtonAnimationActive: boolean; // New prop to control minus button animation
  isAddButtonDisabled: boolean; // New prop to control add button functionality
  isMinusButtonDisabled: boolean; // New prop to control minus button functionality
  onMinusButtonClick: () => void; // New prop for minus button click handler
}

export const TemperatureBar: React.FC<TemperatureBarProps> = ({
  tempPointer,
  tempBarFill,
  onTempChange,
  onAddButtonClick,
  minusButtonAnimationActive,
  isAddButtonDisabled,
  isMinusButtonDisabled,
  onMinusButtonClick,
}) => {
  const [isBouncing, setIsBouncing] = useState(false);
  const [bounceDirection, setBounceDirection] = useState<'left' | 'right' | null>(null);
  const [isAddButtonAnimating, setIsAddButtonAnimating] = useState(false);
  const [isMinusButtonAnimating, setIsMinusButtonAnimating] = useState(false);
  
  const totalWidth = 628;
  const pointerWidth = 16; // 指针宽度 (w-4 = 16px)
  
  // Fill bar logic: content area divided into 5 sections, only section 4 filled
  const fillBarSidePadding = 40; // 40px padding on each side for fill bar display
  const fillBarContentWidth = totalWidth - (2 * fillBarSidePadding); // 548px content area
  const fillBarLeftMargin = fillBarSidePadding; // 40px left margin
  const sections = 5;
  const sectionWidth = fillBarContentWidth / sections; // 109.6px per section
  
  // Section 4 (fourth section): from section 3 end to section 4 end
  const fillSectionIndex = 4; // Fourth section (1-based)
  const fillSectionLeft = fillBarLeftMargin + sectionWidth * (fillSectionIndex - 1); // 40 + 109.6 * 3 = 368.8px
  const fillSectionWidth = sectionWidth; // 109.6px
  
  // Pointer movement range: 指针必须完全在灰色背景条内部
  // 灰色背景条的内容区域（去掉边框）
  const tempBarBorderWidth = 4; // 边框宽度
  const tempBarInnerWidth = totalWidth - (2 * tempBarBorderWidth); // 620px (628 - 4*2)
  const tempBarInnerLeft = tempBarBorderWidth; // 4px (边框宽度)
  
  // 指针活动范围：指针完全在内容区内
  const pointerMinLeft = tempBarInnerLeft; // 最左：4px (紧贴左边框内侧)
  const pointerMaxLeft = tempBarInnerLeft + tempBarInnerWidth - pointerWidth; // 最右：608px (4 + 620 - 16)
  const pointerRange = pointerMaxLeft - pointerMinLeft; // 604px (608 - 4)
  
  // 计算指针位置：基于百分比在允许范围内移动
  const pointerPosition = pointerMinLeft + (tempPointer / 100) * pointerRange;

  // Auto-loop bounce animation for add button (only when not in minus button animation mode and not disabled)
  useEffect(() => {
    if (minusButtonAnimationActive || isAddButtonDisabled) {
      setIsAddButtonAnimating(false);
      return;
    }

    const startAnimation = () => {
      setIsAddButtonAnimating(true);
      
      // Reset animation after 600ms (300ms scale up + 300ms scale down)
      setTimeout(() => {
        setIsAddButtonAnimating(false);
      }, 600);
    };

    // Start first animation immediately
    startAnimation();

    // Set up interval for continuous loop (every 2 seconds)
    const interval = setInterval(startAnimation, 2000);

    return () => clearInterval(interval);
  }, [minusButtonAnimationActive, isAddButtonDisabled]); // Depend on both props

  // Auto-loop bounce animation for minus button (only when minusButtonAnimationActive is true and not disabled)
  useEffect(() => {
    if (!minusButtonAnimationActive || isMinusButtonDisabled) {
      setIsMinusButtonAnimating(false);
      return;
    }

    const startAnimation = () => {
      setIsMinusButtonAnimating(true);
      
      // Reset animation after 600ms (300ms scale up + 300ms scale down)
      setTimeout(() => {
        setIsMinusButtonAnimating(false);
      }, 600);
    };

    // Start first animation immediately
    startAnimation();

    // Set up interval for continuous loop (every 2 seconds)
    const interval = setInterval(startAnimation, 2000);

    return () => clearInterval(interval);
  }, [minusButtonAnimationActive, isMinusButtonDisabled]); // Start animation when minusButtonAnimationActive becomes true and not disabled

  // Bounce effect when hitting boundaries
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
    // Don't increase temperature if add button is disabled
    if (isAddButtonDisabled) {
      onAddButtonClick(); // Still trigger the click handler for other logic
      return;
    }
    
    const newTemp = Math.min(100, tempPointer + 5);
    onTempChange(newTemp);
    onAddButtonClick(); // Trigger dialog switch
  };

  const handleTempDecrease = () => {
    // Don't decrease temperature if minus button is disabled
    if (isMinusButtonDisabled) {
      onMinusButtonClick(); // Still trigger the click handler for other logic
      return;
    }
    
    const newTemp = Math.max(0, tempPointer - 5);
    onTempChange(newTemp);
    onMinusButtonClick(); // Trigger any minus button specific logic
  };

  // Calculate horizontal bounce offset only
  const getBounceOffset = () => {
    if (!isBouncing) return 0;
    
    const bounceDistance = 8; // 减小弹跳距离，避免超出边界
    
    if (bounceDirection === 'left') {
      return Math.max(-bounceDistance, -pointerPosition + pointerMinLeft); // 不能超出左边界
    } else if (bounceDirection === 'right') {
      return Math.min(bounceDistance, pointerMaxLeft - pointerPosition); // 不能超出右边界
    }
    return 0;
  };

  const bounceOffset = getBounceOffset();

  return (
    <div className="relative">
      {/* Temperature bar container - moved down by 6px total (4px + 2px) */}
      <div className="absolute w-[628px] h-6 top-[142px] left-12">
        <div className="relative h-6">
          {/* Background bar - full width in gray (this is the reference for pointer movement) */}
          <div className="absolute w-full h-6 bg-[#d9d9d9] border-4 border-solid border-[#39358e]" />
          
          {/* Fill bar - only section 4 (fourth section) with blue color */}
          <div 
            className="absolute h-6 bg-[#728CFF] border-y-4 border-solid border-[#39358e]"
            style={{
              left: `${fillSectionLeft}px`, // Start of section 4
              width: `${fillSectionWidth}px`, // Width of section 4
            }}
          />
          
          {/* Temperature pointer - moves within temp bar background, completely inside */}
          <div 
            className={`absolute w-4 h-10 -top-2 bg-[#f8cb56] border-[4.9px] border-solid border-[#39358e] ${
              isBouncing 
                ? 'transition-all duration-300 ease-out' 
                : 'transition-all duration-300 ease-out'
            }`}
            style={{
              left: `${pointerPosition + bounceOffset}px`, // 直接使用计算好的位置，不需要额外偏移
              transform: isBouncing ? 'scaleX(1.1)' : 'scaleX(1)',
            }}
          />
        </div>
      </div>

      {/* Control buttons */}
      <button
        onClick={handleTempDecrease}
        className={`absolute w-14 h-14 left-[84px] top-[460px] p-0 bg-transparent border-none transition-transform duration-200 ${
          isMinusButtonDisabled ? 'cursor-default' : 'cursor-pointer hover:scale-110'
        }`}
      >
        <img
          className={`object-cover w-full h-full transition-transform duration-300 ease-out ${
            isMinusButtonAnimating ? 'scale-110' : 'scale-100'
          } ${
            isMinusButtonDisabled ? 'opacity-70' : 'opacity-100'
          }`}
          alt="Decrease temperature"
          src="/icon-tempbtn-minus.png"
        />
      </button>

      <button
        onClick={handleTempIncrease}
        className={`absolute w-14 h-14 left-[584px] top-[460px] p-0 bg-transparent border-none transition-transform duration-200 ${
          isAddButtonDisabled ? 'cursor-default' : 'cursor-pointer'
        }`}
      >
        <img
          className={`object-cover w-full h-full transition-transform duration-300 ease-out ${
            isAddButtonAnimating ? 'scale-110' : 'scale-100'
          } ${
            isAddButtonDisabled ? 'opacity-70' : 'opacity-100'
          }`}
          alt="Increase temperature"
          src="/icon-tempbtn-add.png"
        />
      </button>
    </div>
  );
};