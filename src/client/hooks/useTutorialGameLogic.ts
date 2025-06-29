import { useState, useEffect, useCallback } from 'react';

interface GameState {
  tempPointer: number;
  comfortProgress: number;
  tempBarFill: { start: number; end: number };
  isAutoDecreaseActive: boolean;
  hasClickedAdd: boolean;
  handAnimationTrigger: number;
  isInTempBarFill: boolean;
  shouldShowHand3: boolean;
  hand3AnimationTrigger: number;
  hasEnteredTempBarFill: boolean;
  shouldShowHand4: boolean;
  hand4AnimationTrigger: number;
  hasReachedComfort80: boolean;
  minusButtonAnimationActive: boolean;
  isAddButtonDisabled: boolean;
  isMinusButtonDisabled: boolean;
  hasReachedFillMiddleFromRight: boolean;
  shouldShowSparklers: boolean;
  sparkler1AnimationTrigger: number;
  sparkler2AnimationTrigger: number;
  sparkler3AnimationTrigger: number;
  hasTriggeredSparklers: boolean;
  shouldShowHand5: boolean;
  hand5AnimationTrigger: number;
  tapIconRotation: number;
  tapIconAnimationTrigger: number;
}

export const useTutorialGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>({
    tempPointer: 50,
    comfortProgress: 65,
    tempBarFill: { start: 60, end: 80 },
    isAutoDecreaseActive: true,
    hasClickedAdd: false,
    handAnimationTrigger: 1,
    isInTempBarFill: false,
    shouldShowHand3: false,
    hand3AnimationTrigger: 0,
    hasEnteredTempBarFill: false,
    shouldShowHand4: false,
    hand4AnimationTrigger: 0,
    hasReachedComfort80: false,
    minusButtonAnimationActive: false,
    isAddButtonDisabled: false,
    isMinusButtonDisabled: false,
    hasReachedFillMiddleFromRight: false,
    shouldShowSparklers: false,
    sparkler1AnimationTrigger: 0,
    sparkler2AnimationTrigger: 0,
    sparkler3AnimationTrigger: 0,
    hasTriggeredSparklers: false,
    shouldShowHand5: false,
    hand5AnimationTrigger: 0,
    tapIconRotation: 0,
    tapIconAnimationTrigger: 0,
  });

  // Stop auto-decrease after 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        isAutoDecreaseActive: false,
      }));
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Smooth auto-decrease temperature pointer
  useEffect(() => {
    if (!gameState.isAutoDecreaseActive) return;

    const interval = setInterval(() => {
      setGameState(prev => {
        if (!prev.isAutoDecreaseActive) return prev;
        
        return {
          ...prev,
          tempPointer: Math.max(0, prev.tempPointer - 0.6),
        };
      });
    }, 40);

    return () => clearInterval(interval);
  }, [gameState.isAutoDecreaseActive]);

  // Check if temperature pointer is in temp bar fill area
  useEffect(() => {
    const isInRange = gameState.tempPointer >= gameState.tempBarFill.start && 
                     gameState.tempPointer <= gameState.tempBarFill.end;
    
    const fillMiddle = (gameState.tempBarFill.start + gameState.tempBarFill.end) / 2;
    
    if (isInRange && !gameState.isInTempBarFill) {
      setGameState(prev => ({
        ...prev,
        isInTempBarFill: true,
        shouldShowHand3: !prev.hasReachedComfort80,
        hand3AnimationTrigger: !prev.hasReachedComfort80 ? prev.hand3AnimationTrigger + 1 : prev.hand3AnimationTrigger,
        hasEnteredTempBarFill: true,
      }));
    }
    else if (!isInRange && gameState.isInTempBarFill) {
      setGameState(prev => ({
        ...prev,
        isInTempBarFill: false,
        isAddButtonDisabled: false,
        isMinusButtonDisabled: false,
        shouldShowHand4: false,
        shouldShowHand5: false,
      }));
    }
    
    if (isInRange && gameState.tempPointer >= fillMiddle && !gameState.isAddButtonDisabled && !gameState.hasReachedComfort80) {
      setGameState(prev => ({
        ...prev,
        isAddButtonDisabled: true,
      }));
    }
    
    if (isInRange && gameState.tempPointer <= fillMiddle && gameState.hasReachedComfort80 && !gameState.hasReachedFillMiddleFromRight) {
      setGameState(prev => ({
        ...prev,
        isMinusButtonDisabled: true,
        hasReachedFillMiddleFromRight: true,
        shouldShowHand4: false,
        shouldShowHand5: true,
        hand5AnimationTrigger: prev.hand5AnimationTrigger + 1,
      }));
    }
  }, [gameState.tempPointer, gameState.tempBarFill, gameState.isInTempBarFill, gameState.hasReachedComfort80, gameState.isAddButtonDisabled, gameState.hasReachedFillMiddleFromRight]);

  // Check if comfort progress reaches 80%
  useEffect(() => {
    if (gameState.comfortProgress >= 80 && !gameState.hasReachedComfort80) {
      setGameState(prev => ({
        ...prev,
        comfortProgress: 50,
        tempPointer: 90,
        shouldShowHand3: false,
        shouldShowHand4: true,
        hand4AnimationTrigger: prev.hand4AnimationTrigger + 1,
        hasReachedComfort80: true,
        minusButtonAnimationActive: true,
        isInTempBarFill: false,
        isAddButtonDisabled: false,
        isMinusButtonDisabled: false,
        hasReachedFillMiddleFromRight: false,
        shouldShowHand5: false,
      }));
    }
  }, [gameState.comfortProgress, gameState.hasReachedComfort80]);

  // Check if comfort progress reaches 100%
  useEffect(() => {
    if (gameState.comfortProgress >= 100 && gameState.hasReachedComfort80 && !gameState.hasTriggeredSparklers) {
      setGameState(prev => ({
        ...prev,
        shouldShowSparklers: true,
        hasTriggeredSparklers: true,
      }));

      // Trigger sparkler animations in sequence
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          sparkler1AnimationTrigger: prev.sparkler1AnimationTrigger + 1,
        }));
      }, 0);

      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          sparkler2AnimationTrigger: prev.sparkler2AnimationTrigger + 1,
        }));
      }, 800);

      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          sparkler3AnimationTrigger: prev.sparkler3AnimationTrigger + 1,
        }));
      }, 1600);
    }
  }, [gameState.comfortProgress, gameState.hasReachedComfort80, gameState.hasTriggeredSparklers]);

  // Smooth update comfort progress
  useEffect(() => {
    if (!gameState.isAutoDecreaseActive && !gameState.isInTempBarFill) return;

    const interval = setInterval(() => {
      setGameState(prev => {
        if (prev.isAutoDecreaseActive) {
          const isInRange = prev.tempPointer >= prev.tempBarFill.start && 
                           prev.tempPointer <= prev.tempBarFill.end;
          
          let newComfortProgress;
          if (isInRange) {
            newComfortProgress = Math.min(100, prev.comfortProgress + 1.2);
          } else {
            newComfortProgress = Math.max(0, prev.comfortProgress - 1.2);
          }

          return {
            ...prev,
            comfortProgress: newComfortProgress,
          };
        }
        else if (prev.isInTempBarFill) {
          let newComfortProgress;
          
          if (!prev.hasReachedComfort80) {
            const targetProgress = 80;
            if (prev.comfortProgress < targetProgress) {
              newComfortProgress = Math.min(targetProgress, prev.comfortProgress + 1.2);
            } else {
              newComfortProgress = prev.comfortProgress;
            }
          }
          else {
            newComfortProgress = Math.min(100, prev.comfortProgress + 1.2);
          }

          return {
            ...prev,
            comfortProgress: newComfortProgress,
          };
        }
        
        return prev;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [gameState.isAutoDecreaseActive, gameState.isInTempBarFill, gameState.hasReachedComfort80]);

  const updateTempPointer = useCallback((newTemp: number) => {
    const clampedTemp = Math.max(0, Math.min(100, newTemp));
    setGameState(prev => ({
      ...prev,
      tempPointer: clampedTemp,
    }));
  }, []);

  const handleAddButtonClick = useCallback(() => {
    if (gameState.isAddButtonDisabled) {
      return;
    }
    
    setGameState(prev => ({
      ...prev,
      hasClickedAdd: true,
      handAnimationTrigger: prev.hasClickedAdd ? prev.handAnimationTrigger : prev.handAnimationTrigger + 1,
      tapIconRotation: prev.tapIconRotation + 90,
      tapIconAnimationTrigger: prev.tapIconAnimationTrigger + 1,
    }));
  }, [gameState.isAddButtonDisabled]);

  const handleMinusButtonClick = useCallback(() => {
    if (gameState.isMinusButtonDisabled) {
      return;
    }
    
    setGameState(prev => ({
      ...prev,
      tapIconRotation: prev.tapIconRotation - 90,
      tapIconAnimationTrigger: prev.tapIconAnimationTrigger + 1,
    }));
  }, [gameState.isMinusButtonDisabled]);

  return {
    gameState,
    updateTempPointer,
    handleAddButtonClick,
    handleMinusButtonClick,
  };
}; 