/**
 * 主游戏界面组件 (V2 - 新机制)
 * 724x584像素的像素艺术风格游戏界面
 * 
 * @author 开发者B - UI/UX 界面负责人 & Gemini
 */

import React, { useState, useEffect } from 'react';
import { GameConfig } from '../types/GameTypes';
import { useGameState } from '../hooks/useGameState';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useResponsiveScale, useResponsiveSize } from '../hooks/useResponsiveScale';

import { StartGameScreen } from './StartGameScreen';
import { GameCompletionScreen } from './GameCompletionScreen';
import { GameLaunchScreen } from './GameLaunchScreen';
import { TutorialScreen } from './TutorialScreen';

// 游戏配置 (部分值现在由GameStateManager内部处理)
const GAME_CONFIG: GameConfig = {
  TEMPERATURE_CHANGE_RATE: 0, // Unused
  TEMPERATURE_COOLING_RATE: 0, // Unused
  COMFORT_CHANGE_RATE: 0, // Unused
  GAME_DURATION: 0, // Endless
  SUCCESS_HOLD_TIME: 0, // Unused
  INITIAL_TEMPERATURE: 0.5,
  TARGET_TEMPERATURE_MIN: 0.4, // Represents comfort zone min
  TARGET_TEMPERATURE_MAX: 0.6, // Represents comfort zone max
  TOLERANCE_WIDTH: 0.1, // (MAX - MIN) / 2
  INTERFERENCE_MIN_INTERVAL: 5,
  INTERFERENCE_MAX_INTERVAL: 10,
  INTERFERENCE_DURATION: 5,
};

// 玩家信息接口
interface PlayerInfo {
  playerName: string;
  continentId: string;
  catAvatarId: string;
}

