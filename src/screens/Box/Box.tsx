import React from "react";
import { Card, CardContent } from "../../components/ui/card";
import { useGameState } from "../../hooks/useGameState";
import { GameOverlay } from "../../components/GameOverlay";
import { ProgressBar } from "../../components/ProgressBar";
import { InterferenceOverlay } from "../../components/InterferenceOverlay";

export const Box = (): JSX.Element => {
  const { gameState, currentRound, handlers, config } = useGameState();

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine which avatar to show based on comfort level
  const getCurrentAvatar = () => {
    if (gameState.currentComfort >= 0.8) {
      return "/avatar-yellowsmiley.png"; // Happy cat
    } else if (gameState.currentComfort <= 0.3) {
      return "/avatar-bad.png"; // Unhappy cat
    } else {
      return "/avatar-yellowsmiley.png"; // Neutral/default
    }
  };

  return (
    <div className="w-[390px] h-[844px] relative">
      <Card className="fixed w-[390px] h-[844px] top-0 left-0 border-0">
        <CardContent className="p-0 h-[844px] bg-white">
          <div className="relative w-[390px] h-[844px] bg-[url(/background.png)] bg-cover bg-[50%_50%]">
            
            {/* Timer Display - Replacing the vertical bar */}
            <div className="absolute top-[320px] left-[25px] flex flex-col items-center">
              {/* Round indicator */}
              <div className="bg-[#36417E] text-white px-3 py-1 rounded-lg mb-2 text-sm font-bold">
                Round {currentRound}
              </div>
              
              {/* Timer display */}
              <div 
                className="bg-[#36417E] text-white px-4 py-3 rounded-lg text-center shadow-lg"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '24px',
                  fontWeight: '700',
                  minWidth: '80px'
                }}
              >
                {formatTime(gameState.gameTimer)}
              </div>
              
              {/* Next round preview */}
              {gameState.gameStatus === 'playing' && currentRound < 3 && (
                <div className="text-xs text-gray-600 mt-1 text-center">
                  Next: {Math.max(10, 30 - (currentRound * 10))}s
                </div>
              )}
            </div>

            {/* Avatar_Bad - Left side position */}
            <img
              className="absolute object-cover transition-all duration-300"
              alt="Bad cat avatar"
              src="/avatar-bad.png"
              style={{
                width: '35.5px',
                height: '36px',
                top: '131px',
                left: '25px'
              }}
            />

            {/* Avatar_YellowSmiley - Right side position */}
            <img
              className="absolute object-cover transition-all duration-300"
              alt="Happy cat avatar"
              src="/avatar-yellowsmiley.png"
              style={{
                width: '35.5px',
                height: '36px',
                top: '126px',
                left: '329px'
              }}
            />

            {/* Comfort Progress Bar - Custom styled */}
            <div 
              className="absolute"
              style={{
                top: '172px',
                left: '25px',
                width: '340px',
                height: '28px',
                border: '6px solid #36417E',
                background: '#D9D9D9',
                borderRadius: '4px'
              }}
            >
              <div className="relative w-full h-full overflow-hidden">
                <ProgressBar
                  value={gameState.currentComfort}
                  className="w-full h-full"
                  barColor="#5FF367"
                  backgroundColor="transparent"
                />
                
                {/* Success hold timer */}
                {gameState.currentComfort >= 1.0 && gameState.successHoldTimer > 0 && (
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                      Hold: {Math.ceil(config.SUCCESS_HOLD_TIME - gameState.successHoldTimer)}s
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Temperature Progress Bar - Custom styled */}
            <div 
              className="absolute"
              style={{
                top: '218px',
                left: '25px',
                width: '340px',
                height: '39px',
                border: '6px solid #36417E',
                background: '#D9D9D9',
                borderRadius: '4px'
              }}
            >
              <div className="relative w-full h-full overflow-hidden">
                <ProgressBar
                  value={gameState.currentTemperature}
                  className="w-full h-full"
                  barColor="#728CFF"
                  backgroundColor="transparent"
                />
                
                {/* Temperature Tolerance Band */}
                <div
                  className="absolute top-0 h-full opacity-60"
                  style={{
                    left: `${Math.max(0, (gameState.targetTemperature - gameState.toleranceWidth)) * 100}%`,
                    width: `${Math.min(100, (gameState.toleranceWidth * 2) * 100)}%`,
                    background: '#F99945',
                  }}
                />
                
                {/* Target temperature line */}
                <div
                  className="absolute top-0 w-1 h-full bg-red-600 z-10"
                  style={{
                    left: `${gameState.targetTemperature * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Target Temperature Display - Only number */}
            <div 
              className="absolute text-center"
              style={{
                top: '275px', // Below the temperature bar
                left: '25px',
                width: '340px',
                fontFamily: 'Elza Condensed Black, sans-serif',
                fontSize: '23px',
                letterSpacing: '-0.423px',
                color: '#36417E',
                fontWeight: '900'
              }}
            >
              {Math.round(gameState.targetTemperature * 100)}
            </div>

            {/* Temperature Pointer */}
            <div
              className="absolute transition-all duration-100 flex items-center justify-center z-20"
              style={{
                top: '209px',
                left: `${25 + (gameState.currentTemperature * 315)}px`, // 340px - 25px = 315px range
                width: '25px',
                height: '57px',
                border: '6px solid #36417E',
                background: '#F8CB56',
                borderRadius: '4px'
              }}
            />

            {/* Control buttons */}
            <button
              className={`absolute w-[63px] h-[62px] top-[692px] left-8 transition-all duration-100 hover:scale-105 active:scale-95 ${
                gameState.isControlsReversed ? 'ring-4 ring-purple-400 animate-pulse' : ''
              }`}
              onMouseDown={handlers.handleMinusPress}
              onMouseUp={handlers.handleMinusRelease}
              onMouseLeave={handlers.handleMinusRelease}
              onTouchStart={handlers.handleMinusPress}
              onTouchEnd={handlers.handleMinusRelease}
              disabled={gameState.gameStatus !== 'playing'}
            >
              <img
                className="w-full h-full object-cover"
                alt="Temperature minus"
                src="/button-temp-minus.png"
              />
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-2xl">
                {gameState.isControlsReversed ? '+' : '-'}
              </div>
            </button>

            {/* Center interaction button - visibility based on interference type */}
            <div className="absolute w-[111px] h-28 top-[667px] left-36">
              <button
                onClick={handlers.handleCenterButtonClick}
                className={`w-full h-full relative transition-all duration-200 ${
                  gameState.interferenceEvent.isActive && gameState.interferenceEvent.type !== 'controls_reversed'
                    ? 'hover:scale-105 active:scale-95 animate-pulse' 
                    : 'opacity-50 cursor-default'
                }`}
                disabled={!gameState.interferenceEvent.isActive || gameState.interferenceEvent.type === 'controls_reversed'}
              >
                <img
                  className="w-full h-full object-cover"
                  alt="Center interaction button"
                  src="/button-center-interaction.png"
                />
                {gameState.interferenceEvent.isActive && gameState.interferenceEvent.type !== 'controls_reversed' && (
                  <>
                    <div className="absolute inset-0 bg-yellow-400 bg-opacity-30 rounded-lg animate-ping" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold text-lg bg-black bg-opacity-50 px-2 py-1 rounded">
                        CLICK!
                      </span>
                    </div>
                  </>
                )}
              </button>
            </div>

            <button
              className={`absolute w-[71px] h-16 top-[691px] left-[296px] transition-all duration-100 hover:scale-105 active:scale-95 ${
                gameState.isControlsReversed ? 'ring-4 ring-purple-400 animate-pulse' : ''
              }`}
              onMouseDown={handlers.handlePlusPress}
              onMouseUp={handlers.handlePlusRelease}
              onMouseLeave={handlers.handlePlusRelease}
              onTouchStart={handlers.handlePlusPress}
              onTouchEnd={handlers.handlePlusRelease}
              disabled={gameState.gameStatus !== 'playing'}
            >
              <img
                className="w-full h-full object-cover"
                alt="Temperature plus"
                src="/button-temp-plus.png"
              />
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-2xl">
                {gameState.isControlsReversed ? '-' : '+'}
              </div>
            </button>

            {/* Game status indicators */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-sm">
              <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                Temp: {Math.round(gameState.currentTemperature * 100)}%
              </div>
              <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                Target: {Math.round(gameState.targetTemperature * 100)}%
              </div>
            </div>

            {/* Interference system overlay */}
            <InterferenceOverlay
              interferenceEvent={gameState.interferenceEvent}
              onCenterButtonClick={handlers.handleCenterButtonClick}
              isControlsReversed={gameState.isControlsReversed}
            />
          </div>
        </CardContent>
      </Card>

      {/* Game Over Overlay */}
      <GameOverlay 
        gameState={gameState} 
        currentRound={currentRound}
        onRestart={handlers.resetGame}
        onNextRound={handlers.startNextRound}
      />
    </div>
  );
};