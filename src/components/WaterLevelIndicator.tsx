import React from 'react';
import { ProgressBar } from './ProgressBar';

interface WaterLevelIndicatorProps {
  gameTimer: number;
  maxTime: number;
}

export const WaterLevelIndicator: React.FC<WaterLevelIndicatorProps> = ({
  gameTimer,
  maxTime,
}) => {
  const waterLevel = gameTimer / maxTime;
  
  // Color changes based on remaining time
  const getWaterColor = () => {
    if (waterLevel > 0.6) return '#3b82f6'; // Blue
    if (waterLevel > 0.3) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  return (
    <div className="absolute left-4 top-32 w-8 h-80">
      <div className="relative w-full h-full bg-gray-300 rounded-lg overflow-hidden border-2 border-gray-400">
        {/* Water level background */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-100 to-blue-50" />
        
        {/* Water level fill */}
        <ProgressBar
          value={waterLevel}
          className="w-full h-full"
          barColor={getWaterColor()}
          backgroundColor="transparent"
          vertical={true}
        />
        
        {/* Water level markers */}
        <div className="absolute inset-0 pointer-events-none">
          {[0.25, 0.5, 0.75].map((marker, index) => (
            <div
              key={index}
              className="absolute w-full h-0.5 bg-gray-400 opacity-50"
              style={{ bottom: `${marker * 100}%` }}
            />
          ))}
        </div>
        
        {/* Water drop icon */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-blue-500 text-xl">
          💧
        </div>
      </div>
      
      {/* Time display */}
      <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs font-bold">
        {Math.ceil(Math.max(0, gameTimer))}s
      </div>
    </div>
  );
};