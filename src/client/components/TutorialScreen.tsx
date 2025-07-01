import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { TutorialTemperatureBar } from "./TutorialTemperatureBar";
import { TutorialComfortBar } from "./TutorialComfortBar";
import { useTutorialGameLogic } from "../hooks/useTutorialGameLogic";
import { useResponsiveScale, useResponsiveSize } from '../hooks/useResponsiveScale';
import { audioManager } from '../services/audioManager';

interface TutorialScreenProps {
  onSkip?: () => void;
  onComplete?: () => void;
  isMusicOn?: boolean;
  onMusicToggle?: () => void;
}

export const TutorialScreen: React.FC<TutorialScreenProps> = ({ onSkip, onComplete, isMusicOn, onMusicToggle }) => {
  // 添加响应式缩放
  const { cssVars, containerWidth, maxWidth } = useResponsiveScale();
  const { scale, scaleImage, createStyles } = useResponsiveSize();

  const { gameState, updateTempPointer, handleAddButtonClick, handleMinusButtonClick } = useTutorialGameLogic();
  const [handAnimationState, setHandAnimationState] = useState<'idle' | 'animating'>('idle');
  const [hand3AnimationState, setHand3AnimationState] = useState<'idle' | 'animating'>('idle');
  const [hand4AnimationState, setHand4AnimationState] = useState<'idle' | 'animating'>('idle');
  const [hand5AnimationState, setHand5AnimationState] = useState<'idle' | 'animating'>('idle');
  const [sparkler1AnimationState, setSparkler1AnimationState] = useState<'idle' | 'animating'>('idle');
  const [sparkler2AnimationState, setSparkler2AnimationState] = useState<'idle' | 'animating'>('idle');
  const [sparkler3AnimationState, setSparkler3AnimationState] = useState<'idle' | 'animating'>('idle');
  const [tapIconAnimationState, setTapIconAnimationState] = useState<'idle' | 'animating'>('idle');

  // 手势动画效果
  useEffect(() => {
    if (gameState.handAnimationTrigger === 0) return;

    setHandAnimationState('animating');

    const animationTimer = setTimeout(() => {
      setHandAnimationState('idle');
    }, 1200);

    return () => clearTimeout(animationTimer);
  }, [gameState.handAnimationTrigger]);

  // 手势-3动画效果
  useEffect(() => {
    if (gameState.hand3AnimationTrigger === 0) return;

    setHand3AnimationState('animating');

    const animationTimer = setTimeout(() => {
      setHand3AnimationState('idle');
    }, 1200);

    return () => clearTimeout(animationTimer);
  }, [gameState.hand3AnimationTrigger]);

  // 手势-4动画效果
  useEffect(() => {
    if (gameState.hand4AnimationTrigger === 0) return;

    setHand4AnimationState('animating');

    const animationTimer = setTimeout(() => {
      setHand4AnimationState('idle');
    }, 1200);

    return () => clearTimeout(animationTimer);
  }, [gameState.hand4AnimationTrigger]);

  // 手势-5动画效果
  useEffect(() => {
    if (gameState.hand5AnimationTrigger === 0) return;

    setHand5AnimationState('animating');

    const animationTimer = setTimeout(() => {
      setHand5AnimationState('idle');
    }, 1200);

    return () => clearTimeout(animationTimer);
  }, [gameState.hand5AnimationTrigger]);

  // 烟花-1动画效果
  useEffect(() => {
    if (gameState.sparkler1AnimationTrigger === 0) return;

    setSparkler1AnimationState('animating');

    const animationTimer = setTimeout(() => {
      setSparkler1AnimationState('idle');
    }, 600);

    return () => clearTimeout(animationTimer);
  }, [gameState.sparkler1AnimationTrigger]);

  // 烟花-2动画效果
  useEffect(() => {
    if (gameState.sparkler2AnimationTrigger === 0) return;

    setSparkler2AnimationState('animating');

    const animationTimer = setTimeout(() => {
      setSparkler2AnimationState('idle');
    }, 600);

    return () => clearTimeout(animationTimer);
  }, [gameState.sparkler2AnimationTrigger]);

  // 烟花-3动画效果
  useEffect(() => {
    if (gameState.sparkler3AnimationTrigger === 0) return;

    setSparkler3AnimationState('animating');

    const animationTimer = setTimeout(() => {
      setSparkler3AnimationState('idle');
    }, 600);

    return () => clearTimeout(animationTimer);
  }, [gameState.sparkler3AnimationTrigger]);

  // 点击图标旋转动画效果
  useEffect(() => {
    if (gameState.tapIconAnimationTrigger === 0) return;

    setTapIconAnimationState('animating');

    const animationTimer = setTimeout(() => {
      setTapIconAnimationState('idle');
    }, 300);

    return () => clearTimeout(animationTimer);
  }, [gameState.tapIconAnimationTrigger]);

  // 计算温度图标位置（带缩放）
  const calculateTempIconPosition = () => {
    const totalWidth = scale(628);
    const fillBarSidePadding = scale(40);
    const fillBarContentWidth = totalWidth - (2 * fillBarSidePadding);
    const fillBarLeftMargin = fillBarSidePadding;
    const sections = 5;
    const sectionWidth = fillBarContentWidth / sections;
    
    const fillSectionIndex = 4;
    const fillSectionLeft = fillBarLeftMargin + sectionWidth * (fillSectionIndex - 1);
    const fillSectionWidth = sectionWidth;
    
    const fillSectionCenter = fillSectionLeft + (fillSectionWidth / 2);
    
    const iconWidth = scale(66);
    
    const baseLeft = scale(48);
    const iconLeft = baseLeft + fillSectionCenter - (iconWidth / 2);
    
    return Math.round(iconLeft);
  };

  const tempIconLeft = calculateTempIconPosition();

  // 确定显示哪个对话框图片
  const getDialogImage = () => {
    if (gameState.hasReachedFillMiddleFromRight) {
      return "/image-dialog-5.png";
    } else if (gameState.hasReachedComfort80) {
      return "/image-dialog-4.png";
    } else if (gameState.hasEnteredTempBarFill) {
      return "/image-dialog-3.png";
    } else if (gameState.hasClickedAdd) {
      return "/image-dialog-2.png";
    } else {
      return "/image-dialog-1.png";
    }
  };

  // 处理跳过按钮点击
  const handleSkipClick = () => {
    onSkip?.();
  };

  // 处理完成（显示对话框-5时）
  const handleCompleteClick = () => {
    // 播放引导结束音效
    if (!audioManager.isMutedState()) {
      audioManager.playSound('tutorialComplete');
    }
    onComplete?.();
  };

  // 检查是否显示跳过按钮 - 当显示dialog-5时隐藏跳过按钮
  const shouldShowSkipButton = !gameState.hasReachedFillMiddleFromRight;

  // 动态计算舒适度条图标尺寸
  const getComfortIconSize = (iconType: 'fail' | 'succ') => {
    if (iconType === 'fail') {
      // icon-comfortbar-fail 逻辑：
      // 初始: 28px
      // 舒适度达到80%时: 48px
      // 显示对话框-5时: 缩减到28px
      if (gameState.hasReachedComfort80 && !gameState.hasReachedFillMiddleFromRight) {
        return 48;
      }
      return 28;
    } else {
      // icon-comfortbar-succ 逻辑：
      // 初始: 28px
      // 指针进入温度条填充区域时: 48px（任何时候进入都放大）
      if (gameState.isInTempBarFill) {
        return 48;
      }
      return 28;
    }
  };

  // 游戏界面数据（响应式缩放）
  const gameElements = {
    controls: [
      {
        src: "/icon-tap.png",
        alt: "Tap control",
        style: createStyles({
          left: 322,
          top: 448,
          width: 80,
          height: 80
        })
      },
    ],
    indicators: [
      {
        src: "/icon-comfortbar-fail.png",
        alt: "Comfort bar fail indicator",
        position: "left-12 top-[72px]",
      },
      {
        src: "/icon-temp.png",
        alt: "Temperature indicator",
        position: `top-[180px]`,
        size: "w-[66px] h-[18px]",
        dynamicLeft: tempIconLeft,
      },
      {
        src: "/icon-comfortbar-succ.png",
        alt: "Comfort bar success indicator",
        position: "left-[648px] top-[72px]",
      },
    ],
  };

  return (
    <div 
      className="flex items-center justify-center w-full min-h-screen"
      style={{ ...cssVars } as React.CSSProperties}
    >
      <Card 
        className="border-0"
        style={{
          width: `${Math.min(containerWidth, maxWidth)}px`,
          height: `${scale(584)}px`,
          maxWidth: `${maxWidth}px`
        }}
      >
        <CardContent className="p-0">
          <div 
            className="relative bg-[url(/bg-tutorial.png)] bg-cover bg-[50%_50%]"
            style={{
              height: `${scale(584)}px`,
              width: `${Math.min(containerWidth, maxWidth)}px`
            }}
          >
            {/* 蓝色遮罩层 */}
            <div 
              className="absolute top-0 left-0 bg-[#00408a] opacity-60"
              style={{
                width: `${Math.min(containerWidth, maxWidth)}px`,
                height: `${scale(584)}px`
              }}
            />

            {/* 时间图标 - 从开始到结束始终可见 */}
            <img
              className="absolute object-cover"
              style={createStyles({
                top: 72,
                left: 297,
                width: 130,
                height: 28
              })}
              alt="Time indicator"
              src="/icon-time.png"
            />

            {/* 音乐切换按钮 */}
            <Button
              variant="ghost"
              className="absolute p-0 hover:scale-105 active:scale-95 transition-transform duration-150"
              style={createStyles({
                width: 80,
                height: 36,
                top: 24,
                left: 620
              })}
              onClick={onMusicToggle}
            >
              <img
                className="w-full h-full"
                alt="Music toggle"
                src={isMusicOn ? "/icon-music-on.png" : "/Button_Music_Off.png"}
              />
            </Button>

            {/* 舒适度进度条 */}
            <TutorialComfortBar progress={gameState.comfortProgress} />

            {/* 温度条及控制器 */}
            <TutorialTemperatureBar
              tempPointer={gameState.tempPointer}
              tempBarFill={gameState.tempBarFill}
              onTempChange={updateTempPointer}
              onAddButtonClick={handleAddButtonClick}
              minusButtonAnimationActive={gameState.minusButtonAnimationActive}
              isAddButtonDisabled={gameState.isAddButtonDisabled}
              isMinusButtonDisabled={gameState.isMinusButtonDisabled}
              onMinusButtonClick={handleMinusButtonClick}
            />

            {/* 其他游戏控制器 - 带旋转动画的点击图标 */}
            {gameElements.controls.map((control, index) => (
              <Button
                key={`control-${index}`}
                variant="ghost"
                className="absolute p-0"
                style={control.style}
              >
                <img
                  className={`object-cover w-full h-full transition-transform duration-300 ease-out ${
                    tapIconAnimationState === 'animating' ? 'animate-[tapRotate_0.3s_ease-out]' : ''
                  }`}
                  style={{
                    transform: `rotate(${gameState.tapIconRotation}deg)`,
                  }}
                  alt={control.alt}
                  src={control.src}
                />
              </Button>
            ))}

            {/* 指示器（响应式缩放） */}
            {gameElements.indicators.map((indicator, index) => {
              // 计算图标的动态属性
              let iconWidth, iconHeight, iconLeft, iconTop;
              
              if (indicator.src === "/icon-temp.png") {
                // 温度图标
                iconWidth = 66;
                iconHeight = 18;
                iconTop = 180;
                iconLeft = indicator.dynamicLeft || 0;
              } else if (indicator.src === "/icon-comfortbar-fail.png") {
                // 失败图标 - 动态尺寸
                const size = getComfortIconSize('fail');
                iconWidth = size;
                iconHeight = size;
                iconTop = 72;
                iconLeft = 48;
              } else {
                // 成功图标 - 动态尺寸
                const size = getComfortIconSize('succ');
                iconWidth = size;
                iconHeight = size;
                iconTop = 72;
                iconLeft = 648;
              }

              return (
                <img
                  key={`indicator-${index}`}
                  className="absolute object-cover transition-all duration-300 ease-out"
                  style={createStyles({
                    top: iconTop,
                    left: iconLeft,
                    width: iconWidth,
                    height: iconHeight
                  })}
                  alt={indicator.alt}
                  src={indicator.src}
                />
              );
            })}

            {/* 手势光标 - 仅在手势-3、手势-4和手势-5未显示时显示 */}
            {!gameState.shouldShowHand3 && !gameState.shouldShowHand4 && !gameState.shouldShowHand5 && (
              <img
                className={`absolute object-cover transition-transform duration-200 ease-out ${
                  handAnimationState === 'animating' 
                    ? 'animate-[handTap_1.2s_ease-out]' 
                    : ''
                }`}
                style={createStyles({
                  width: 41,
                  height: 50,
                  top: 448,
                  left: 521
                })}
                alt="Hand cursor"
                src="/icon-hand.png"
              />
            )}

            {/* 手势-3光标 - 指针进入温度条填充区域时显示 */}
            {gameState.shouldShowHand3 && (
              <div 
                className="absolute flex justify-center items-center pt-0"
                style={createStyles({
                  top: 62,
                  left: 582,
                  width: 48,
                  height: 40
                })}
              >
                <img
                  className={`object-cover transition-transform duration-200 ease-out ${
                    hand3AnimationState === 'animating' 
                      ? 'animate-[hand3Tap_1.2s_ease-out]' 
                      : ''
                  }`}
                  style={createStyles({
                    width: 48,
                    height: 40
                  })}
                  alt="Hand-3 cursor"
                  src="/icon-hand-3.png"
                />
              </div>
            )}

            {/* 手势-4光标 - 舒适度达到80%时显示 */}
            {gameState.shouldShowHand4 && (
              <div 
                className="absolute flex justify-center items-center pt-0"
                style={createStyles({
                  top: 62,
                  left: 94,
                  width: 48,
                  height: 40
                })}
              >
                <img
                  className={`object-cover transition-transform duration-200 ease-out ${
                    hand4AnimationState === 'animating' 
                      ? 'animate-[hand4Tap_1.2s_ease-out]' 
                      : ''
                  }`}
                  style={createStyles({
                    width: 48,
                    height: 40
                  })}
                  alt="Hand-4 cursor"
                  src="/icon-hand-4.png"
                />
              </div>
            )}

            {/* 手势-5光标 - 显示对话框-5时显示 */}
            {gameState.shouldShowHand5 && (
              <div 
                className="absolute flex justify-center items-center"
                style={createStyles({
                  top: 24,
                  left: 203,
                  width: 48,
                  height: 40
                })}
              >
                <img
                  className={`object-cover transition-transform duration-200 ease-out ${
                    hand5AnimationState === 'animating' 
                      ? 'animate-[hand5Tap_1.2s_ease-out]' 
                      : ''
                  }`}
                  style={createStyles({
                    width: 48,
                    height: 40
                  })}
                  alt="Hand-5 cursor"
                  src="/icon-hand-5.png"
                />
              </div>
            )}

            {/* 烟花特效 - 舒适度达到100%（绿色）时显示 */}
            {gameState.shouldShowSparklers && (
              <>
                <img
                  className={`absolute object-cover transition-all duration-600 ease-out ${
                    sparkler1AnimationState === 'animating' 
                      ? 'animate-[sparklerBurst_0.6s_ease-out]' 
                      : ''
                  }`}
                  style={createStyles({
                    top: 218,
                    left: 159,
                    width: 87,
                    height: 87
                  })}
                  alt="Sparkler 1"
                  src="/icon-sparklers-1.png"
                />

                <img
                  className={`absolute object-cover transition-all duration-600 ease-out ${
                    sparkler2AnimationState === 'animating' 
                      ? 'animate-[sparklerBurst_0.6s_ease-out]' 
                      : ''
                  }`}
                  style={createStyles({
                    top: 198,
                    left: 633,
                    width: 67,
                    height: 67
                  })}
                  alt="Sparkler 2"
                  src="/icon-sparklers-2.png"
                />

                <img
                  className={`absolute object-cover transition-all duration-600 ease-out ${
                    sparkler3AnimationState === 'animating' 
                      ? 'animate-[sparklerBurst_0.6s_ease-out]' 
                      : ''
                  }`}
                  style={createStyles({
                    top: 401,
                    left: 242,
                    width: 57,
                    height: 57
                  })}
                  alt="Sparkler 3"
                  src="/icon-sparklers-3.png"
                />
              </>
            )}

            {/* 对话框图片 */}
            <img
              className="absolute object-cover cursor-pointer"
              style={createStyles({
                top: 221,
                left: 305,
                width: 418,
                height: 215
              })}
              alt="Tutorial dialog"
              src={getDialogImage()}
              onClick={gameState.hasReachedFillMiddleFromRight ? handleCompleteClick : undefined}
            />

            {/* 跳过按钮 - 位于对话框左上角，当显示dialog-5时隐藏 */}
            {shouldShowSkipButton && (
              <Button
                variant="ghost"
                className="absolute p-0"
                style={createStyles({
                  top: 221,
                  left: 305,
                  width: 82,
                  height: 39
                })}
                onClick={handleSkipClick}
              >
                <img
                  className="w-full h-full object-cover"
                  alt="Skip tutorial"
                  src="/icon-skip-1.png"
                />
              </Button>
            )}

          </div>
        </CardContent>
      </Card>
    </div>
  );
};