/**
 * 状态指示器组件
 * 显示游戏状态信息
 * 
 * @author 开发者B - UI/UX 界面负责人
 */

import React from 'react';
import { GameState } from '../../shared/types/game';

interface StatusIndicatorProps {
  gameState: GameState;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  gameState,
  className = '',
}) => {
  return (
    <div className={`flex justify-between items-center text-sm ${className}`}>
      <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded">
        Temp: {Math.round(gameState.currentTemperature * 100)}%
      </div>
      <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded">
        Comfort: {Math.round(gameState.currentComfort * 100)}%
      </div>
      <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded">
        Target: {Math.round(gameState.targetTemperature * 100)}%
      </div>
      {gameState.isControlsReversed && (
        <div className="bg-purple-600 text-white px-2 py-1 rounded animate-pulse">
          🔄 REVERSED
        </div>
      )}
    </div>
  );
};