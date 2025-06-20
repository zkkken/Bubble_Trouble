/**
 * 干扰事件覆盖层组件
 * 显示干扰事件通知和视觉效果
 * 
 * @author 开发者B - UI/UX 界面负责人
 */

import React from 'react';
import { InterferenceEvent } from '../types/GameTypes';

interface InterferenceOverlayProps {
  interferenceEvent: InterferenceEvent;
  onCenterButtonClick: () => void;
  isControlsReversed: boolean;
}

export const InterferenceOverlay: React.FC<InterferenceOverlayProps> = ({
  interferenceEvent,
  onCenterButtonClick,
  isControlsReversed,
}) => {
  if (!interferenceEvent.isActive) return null;

  const getInterferenceContent = () => {
    switch (interferenceEvent.type) {
      case 'controls_reversed':
        return {
          icon: '🔄',
          title: 'Controls Reversed!',
          description: 'The + and - buttons are swapped!',
          bgColor: 'bg-purple-500',
        };
      case 'temperature_shock':
        return {
          icon: '⚡',
          title: 'Temperature Shock!',
          description: 'The target temperature has shifted!',
          bgColor: 'bg-orange-500',
        };
      case 'bubble_obstruction':
        return {
          icon: '🫧',
          title: 'Bubble Trouble!',
          description: 'Bubbles are blocking your view!',
          bgColor: 'bg-blue-500',
        };
      default:
        return {
          icon: '⚠️',
          title: 'Interference!',
          description: 'Something is wrong!',
          bgColor: 'bg-red-500',
        };
    }
  };

  const content = getInterferenceContent();
  const canBeClearedByClick = interferenceEvent.type !== 'controls_reversed';

  return (
    <>
      {/* Interference notification */}
      <div className="absolute top-16 left-4 right-4 z-40">
        <div className={`${content.bgColor} text-white p-3 rounded-lg shadow-lg animate-pulse`}>
          <div className="flex items-center justify-center mb-2">
            <span className="text-2xl mr-2">{content.icon}</span>
            <h3 className="font-bold text-lg">{content.title}</h3>
          </div>
          <p className="text-center text-sm">{content.description}</p>
          {canBeClearedByClick && (
            <p className="text-center text-xs mt-1 opacity-80">
              Click the center button to fix!
            </p>
          )}
          {interferenceEvent.type === 'controls_reversed' && (
            <p className="text-center text-xs mt-1 opacity-80">
              Auto-clears in {Math.ceil(interferenceEvent.remainingTime)}s
            </p>
          )}
        </div>
      </div>

      {/* Enhanced Bubble obstruction effect */}
      {interferenceEvent.type === 'bubble_obstruction' && (
        <div className="absolute inset-0 z-30 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-white bg-opacity-85 rounded-full animate-bounce shadow-lg" />
          <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-white bg-opacity-80 rounded-full animate-pulse shadow-lg" />
          <div className="absolute bottom-1/3 left-1/3 w-16 h-16 bg-white bg-opacity-90 rounded-full animate-bounce shadow-lg" />
          <div className="absolute top-1/2 right-1/3 w-18 h-18 bg-white bg-opacity-75 rounded-full animate-pulse shadow-lg" />
          <div className="absolute top-2/3 left-1/5 w-12 h-12 bg-white bg-opacity-70 rounded-full animate-bounce shadow-md" />
          <div className="absolute bottom-1/4 right-1/5 w-14 h-14 bg-white bg-opacity-85 rounded-full animate-pulse shadow-md" />
          <div className="absolute top-1/5 right-2/5 w-10 h-10 bg-white bg-opacity-80 rounded-full animate-bounce shadow-md" />
          <div className="absolute top-[218px] left-[25px] w-[340px] h-[39px] bg-white bg-opacity-40 rounded animate-pulse" />
        </div>
      )}
    </>
  );
};