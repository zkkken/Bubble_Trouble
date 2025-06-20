/**
 * 游戏按钮组件
 * 支持图片和文字的可复用按钮组件
 * 
 * @author 开发者B - UI/UX 界面负责人
 */

import React, { useState } from 'react';

interface GameButtonProps {
  onClick?: () => void;
  onMouseDown?: () => void;
  onMouseUp?: () => void;
  onMouseLeave?: () => void;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  imageSrc?: string | null;
  isReversed?: boolean;
}

export const GameButton: React.FC<GameButtonProps> = ({
  onClick,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
  disabled,
  className,
  children,
  imageSrc,
  isReversed = false,
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const shouldUseImage = imageSrc && !imageError;

  return (
    <button
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      disabled={disabled}
      className={`${className} ${isReversed ? 'ring-4 ring-purple-400 animate-pulse' : ''} relative overflow-hidden`}
    >
      {shouldUseImage ? (
        <>
          <img
            src={imageSrc!}
            alt="Button"
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            {children}
          </div>
        </>
      ) : (
        children
      )}
    </button>
  );
};