// 响应式像素艺术风格的游戏主界面组件
const PixelGameInterface: React.FC<{ 
  gameState: any; 
  playerInfo: PlayerInfo;
  onLeftButtonClick: () => void;
  onRightButtonClick: () => void;
  onCenterButtonClick: () => void;
  onBackToStart: () => void;
}> = ({ 
  gameState, 
  playerInfo,
  onLeftButtonClick, 
  onRightButtonClick, 
  onCenterButtonClick,
  onBackToStart 
}) => {
  
  const { cssVars } = useResponsiveScale();
  const { scale, scaleFont } = useResponsiveSize();
  const [catFlipped, setCatFlipped] = useState(false);
  const [isMusicOn, setIsMusicOn] = useState(true);

  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const getComfortBarColor = (comfort: number): string => {
    if (comfort > 0.75) return '#5FF367'; // Green
    if (comfort > 0.50) return '#FFDF2B'; // Yellow
    if (comfort > 0.25) return '#FE8E39'; // Orange
    return '#FE4339'; // Red
  };

  useEffect(() => {
    const flipInterval = setInterval(() => setCatFlipped(prev => !prev), 3000 + Math.random() * 3000);
    return () => clearInterval(flipInterval);
  }, []);

  const handleMusicToggle = () => setIsMusicOn(prev => !prev);

  // 干扰事件类型到图片文件名的映射
  const getInterferenceImageSrc = (interferenceType: string): string => {
    const interferenceImageMap: { [key: string]: string } = {
      'bubble_time': '/Bubble_Time!.png',
      'cold_wind': '/Cold_wind.png',
      'controls_reversed': '/Controls_reversed.png',
      'electric_leakage': '/Electric_leakage.png',
      'surprise_drop': '/Surprise_Drop!.png'
    };
    return interferenceImageMap[interferenceType] || '/Bubble_Time!.png';
  };

  return (
    <div 
      className="bg-[#2f2f2f] relative"
      style={{
        width: `${scale(724)}px`,
        height: `${scale(584)}px`,
        ...cssVars
      }}
    >
      <div className="absolute inset-0 bg-[url(/background.png)] bg-cover bg-center" />
      
      <div 
        className="absolute"
        style={{
          width: `${scale(120)}px`,
          height: `${scale(120)}px`,
          left: `${scale(302)}px`,
          top: `${scale(232)}px`
        }}
      >
        <img
          className={`w-full h-full object-cover ${catFlipped ? 'scale-x-[-1]' : ''}`}
          alt="Cat in shower"
          src={`/Cat_${playerInfo.catAvatarId}.png`}
        />
      </div>

      {/* Comfort Bar (New Color Logic) */}
      <div 
        className="absolute bg-[#d9d9d9] border-[#3a3656]"
        style={{
          left: `${scale(48)}px`,
          top: `${scale(108)}px`,
          width: `${scale(628)}px`,
          height: `${scale(24)}px`,
          borderWidth: `${scale(4)}px`
        }}
      >
        <div 
          className="h-full transition-all duration-500 ease-linear"
          style={{ 
            width: `${Math.max(0, Math.min(100, gameState.currentComfort * 100))}%`,
            backgroundColor: getComfortBarColor(gameState.currentComfort)
          }}
        />
      </div>

      {/* Temperature Bar System (New UI) */}
      <div 
        className="absolute"
        style={{
          left: `${scale(48)}px`,
          top: `${scale(136)}px`,
          width: `${scale(628)}px`,
          height: `${scale(78)}px`
        }}
      >
        {/* Temperature Bar Background */}
        <div 
          className="absolute bg-[#d9d9d9] border-[#3a3656]"
          style={{
            top: `${scale(9)}px`,
            width: `${scale(628)}px`,
            height: `${scale(24)}px`,
            borderWidth: `${scale(4)}px`
          }}
        >
          {/* Dynamic Comfort Zone (based on targetTemperature ± toleranceWidth) */}
          <div
            className="absolute top-0 flex-shrink-0"
            style={{
              left: `${scale(48 + gameState.targetTemperature * 628 - 63)}px`,
              top: `${scale(13)}px`,
              width: `${scale(126)}px`,
              height: `${scale(16)}px`,
              backgroundColor: '#728CFF',
            }}
          />
        </div>

        {/* Target Temperature Display */}
        <div
          className="absolute flex items-center justify-center silkscreen-bold"
          style={{
            width: `${scale(65)}px`,
            height: `${scale(38)}px`,
            top: `${scale(45)}px`,
            left: `${scale(48 + gameState.targetTemperature * 628 - 32.5)}px`,
            color: '#F0BC08',
            textAlign: 'center',
            WebkitTextStroke: `${scale(1)}px #3A368E`,
            fontFamily: 'Silkscreen',
            fontSize: `${scale(19)}px`,
            fontWeight: 700,
            lineHeight: `${scale(38)}px`,
          }}
        >
          {(gameState.targetTemperature * 100).toFixed(0)}°
        </div>

        {/* Temperature Pointer */}
        <div
          className="absolute transition-all duration-100 ease-linear"
          style={{
            width: `${scale(16)}px`,
            height: `${scale(40)}px`,
            top: '0px',
            borderWidth: `${scale(5)}px`,
            borderColor: '#3a3656',
            backgroundColor: '#f8cb56',
            left: `calc(${gameState.currentTemperature * 100}% - ${scale(8)}px)`,
          }}
        />
      </div>

      {/* Control Buttons (onClick, new handlers, but keep visual swap) */}
      <button
        className="absolute transition-all duration-100 hover:scale-105 active:scale-95"
        style={{ left: `${scale(84)}px`, top: `${scale(460)}px`, width: `${scale(56)}px`, height: `${scale(56)}px` }}
        onClick={onLeftButtonClick}
        disabled={gameState.gameStatus !== 'playing'}
      >
        <img
          className="w-full h-full object-cover"
          alt={gameState.isControlsReversed ? "Increase temperature" : "Decrease temperature"}
          src={gameState.isControlsReversed ? "/button-temp-plus.png" : "/button-temp-minus.png"}
        />
      </button>

      <button
        className="absolute transition-all duration-100 hover:scale-105 active:scale-95"
        style={{ left: `${scale(584)}px`, top: `${scale(460)}px`, width: `${scale(56)}px`, height: `${scale(56)}px` }}
        onClick={onRightButtonClick}
        disabled={gameState.gameStatus !== 'playing'}
      >
        <img
          className="w-full h-full object-cover"
          alt={gameState.isControlsReversed ? "Decrease temperature" : "Increase temperature"}
          src={gameState.isControlsReversed ? "/button-temp-minus.png" : "/button-temp-plus.png"}
        />
      </button>

      {/* Center Button */}
      <button
        className="absolute transition-all duration-200 hover:scale-105 active:scale-95"
        style={{ left: `${scale(322)}px`, top: `${scale(448)}px`, width: `${scale(80)}px`, height: `${scale(80)}px` }}
        onClick={onCenterButtonClick}
        disabled={gameState.gameStatus !== 'playing'}
      >
        <img 
          className="w-full h-full object-cover"
          alt="Center tap button" 
          src="/button-center-interaction.png" 
        />
      </button>

      {/* Timer (displays increasing time) */}
      <div 
        className="absolute flex items-center"
        style={{ left: `${scale(297)}px`, top: `${scale(72)}px`, gap: `${scale(6.2)}px` }}
      >
        <div style={{ width: `${scale(25)}px`, height: `${scale(25)}px` }}>
          <img 
            className="w-full h-full object-cover"
            alt="Clock icon" 
            src="/clock-icon.png" 
          />
        </div>
        <div 
          className="text-white font-bold silkscreen-bold"
          style={{
            color: '#FFF',
            fontSize: `${scale(21.778)}px`,
            WebkitTextStroke: `${scale(2.33)}px #3A368E`,
          }}
        >
          {formatTime(gameState.gameTimer)}
        </div>
      </div>

      {/* Music Button */}
      <button 
        className="absolute transition-all duration-200 hover:scale-105"
        style={{ left: `${scale(620)}px`, top: `${scale(24)}px`, width: `${scale(80)}px`, height: `${scale(36)}px` }}
        onClick={handleMusicToggle}
      >
        <img 
          className="w-full h-full object-cover"
          alt={isMusicOn ? "Music on" : "Music off"} 
          src={isMusicOn ? "/Button_Music_On.png" : "/Button_Music_Off.png"} 
        />
      </button>

      {/* Status Icons */}
      <div style={{ left: `${scale(48)}px`, top: `${scale(72)}px`, width: `${scale(28)}px`, height: `${scale(28)}px`, position: 'absolute' }}>
        <img
          className={`w-full h-full transition-opacity duration-300 ${gameState.currentComfort <= 0.25 ? 'opacity-100' : 'opacity-30'}`}
          alt="Comfort fail"
          src="/avatar-bad.png"
        />
      </div>
      <div style={{ left: `${scale(648)}px`, top: `${scale(72)}px`, width: `${scale(28)}px`, height: `${scale(28)}px`, position: 'absolute' }}>
        <img
          className={`w-full h-full transition-opacity duration-300 ${gameState.currentComfort >= 0.75 ? 'opacity-100' : 'opacity-30'}`}
          alt="Comfort success"
          src="/avatar-yellowsmiley.png"
        />
      </div>

      {/* 干扰事件指示器 - Interference Event Indicator */}
      {gameState.interferenceEvent?.isActive && (
        <div 
          className="absolute"
          style={{
            top: `${scale(24)}px`,
            left: `${scale(156)}px`,
            width: `${scale(412)}px`,
            height: `${scale(35)}px`,
            flexShrink: 0,
            aspectRatio: '412/35'
          }}
        >
          <img
            className="w-full h-full object-contain"
            alt={`${gameState.interferenceEvent.type} interference event`}
            src={getInterferenceImageSrc(gameState.interferenceEvent.type)}
            onError={(e) => {
              console.error(`Failed to load interference image for type: ${gameState.interferenceEvent.type}`);
              // 如果图片加载失败，设置一个默认图片
              const target = e.target as HTMLImageElement;
              target.src = '/Bubble_Time!.png';
            }}
          />
        </div>
      )}
    </div>
  );
};

