import React from 'react';
import { GameState } from '../types/GameTypes';

interface TemperatureSliderProps {
  gameState: GameState;
}

export const TemperatureSlider: React.FC<TemperatureSliderProps> = ({ gameState }) => {
  const { currentTemperature, targetTemperature, toleranceWidth } = gameState;
  
  const toleranceStart = Math.max(0, targetTemperature - toleranceWidth);
  const toleranceEnd = Math.min(1, targetTemperature + toleranceWidth);
  
  return (
    <div className="absolute w-[340px] h-[57px] top-[209px] left-[25px]">
      {/* Background track */}
      <div className="relative w-full h-[39px] top-[9px] bg-gray-300 rounded-lg overflow-hidden">
        {/* Tolerance zone (green area) */}
        <div
          className="absolute h-full bg-green-200 transition-all duration-200"
          style={{
            left: `${toleranceStart * 100}%`,
            width: `${(toleranceEnd - toleranceStart) * 100}%`,
          }}
        />
        
        {/* Temperature fill */}
        <div
          className="absolute h-full bg-gradient-to-r from-blue-400 to-red-400 transition-all duration-100"
          style={{
            width: `${currentTemperature * 100}%`,
          }}
        />
        
        {/* Target temperature indicator */}
        <div
          className="absolute w-1 h-full bg-green-600 transition-all duration-200"
          style={{
            left: `${targetTemperature * 100}%`,
          }}
        />
      </div>
      
      {/* Temperature pointer */}
      <div
        className="absolute w-[25px] h-[57px] top-0 transition-all duration-100 flex items-center justify-center"
        style={{
          left: `${Math.max(0, Math.min(1, currentTemperature)) * 315}px`, // 340px - 25px = 315px range
        }}
      >
        <div className="w-6 h-6 bg-orange-500 rounded-full border-2 border-white shadow-lg" />
      </div>
    </div>
  );
};