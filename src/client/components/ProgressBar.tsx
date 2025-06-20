/**
 * 进度条组件
 * 可复用的进度条UI组件
 * 
 * @author 开发者B - UI/UX 界面负责人
 */

import React from 'react';

interface ProgressBarProps {
  value: number;
  className?: string;
  barColor?: string;
  backgroundColor?: string;
  vertical?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  className = '',
  barColor = '#4ade80',
  backgroundColor = '#e5e7eb',
  vertical = false,
}) => {
  const percentage = Math.max(0, Math.min(100, value * 100));

  return (
    <div 
      className={`relative rounded-sm overflow-hidden ${className}`}
      style={{ backgroundColor }}
    >
      <div
        className="h-full transition-all duration-200 ease-out"
        style={{
          width: `${percentage}%`,
          backgroundColor: barColor,
        }}
      />
    </div>
  );
};