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
  const clampedValue = Math.max(0, Math.min(1, value));
  
  return (
    <div 
      className={`relative overflow-hidden rounded ${className}`}
      style={{ backgroundColor }}
    >
      <div
        className="transition-all duration-100 ease-out"
        style={{
          backgroundColor: barColor,
          [vertical ? 'height' : 'width']: `${clampedValue * 100}%`,
          [vertical ? 'width' : 'height']: '100%',
          [vertical ? 'position' : '']: vertical ? 'absolute' : '',
          [vertical ? 'bottom' : '']: vertical ? '0' : '',
        }}
      />
    </div>
  );
};