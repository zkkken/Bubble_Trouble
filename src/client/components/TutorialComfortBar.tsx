import React from 'react';
import { useResponsiveSize } from '../hooks/useResponsiveScale';

interface TutorialComfortBarProps {
  progress: number;
}

export const TutorialComfortBar: React.FC<TutorialComfortBarProps> = ({ progress }) => {
  // 添加响应式缩放
  const { scale, createStyles } = useResponsiveSize();
  
  const sidePadding = scale(4);
  const totalWidth = scale(628);
  const contentWidth = totalWidth - (sidePadding * 2);
  
  // 根据进度计算填充宽度
  const fillWidth = (progress / 100) * contentWidth;
  
  // 根据进度段确定颜色
  const getColor = (progress: number): string => {
    if (progress > 75) return '#5FF367';
    if (progress > 50) return '#FFDF2B';
    if (progress > 25) return '#FE8E39';
    return '#FE4339';
  };

  const fillColor = getColor(progress);

  return (
    <div 
      className="absolute bg-[#d9d9d9] border-solid border-[#39358e]"
      style={{
        ...createStyles({
          width: 628,
          height: 24,
          top: 108,
          left: 48
        }),
        borderWidth: `${scale(4)}px`
      }}
    >
      <div 
        className="transition-all duration-300 ease-out"
        style={{
          width: `${fillWidth}px`,
          height: `${scale(16)}px`,
          backgroundColor: fillColor,
          marginLeft: '0px',
          marginTop: '0px',
        }}
      />
    </div>
  );
}; 