import React from 'react';

interface ComfortBarProps {
  progress: number;
}

export const ComfortBar: React.FC<ComfortBarProps> = ({ progress }) => {
  const sidePadding = 4; // 4px padding on each side
  const totalWidth = 628;
  const contentWidth = totalWidth - (sidePadding * 2); // 620px
  
  // Calculate fill width based on progress
  const fillWidth = (progress / 100) * contentWidth;
  
  // Determine color based on progress segments
  const getColor = (progress: number): string => {
    if (progress > 75) return '#5FF367';
    if (progress > 50) return '#FFDF2B';
    if (progress > 25) return '#FE8E39';
    return '#FE4339';
  };

  const fillColor = getColor(progress);

  return (
    <div className="absolute w-[628px] h-6 top-[108px] left-12 bg-[#d9d9d9] border-4 border-solid border-[#39358e]">
      <div 
        className="h-4 transition-all duration-300 ease-out"
        style={{
          width: `${fillWidth}px`,
          backgroundColor: fillColor,
          marginLeft: '0px', // 移除左边距，让填充条从内容区左边开始
          marginTop: '0px', // 确保顶部对齐
        }}
      />
    </div>
  );
};