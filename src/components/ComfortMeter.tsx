import React from 'react';
import { ProgressBar } from './ProgressBar';

interface ComfortMeterProps {
  comfortLevel: number;
  successHoldTimer: number;
  successHoldTime: number;
}

export const ComfortMeter: React.FC<ComfortMeterProps> = ({
  comfortLevel,
  successHoldTimer,
  successHoldTime,
}) => {
  const getComfortColor = () => {
    if (comfortLevel >= 0.8) return '#10b981'; // Green
    if (comfortLevel >= 0.5) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const getComfortEmoji = () => {
    if (comfortLevel >= 0.8) return '😸'; // Happy cat
    if (comfortLevel >= 0.5) return '😐'; // Neutral cat
    return '🙀'; // Scared cat
  };

  return (
    <div className="absolute top-4 left-4 right-4">
      <div className="bg-white bg-opacity-90 rounded-lg p-3 shadow-lg">
        {/* Cat comfort emoji */}
        <div className="text-center mb-2">
          <span className="text-3xl">{getComfortEmoji()}</span>
        </div>
        
        {/* Comfort progress bar */}
        <div className="relative">
          <ProgressBar
            value={comfortLevel}
            className="w-full h-6 rounded-full"
            barColor={getComfortColor()}
            backgroundColor="#e5e7eb"
          />
          
          {/* Comfort percentage text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-white drop-shadow-lg">
              {Math.round(comfortLevel * 100)}%
            </span>
          </div>
        </div>
        
        {/* Success hold timer */}
        {comfortLevel >= 1.0 && successHoldTimer > 0 && (
          <div className="mt-2 text-center">
            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
              Hold: {Math.ceil(successHoldTime - successHoldTimer)}s
            </div>
          </div>
        )}
        
        {/* Comfort label */}
        <div className="text-center mt-1">
          <span className="text-xs font-medium text-gray-600">Cat Comfort</span>
        </div>
      </div>
    </div>
  );
};