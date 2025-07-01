import { useState, useEffect, useCallback } from 'react';

interface GameState {
  tempPointer: number;
  comfortProgress: number;
  tempBarFill: { start: number; end: number };
  isAutoDecreaseActive: boolean;
  hasClickedAdd: boolean;
  handAnimationTrigger: number; // Counter to trigger hand animation
  isInTempBarFill: boolean; // Track if pointer is in temp bar fill area
  shouldShowHand3: boolean; // Track if hand-3 should be shown
  hand3AnimationTrigger: number; // Counter to trigger hand-3 animation
  hasEnteredTempBarFill: boolean; // Track if pointer has ever entered temp bar fill area
  shouldShowHand4: boolean; // Track if hand-4 should be shown
  hand4AnimationTrigger: number; // Counter to trigger hand-4 animation
  hasReachedComfort80: boolean; // Track if comfort has reached 80%
  minusButtonAnimationActive: boolean; // Track if minus button animation is active
  isAddButtonDisabled: boolean; // Track if add button should be disabled
  isMinusButtonDisabled: boolean; // Track if minus button should be disabled
  hasReachedFillMiddleFromRight: boolean; // Track if pointer reached fill middle from 90% position
  shouldShowSparklers: boolean; // Track if sparklers should be shown
  sparkler1AnimationTrigger: number; // Counter to trigger sparkler-1 animation
  sparkler2AnimationTrigger: number; // Counter to trigger sparkler-2 animation
  sparkler3AnimationTrigger: number; // Counter to trigger sparkler-3 animation
  hasTriggeredSparklers: boolean; // Track if sparklers have been triggered to prevent multiple triggers
  shouldShowHand5: boolean; // Track if hand-5 should be shown
  hand5AnimationTrigger: number; // Counter to trigger hand-5 animation
  tapIconRotation: number; // Track tap icon rotation angle
  tapIconAnimationTrigger: number; // Counter to trigger tap icon rotation animation
}

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>({
    tempPointer: 50, // Start at 50% of the entire tempbar
    comfortProgress: 65, // Start at 65% (3/4 - 10% = 75% - 10% = 65%)
    // Section 4 of 5: from 60% to 80% (3/5 to 4/5)
    tempBarFill: { start: 60, end: 80 }, 
    isAutoDecreaseActive: true, // Auto-decrease is active initially
    hasClickedAdd: false, // Track if add button has been clicked
    handAnimationTrigger: 1, // Start with 1 to trigger initial animation
    isInTempBarFill: false, // Initially not in temp bar fill
    shouldShowHand3: false, // Initially don't show hand-3
    hand3AnimationTrigger: 0, // No hand-3 animation initially
    hasEnteredTempBarFill: false, // Track if pointer has ever entered temp bar fill area
    shouldShowHand4: false, // Initially don't show hand-4
    hand4AnimationTrigger: 0, // No hand-4 animation initially
    hasReachedComfort80: false, // Track if comfort has reached 80%
    minusButtonAnimationActive: false, // Initially minus button animation is not active
    isAddButtonDisabled: false, // Initially add button is not disabled
    isMinusButtonDisabled: false, // Initially minus button is not disabled
    hasReachedFillMiddleFromRight: false, // Track if pointer reached fill middle from 90% position
    shouldShowSparklers: false, // Initially don't show sparklers
    sparkler1AnimationTrigger: 0, // No sparkler-1 animation initially
    sparkler2AnimationTrigger: 0, // No sparkler-2 animation initially
    sparkler3AnimationTrigger: 0, // No sparkler-3 animation initially
    hasTriggeredSparklers: false, // Track if sparklers have been triggered
    shouldShowHand5: false, // Initially don't show hand-5
    hand5AnimationTrigger: 0, // No hand-5 animation initially
    tapIconRotation: 0, // Initial rotation angle
    tapIconAnimationTrigger: 0, // No tap icon animation initially
  });

  // Stop auto-decrease after 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        isAutoDecreaseActive: false,
      }));
    }, 1000); // Stop after 1 second

    return () => clearTimeout(timer);
  }, []);

  // Smooth auto-decrease temperature pointer - every 40ms decrease by 0.6%
  // This equals 15% per second (0.6% × 25 times per second = 15%/sec)
  // Only active when isAutoDecreaseActive is true
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
    }, 40); // 40ms intervals for smooth animation

    return () => clearInterval(interval);
  }, [gameState.isAutoDecreaseActive]);

  // Check if temperature pointer is in temp bar fill area and handle button locking
  useEffect(() => {
    const isInRange = gameState.tempPointer >= gameState.tempBarFill.start && 
                     gameState.tempPointer <= gameState.tempBarFill.end;
    
    // Calculate middle position of temp bar fill (70% is the middle of 60%-80%)
    const fillMiddle = (gameState.tempBarFill.start + gameState.tempBarFill.end) / 2; // 70%
    
    // Update isInTempBarFill state based on current position
    if (isInRange && !gameState.isInTempBarFill) {
      setGameState(prev => ({
        ...prev,
        isInTempBarFill: true,
        // Only show hand-3 and trigger animation if we haven't reached 80% comfort yet
        shouldShowHand3: !prev.hasReachedComfort80,
        hand3AnimationTrigger: !prev.hasReachedComfort80 ? prev.hand3AnimationTrigger + 1 : prev.hand3AnimationTrigger,
        hasEnteredTempBarFill: true, // Mark that pointer has entered the area
      }));
    }
    // If pointer leaves the fill area
    else if (!isInRange && gameState.isInTempBarFill) {
      setGameState(prev => ({
        ...prev,
        isInTempBarFill: false,
        isAddButtonDisabled: false, // Re-enable add button when leaving the area
        isMinusButtonDisabled: false, // Re-enable minus button when leaving the area
        // Hide all hand gestures when leaving the area
        shouldShowHand4: false,
        shouldShowHand5: false,
      }));
    }
    
    // Check if pointer has reached the middle position from left side (first phase)
    if (isInRange && gameState.tempPointer >= fillMiddle && !gameState.isAddButtonDisabled && !gameState.hasReachedComfort80) {
      setGameState(prev => ({
        ...prev,
        isAddButtonDisabled: true, // Disable add button when reaching middle position from left
      }));
    }
    
    // Check if pointer has reached the middle position from right side (after 90% reset)
    if (isInRange && gameState.tempPointer <= fillMiddle && gameState.hasReachedComfort80 && !gameState.hasReachedFillMiddleFromRight) {
      setGameState(prev => ({
        ...prev,
        isMinusButtonDisabled: true, // Disable minus button when reaching middle position from right
        hasReachedFillMiddleFromRight: true, // Mark that we've reached middle from right side
        // Hide hand-4 and show hand-5 when reaching middle from right
        shouldShowHand4: false,
        shouldShowHand5: true,
        hand5AnimationTrigger: prev.hand5AnimationTrigger + 1,
      }));
    }
  }, [gameState.tempPointer, gameState.tempBarFill, gameState.isInTempBarFill, gameState.hasReachedComfort80, gameState.isAddButtonDisabled, gameState.hasReachedFillMiddleFromRight]);

  // Check if comfort progress reaches 80% and trigger state reset
  useEffect(() => {
    if (gameState.comfortProgress >= 80 && !gameState.hasReachedComfort80) {
      setGameState(prev => ({
        ...prev,
        // Reset comfort to 50% (orange)
        comfortProgress: 50,
        // Move temperature pointer to 90%
        tempPointer: 90,
        // Hide hand-3, show hand-4
        shouldShowHand3: false,
        shouldShowHand4: true,
        hand4AnimationTrigger: prev.hand4AnimationTrigger + 1,
        // Mark that we've reached 80%
        hasReachedComfort80: true,
        // Stop add button animation, start minus button animation
        minusButtonAnimationActive: true,
        // Reset temp bar fill state
        isInTempBarFill: false,
        // Re-enable add button for the new phase
        isAddButtonDisabled: false,
        // Reset minus button state for new phase
        isMinusButtonDisabled: false,
        hasReachedFillMiddleFromRight: false,
        // Reset hand-5 state for new phase
        shouldShowHand5: false,
      }));
    }
  }, [gameState.comfortProgress, gameState.hasReachedComfort80]);

  // Check if comfort progress reaches 100% (green) and trigger sparklers
  useEffect(() => {
    if (gameState.comfortProgress >= 100 && gameState.hasReachedComfort80 && !gameState.hasTriggeredSparklers) {
      setGameState(prev => ({
        ...prev,
        shouldShowSparklers: true,
        hasTriggeredSparklers: true, // Prevent multiple triggers
      }));

      // Trigger sparkler animations in sequence
      // Sparkler 1: Start immediately
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          sparkler1AnimationTrigger: prev.sparkler1AnimationTrigger + 1,
        }));
      }, 0);

      // Sparkler 2: Start after sparkler 1 animation (0.6s) + 0.2s delay = 0.8s
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          sparkler2AnimationTrigger: prev.sparkler2AnimationTrigger + 1,
        }));
      }, 800);

      // Sparkler 3: Start after sparkler 2 animation (0.6s) + 0.2s delay = 0.8s from sparkler 2 = 1.6s total
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          sparkler3AnimationTrigger: prev.sparkler3AnimationTrigger + 1,
        }));
      }, 1600);
    }
  }, [gameState.comfortProgress, gameState.hasReachedComfort80, gameState.hasTriggeredSparklers]);

  // Smooth update comfort progress - every 80ms change by 1.2%
  // This equals 15% per second (1.2% × 12.5 times per second = 15%/sec)
  // Active when isAutoDecreaseActive is true OR when pointer is in temp bar fill
  useEffect(() => {
    if (!gameState.isAutoDecreaseActive && !gameState.isInTempBarFill) return;

    const interval = setInterval(() => {
      setGameState(prev => {
        // If auto-decrease is active, use original logic
        if (prev.isAutoDecreaseActive) {
          const isInRange = prev.tempPointer >= prev.tempBarFill.start && 
                           prev.tempPointer <= prev.tempBarFill.end;
          
          let newComfortProgress;
          if (isInRange) {
            // Increase comfort by 1.2% per 80ms, max 100%
            newComfortProgress = Math.min(100, prev.comfortProgress + 1.2);
          } else {
            // Decrease comfort by 1.2% per 80ms, min 0%
            newComfortProgress = Math.max(0, prev.comfortProgress - 1.2);
          }

          return {
            ...prev,
            comfortProgress: newComfortProgress,
          };
        }
        // If pointer is in temp bar fill area, increase comfort
        else if (prev.isInTempBarFill) {
          let newComfortProgress;
          
          // If we haven't reached 80% comfort yet, increase to 80%
          if (!prev.hasReachedComfort80) {
            const targetProgress = 80; // Target 80% of comfort bar
            if (prev.comfortProgress < targetProgress) {
              // Increase comfort by 1.2% per 80ms until reaching 80%
              newComfortProgress = Math.min(targetProgress, prev.comfortProgress + 1.2);
            } else {
              // Stay at current level if already at or above 80%
              newComfortProgress = prev.comfortProgress;
            }
          }
          // If we've already reached 80% and reset, increase from current position
          else {
            // Continue increasing comfort from the reset position (50%)
            newComfortProgress = Math.min(100, prev.comfortProgress + 1.2);
          }

          return {
            ...prev,
            comfortProgress: newComfortProgress,
          };
        }
        
        return prev;
      });
    }, 80); // 80ms intervals for smooth animation

    return () => clearInterval(interval);
  }, [gameState.isAutoDecreaseActive, gameState.isInTempBarFill, gameState.hasReachedComfort80]);

  const updateTempPointer = useCallback((newTemp: number) => {
    // Clamp between 0 and 100
    const clampedTemp = Math.max(0, Math.min(100, newTemp));
    setGameState(prev => ({
      ...prev,
      tempPointer: clampedTemp,
    }));
  }, []);

  const handleAddButtonClick = useCallback(() => {
    // Don't allow add button to work if it's disabled
    if (gameState.isAddButtonDisabled) {
      return;
    }
    
    setGameState(prev => ({
      ...prev,
      hasClickedAdd: true,
      // Trigger hand animation again when first clicking add button
      handAnimationTrigger: prev.hasClickedAdd ? prev.handAnimationTrigger : prev.handAnimationTrigger + 1,
      // Trigger tap icon rotation to the right (90 degrees)
      tapIconRotation: prev.tapIconRotation + 90,
      tapIconAnimationTrigger: prev.tapIconAnimationTrigger + 1,
    }));
  }, [gameState.isAddButtonDisabled]);

  const handleMinusButtonClick = useCallback(() => {
    // Don't allow minus button to work if it's disabled
    if (gameState.isMinusButtonDisabled) {
      return;
    }
    
    setGameState(prev => ({
      ...prev,
      // Trigger tap icon rotation to the left (-90 degrees)
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