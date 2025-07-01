import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { TemperatureBar } from "../../components/TemperatureBar";
import { ComfortBar } from "../../components/ComfortBar";
import { useGameLogic } from "../../hooks/useGameLogic";

export const ElementWeb = (): JSX.Element => {
  const { gameState, updateTempPointer, handleAddButtonClick, handleMinusButtonClick } = useGameLogic();
  const [handAnimationState, setHandAnimationState] = useState<'idle' | 'animating'>('idle');
  const [hand3AnimationState, setHand3AnimationState] = useState<'idle' | 'animating'>('idle');
  const [hand4AnimationState, setHand4AnimationState] = useState<'idle' | 'animating'>('idle');
  const [hand5AnimationState, setHand5AnimationState] = useState<'idle' | 'animating'>('idle');
  const [sparkler1AnimationState, setSparkler1AnimationState] = useState<'idle' | 'animating'>('idle');
  const [sparkler2AnimationState, setSparkler2AnimationState] = useState<'idle' | 'animating'>('idle');
  const [sparkler3AnimationState, setSparkler3AnimationState] = useState<'idle' | 'animating'>('idle');
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(true); // Add debug toggle state
  const [tapIconAnimationState, setTapIconAnimationState] = useState<'idle' | 'animating'>('idle');

  // Add keyboard event listener for debug toggle
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'd') {
        setShowDebugInfo(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Hand animation effect
  useEffect(() => {
    if (gameState.handAnimationTrigger === 0) return;

    setHandAnimationState('animating');

    // Animation sequence: 3 taps, each tap takes 400ms (200ms down + 200ms up)
    // Total animation time: 3 * 400ms = 1200ms
    const animationTimer = setTimeout(() => {
      setHandAnimationState('idle');
    }, 1200); // 1.2 seconds for 3 complete taps

    return () => clearTimeout(animationTimer);
  }, [gameState.handAnimationTrigger]);

  // Hand-3 animation effect
  useEffect(() => {
    if (gameState.hand3AnimationTrigger === 0) return;

    setHand3AnimationState('animating');

    // Animation sequence: 3 horizontal taps, each tap takes 400ms (200ms right + 200ms back)
    // Total animation time: 3 * 400ms = 1200ms
    const animationTimer = setTimeout(() => {
      setHand3AnimationState('idle');
    }, 1200); // 1.2 seconds for 3 complete horizontal taps

    return () => clearTimeout(animationTimer);
  }, [gameState.hand3AnimationTrigger]);

  // Hand-4 animation effect
  useEffect(() => {
    if (gameState.hand4AnimationTrigger === 0) return;

    setHand4AnimationState('animating');

    // Animation sequence: 3 horizontal taps (left direction), each tap takes 400ms (200ms left + 200ms back)
    // Total animation time: 3 * 400ms = 1200ms
    const animationTimer = setTimeout(() => {
      setHand4AnimationState('idle');
    }, 1200); // 1.2 seconds for 3 complete horizontal taps

    return () => clearTimeout(animationTimer);
  }, [gameState.hand4AnimationTrigger]);

  // Hand-5 animation effect
  useEffect(() => {
    if (gameState.hand5AnimationTrigger === 0) return;

    setHand5AnimationState('animating');

    // Animation sequence: 3 horizontal taps (right direction), each tap takes 400ms (200ms right + 200ms back)
    // Total animation time: 3 * 400ms = 1200ms
    const animationTimer = setTimeout(() => {
      setHand5AnimationState('idle');
    }, 1200); // 1.2 seconds for 3 complete horizontal taps

    return () => clearTimeout(animationTimer);
  }, [gameState.hand5AnimationTrigger]);

  // Sparkler-1 animation effect
  useEffect(() => {
    if (gameState.sparkler1AnimationTrigger === 0) return;

    setSparkler1AnimationState('animating');

    // Animation duration: 0.6 seconds for sparkler effect
    const animationTimer = setTimeout(() => {
      setSparkler1AnimationState('idle');
    }, 600); // 0.6 seconds for sparkler animation

    return () => clearTimeout(animationTimer);
  }, [gameState.sparkler1AnimationTrigger]);

  // Sparkler-2 animation effect
  useEffect(() => {
    if (gameState.sparkler2AnimationTrigger === 0) return;

    setSparkler2AnimationState('animating');

    // Animation duration: 0.6 seconds for sparkler effect
    const animationTimer = setTimeout(() => {
      setSparkler2AnimationState('idle');
    }, 600); // 0.6 seconds for sparkler animation

    return () => clearTimeout(animationTimer);
  }, [gameState.sparkler2AnimationTrigger]);

  // Sparkler-3 animation effect
  useEffect(() => {
    if (gameState.sparkler3AnimationTrigger === 0) return;

    setSparkler3AnimationState('animating');

    // Animation duration: 0.6 seconds for sparkler effect
    const animationTimer = setTimeout(() => {
      setSparkler3AnimationState('idle');
    }, 600); // 0.6 seconds for sparkler animation

    return () => clearTimeout(animationTimer);
  }, [gameState.sparkler3AnimationTrigger]);

  // Tap icon rotation animation effect
  useEffect(() => {
    if (gameState.tapIconAnimationTrigger === 0) return;

    setTapIconAnimationState('animating');

    // Animation duration: 0.3 seconds for rotation
    const animationTimer = setTimeout(() => {
      setTapIconAnimationState('idle');
    }, 300); // 0.3 seconds for rotation animation

    return () => clearTimeout(animationTimer);
  }, [gameState.tapIconAnimationTrigger]);

  // Calculate temperature icon position to center with tempbar fill
  const calculateTempIconPosition = () => {
    // Fill bar configuration (matching TemperatureBar component)
    const totalWidth = 628;
    const fillBarSidePadding = 40; // 40px padding on each side for fill bar display
    const fillBarContentWidth = totalWidth - (2 * fillBarSidePadding); // 548px content area
    const fillBarLeftMargin = fillBarSidePadding; // 40px left margin
    const sections = 5;
    const sectionWidth = fillBarContentWidth / sections; // 109.6px per section
    
    // Section 4 (fourth section): from section 3 end to section 4 end
    const fillSectionIndex = 4; // Fourth section (1-based)
    const fillSectionLeft = fillBarLeftMargin + sectionWidth * (fillSectionIndex - 1); // 40 + 109.6 * 3 = 368.8px
    const fillSectionWidth = sectionWidth; // 109.6px
    
    // Calculate center of the fill section
    const fillSectionCenter = fillSectionLeft + (fillSectionWidth / 2); // 368.8 + 54.8 = 423.6px
    
    // Temperature icon dimensions (from original code: w-[66px] h-[18px])
    const iconWidth = 66;
    
    // Calculate icon left position to center it with fill section
    // Base left position is 48px (left-12 = 48px), so we need to adjust from there
    const baseLeft = 48; // left-12 in pixels
    const iconLeft = baseLeft + fillSectionCenter - (iconWidth / 2); // 48 + 423.6 - 33 = 438.6px
    
    return Math.round(iconLeft); // Round to nearest pixel
  };

  const tempIconLeft = calculateTempIconPosition();

  // Determine which dialog image to show
  const getDialogImage = () => {
    if (gameState.hasReachedFillMiddleFromRight) {
      return "/image-dialog-5.png"; // Show dialog-5 when pointer reaches middle from right (90% → 70%)
    } else if (gameState.hasReachedComfort80) {
      return "/image-dialog-4.png"; // Show dialog-4 when comfort has reached 80%
    } else if (gameState.hasEnteredTempBarFill) {
      return "/image-dialog-3.png"; // Show dialog-3 when pointer has entered blue area
    } else if (gameState.hasClickedAdd) {
      return "/image-dialog-2.png"; // Show dialog-2 when add button clicked
    } else {
      return "/image-dialog-1.png"; // Show dialog-1 initially
    }
  };

  // Game interface data
  const gameElements = {
    controls: [
      {
        src: "/icon-tap.png",
        alt: "Tap control",
        position: "left-[322px] top-[448px]",
        size: "w-20 h-20",
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
        position: `top-[180px]`, // Remove left positioning, will be set dynamically
        size: "w-[66px] h-[18px]",
        dynamicLeft: tempIconLeft, // Add dynamic left position
      },
      {
        src: "/icon-comfortbar-succ.png",
        alt: "Comfort bar success indicator",
        position: "left-[648px] top-[72px]",
      },
    ],
  };

  return (
    <div className="bg-[#2f2f2f] flex flex-row justify-center w-full">
      <Card className="bg-[#2f2f2f] w-[724px] h-[584px] border-0">
        <CardContent className="p-0">
          <div className="relative h-[584px] bg-[url(/bg-tutorial.png)] bg-cover bg-[50%_50%]">
            {/* Blue overlay */}
            <div className="absolute w-[724px] h-[584px] top-0 left-0 bg-[#00408a] opacity-60" />

            {/* Time icon - always visible from start to end */}
            <img
              className="absolute object-cover"
              style={{
                top: '36px',
                left: '275px',
                width: '166px',
                height: '36px'
              }}
              alt="Time indicator"
              src="/icon-time.png"
            />

            {/* Music toggle button */}
            <Button
              variant="ghost"
              className="absolute w-20 h-9 top-6 left-[620px] p-0"
            >
              <img
                className="w-full h-full"
                alt="Music toggle"
                src="/icon-music-on.png"
              />
            </Button>

            {/* Comfort Bar */}
            <ComfortBar progress={gameState.comfortProgress} />

            {/* Temperature Bar with Controls */}
            <TemperatureBar
              tempPointer={gameState.tempPointer}
              tempBarFill={gameState.tempBarFill}
              onTempChange={updateTempPointer}
              onAddButtonClick={handleAddButtonClick}
              minusButtonAnimationActive={gameState.minusButtonAnimationActive}
              isAddButtonDisabled={gameState.isAddButtonDisabled}
              isMinusButtonDisabled={gameState.isMinusButtonDisabled}
              onMinusButtonClick={handleMinusButtonClick}
            />

            {/* Other game controls - Tap icon with rotation animation */}
            {gameElements.controls.map((control, index) => (
              <Button
                key={`control-${index}`}
                variant="ghost"
                className={`absolute ${control.size || "w-14 h-14"} ${control.position} p-0`}
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

            {/* Hand cursor - only show when hand-3, hand-4, and hand-5 are not shown */}
            {!gameState.shouldShowHand3 && !gameState.shouldShowHand4 && !gameState.shouldShowHand5 && (
              <img
                className={`w-[41px] h-[50px] top-[448px] left-[521px] absolute object-cover transition-transform duration-200 ease-out ${
                  handAnimationState === 'animating' 
                    ? 'animate-[handTap_1.2s_ease-out]' 
                    : ''
                }`}
                alt="Hand cursor"
                src="/icon-hand.png"
              />
            )}

            {/* Hand-3 cursor - show when pointer enters temp bar fill */}
            {gameState.shouldShowHand3 && (
              <div 
                className="absolute flex justify-center items-center w-12 pt-0"
                style={{
                  top: '62px',
                  left: '582px',
                  width: '48px',
                  height: '40px'
                }}
              >
                <img
                  className={`w-12 h-10 object-cover transition-transform duration-200 ease-out ${
                    hand3AnimationState === 'animating' 
                      ? 'animate-[hand3Tap_1.2s_ease-out]' 
                      : ''
                  }`}
                  alt="Hand-3 cursor"
                  src="/icon-hand-3.png"
                />
              </div>
            )}

            {/* Hand-4 cursor - show when comfort reaches 80% */}
            {gameState.shouldShowHand4 && (
              <div 
                className="absolute flex justify-center items-center w-12 pt-0"
                style={{
                  top: '62px',
                  left: '94px',
                  width: '48px',
                  height: '40px'
                }}
              >
                <img
                  className={`w-12 h-10 object-cover transition-transform duration-200 ease-out ${
                    hand4AnimationState === 'animating' 
                      ? 'animate-[hand4Tap_1.2s_ease-out]' 
                      : ''
                  }`}
                  alt="Hand-4 cursor"
                  src="/icon-hand-4.png"
                />
              </div>
            )}

            {/* Hand-5 cursor - show when displaying dialog-5 */}
            {gameState.shouldShowHand5 && (
              <div 
                className="absolute flex justify-center items-center"
                style={{
                  top: '24px',
                  left: '203px',
                  width: '48px',
                  height: '40px'
                }}
              >
                <img
                  className={`w-12 h-10 object-cover transition-transform duration-200 ease-out ${
                    hand5AnimationState === 'animating' 
                      ? 'animate-[hand5Tap_1.2s_ease-out]' 
                      : ''
                  }`}
                  alt="Hand-5 cursor"
                  src="/icon-hand-5.png"
                />
              </div>
            )}

            {/* Sparklers - show when comfort reaches 100% (green) */}
            {gameState.shouldShowSparklers && (
              <>
                {/* Sparkler 1 */}
                <img
                  className={`absolute object-cover transition-all duration-600 ease-out ${
                    sparkler1AnimationState === 'animating' 
                      ? 'animate-[sparklerBurst_0.6s_ease-out]' 
                      : ''
                  }`}
                  style={{
                    top: '218px',
                    left: '159px',
                    width: '87px',
                    height: '87px'
                  }}
                  alt="Sparkler 1"
                  src="/icon-sparklers-1.png"
                />

                {/* Sparkler 2 */}
                <img
                  className={`absolute object-cover transition-all duration-600 ease-out ${
                    sparkler2AnimationState === 'animating' 
                      ? 'animate-[sparklerBurst_0.6s_ease-out]' 
                      : ''
                  }`}
                  style={{
                    top: '198px',
                    left: '633px',
                    width: '67px',
                    height: '67px'
                  }}
                  alt="Sparkler 2"
                  src="/icon-sparklers-2.png"
                />

                {/* Sparkler 3 */}
                <img
                  className={`absolute object-cover transition-all duration-600 ease-out ${
                    sparkler3AnimationState === 'animating' 
                      ? 'animate-[sparklerBurst_0.6s_ease-out]' 
                      : ''
                  }`}
                  style={{
                    top: '401px',
                    left: '242px',
                    width: '57px',
                    height: '57px'
                  }}
                  alt="Sparkler 3"
                  src="/icon-sparklers-3.png"
                />
              </>
            )}

            {/* Indicators */}
            {gameElements.indicators.map((indicator, index) => (
              <img
                key={`indicator-${index}`}
                className={`absolute ${indicator.size || "w-7 h-7"} ${indicator.position} object-cover`}
                alt={indicator.alt}
                src={indicator.src}
                style={indicator.dynamicLeft ? { left: `${indicator.dynamicLeft}px` } : {}}
              />
            ))}

            {/* Dialog box - switches between dialog-1, dialog-2, dialog-3, dialog-4, and dialog-5 */}
            <div className="absolute w-[418px] h-[214px] top-[222px] left-[305px]">
              <img
                className="w-full h-full object-cover"
                alt="Dialog box"
                src={getDialogImage()}
              />
            </div>

            {/* Skip button - only show when NOT displaying dialog-5 */}
            {!gameState.hasReachedFillMiddleFromRight && (
              <Button
                variant="ghost"
                className="absolute p-0 top-[221px] left-[305px]"
                style={{
                  width: '82px',
                  height: '39px'
                }}
              >
                <img
                  className="w-full h-full object-cover"
                  alt="Skip tutorial"
                  src="/icon-skip-1.png"
                />
              </Button>
            )}

            {/* Debug info - toggle with 'D' key */}
            {showDebugInfo && (
              <div className="absolute top-4 left-4 text-white text-sm bg-black bg-opacity-50 p-2 rounded">
                <div className="text-xs text-gray-300 mb-1">Press 'D' to toggle debug info</div>
                <div>Temp Pointer: {gameState.tempPointer.toFixed(1)}%</div>
                <div>Comfort: {gameState.comfortProgress.toFixed(1)}%</div>
                <div>In Range: {gameState.tempPointer >= gameState.tempBarFill.start && gameState.tempPointer <= gameState.tempBarFill.end ? 'Yes' : 'No'}</div>
                <div>Auto Decrease: {gameState.isAutoDecreaseActive ? 'Active' : 'Paused'}</div>
                <div>Dialog: {gameState.hasReachedFillMiddleFromRight ? 'Dialog 5' : gameState.hasReachedComfort80 ? 'Dialog 4' : gameState.hasEnteredTempBarFill ? 'Dialog 3' : gameState.hasClickedAdd ? 'Dialog 2' : 'Dialog 1'}</div>
                <div>Hand Animation: {handAnimationState}</div>
                <div>Animation Trigger: {gameState.handAnimationTrigger}</div>
                <div>In Temp Fill: {gameState.isInTempBarFill ? 'Yes' : 'No'}</div>
                <div>Show Hand-3: {gameState.shouldShowHand3 ? 'Yes' : 'No'}</div>
                <div>Show Hand-4: {gameState.shouldShowHand4 ? 'Yes' : 'No'}</div>
                <div>Show Hand-5: {gameState.shouldShowHand5 ? 'Yes' : 'No'}</div>
                <div>Hand-3 Animation: {hand3AnimationState}</div>
                <div>Hand-4 Animation: {hand4AnimationState}</div>
                <div>Hand-5 Animation: {hand5AnimationState}</div>
                <div>Has Entered Fill: {gameState.hasEnteredTempBarFill ? 'Yes' : 'No'}</div>
                <div>Reached 80%: {gameState.hasReachedComfort80 ? 'Yes' : 'No'}</div>
                <div>Minus Btn Active: {gameState.minusButtonAnimationActive ? 'Yes' : 'No'}</div>
                <div>Add Btn Disabled: {gameState.isAddButtonDisabled ? 'Yes' : 'No'}</div>
                <div>Minus Btn Disabled: {gameState.isMinusButtonDisabled ? 'Yes' : 'No'}</div>
                <div>Reached Middle From Right: {gameState.hasReachedFillMiddleFromRight ? 'Yes' : 'No'}</div>
                <div>Show Sparklers: {gameState.shouldShowSparklers ? 'Yes' : 'No'}</div>
                <div>Sparkler 1: {sparkler1AnimationState}</div>
                <div>Sparkler 2: {sparkler2AnimationState}</div>
                <div>Sparkler 3: {sparkler3AnimationState}</div>
                <div>Tap Icon Rotation: {gameState.tapIconRotation}°</div>
                <div>Tap Animation: {tapIconAnimationState}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};