export const GameInterface: React.FC = () => {
  const [showLaunchScreen, setShowLaunchScreen] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);
  
  const {
    gameState,
    handleLeftButtonClick,
    handleRightButtonClick,
    handleCenterButtonClick,
    resetGame,
  } = useGameState(GAME_CONFIG);

  const { submitScore } = useLeaderboard();
  const [showGameCompletion, setShowGameCompletion] = useState(false);
  const [finalGameTime, setFinalGameTime] = useState<number>(0);
  const [userCountryCode] = useState<string>('US');

  const handleStartGame = (newPlayerInfo: PlayerInfo) => {
    setPlayerInfo(newPlayerInfo);
    setIsGameStarted(true);
    setShowGameCompletion(false);
    resetGame();
  };

  const handleStartFromLaunch = () => {
    setShowLaunchScreen(false);
    setShowTutorial(true);
  };

  const handleTutorialComplete = () => setShowTutorial(false);
  const handleTutorialSkip = () => setShowTutorial(false);

  const handleBackToStart = () => {
    setShowLaunchScreen(true);
    setIsGameStarted(false);
    setPlayerInfo(null);
    setShowGameCompletion(false);
    resetGame();
  };

  useEffect(() => {
    if (gameState.gameStatus === 'failure') {
      const score = Math.floor(gameState.gameTimer);
      setFinalGameTime(score);
      if (playerInfo) {
        submitScore(
          playerInfo.playerName,
          score,
          playerInfo.catAvatarId,
          playerInfo.continentId
        );
      }
      setTimeout(() => setShowGameCompletion(true), 1000);
    }
  }, [gameState.gameStatus, gameState.gameTimer, playerInfo, submitScore, userCountryCode]);

  if (showLaunchScreen) {
    return <GameLaunchScreen onStartGame={handleStartFromLaunch} />;
  }

  if (showTutorial) {
    return <TutorialScreen onSkip={handleTutorialSkip} onComplete={handleTutorialComplete} />;
  }

  if (!isGameStarted) {
    return <StartGameScreen onStartGame={handleStartGame} onBackToLaunch={handleBackToStart} />;
  }

  if (showGameCompletion && playerInfo) {
    return (
      <GameCompletionScreen
        onPlayAgain={() => {
          setShowGameCompletion(false);
          resetGame();
        }}
        onBackToStart={handleBackToStart}
        gameStats={{
          enduranceDuration: finalGameTime,
        }}
        playerInfo={playerInfo}
      />
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-800">
      {playerInfo && (
        <PixelGameInterface
          gameState={gameState}
          playerInfo={playerInfo}
          onLeftButtonClick={handleLeftButtonClick}
          onRightButtonClick={handleRightButtonClick}
          onCenterButtonClick={handleCenterButtonClick}
          onBackToStart={handleBackToStart}
        />
      )}
    </div>
  );
};