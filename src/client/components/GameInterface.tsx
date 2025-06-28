/**
 * 主游戏界面组件 (基于Figma设计图重构)
 * 724x584像素的像素艺术风格游戏界面
 * 
 * @author 开发者B - UI/UX 界面负责人
 */

import React, { useState, useEffect } from 'react';
import { GameConfig } from '../types/GameTypes';
import { useGameState } from '../hooks/useGameState';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { LeaderboardModal } from './LeaderboardModal';
import { StartGameScreen } from './StartGameScreen';
import { GameCompletionScreen } from './GameCompletionScreen';
import { GameLaunchScreen } from './GameLaunchScreen';

// 游戏配置
const GAME_CONFIG: GameConfig = {
  TEMPERATURE_CHANGE_RATE: 0.5,
  TEMPERATURE_COOLING_RATE: 0.3,
  COMFORT_CHANGE_RATE: 0.2,
  GAME_DURATION: 30,
  SUCCESS_HOLD_TIME: 5,
  INITIAL_TEMPERATURE: 0.5,
  TARGET_TEMPERATURE_MIN: 0.3,
  TARGET_TEMPERATURE_MAX: 0.7,
  TOLERANCE_WIDTH: 0.1,
  INTERFERENCE_MIN_INTERVAL: 3,
  INTERFERENCE_MAX_INTERVAL: 5,
  INTERFERENCE_DURATION: 8,
};

// 玩家信息接口
interface PlayerInfo {
  playerName: string;
  continentId: string;
  catAvatarId: string;
}

// 像素艺术风格的游戏主界面组件
const PixelGameInterface: React.FC<{ 
  gameState: any; 
  currentRound: number;
  playerInfo: PlayerInfo;
  onPlusPress: () => void;
  onPlusRelease: () => void;
  onMinusPress: () => void;
  onMinusRelease: () => void;
  onCenterButtonClick: () => void;
  onBackToStart: () => void;
}> = ({ 
  gameState, 
  currentRound, 
  playerInfo,
  onPlusPress, 
  onPlusRelease, 
  onMinusPress, 
  onMinusRelease, 
  onCenterButtonClick,
  onBackToStart 
}) => {
  
  // 猫咪翻转状态
  const [catFlipped, setCatFlipped] = useState(false);
  
  // 音乐状态
  const [isMusicOn, setIsMusicOn] = useState(true);
  
  // 时间格式化
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 猫咪自动翻转效果
  useEffect(() => {
    const flipInterval = setInterval(() => {
      setCatFlipped(prev => !prev);
    }, 3000 + Math.random() * 3000); // 3-6秒随机间隔

    return () => clearInterval(flipInterval);
  }, []);

  // 音乐按钮处理
  const handleMusicToggle = () => {
    setIsMusicOn(prev => !prev);
    // 这里可以添加实际的音乐控制逻辑
  };

  return (
    <div className="w-[724px] h-[584px] bg-[#2f2f2f] relative">
      {/* 背景图像 - 像素艺术天空 */}
      <div className="absolute inset-0 bg-[url(/background.png)] bg-cover bg-center" />
      
      {/* 中央角色 - 洗澡猫咪 (120x120px, 居中偏下) */}
      <div className="absolute w-[120px] h-[120px] left-[302px] top-[232px]">
        <img
          className={`w-full h-full object-cover ${catFlipped ? 'scale-x-[-1]' : ''}`}
          alt="Cat in shower"
          src="/cat-shower.png"
          onError={(e) => {
            // 如果专用图片不存在，使用现有的猫咪图片
            const target = e.target as HTMLImageElement;
            target.src = "/Cat_1.png";
          }}
        />
      </div>

      {/* 舒适度进度条 (顶部, 628x24px) */}
      <div className="absolute left-[48px] top-[108px] w-[628px] h-[24px]">
        <div className="w-full h-full bg-[#d9d9d9] border-4 border-[#3a3656]">
          <div 
            className="h-full bg-[#5ff367] transition-all duration-200"
            style={{ width: `${Math.max(0, Math.min(100, gameState.currentComfort * 100))}%` }}
          />
        </div>
      </div>

      {/* 温度进度条系统 (628x78px) */}
      <div className="absolute left-[48px] top-[136px] w-[628px] h-[78px]">
        {/* 温度条背景 */}
        <div className="absolute top-[9px] w-[628px] h-[24px] bg-[#d9d9d9] border-4 border-[#3a3656]">
          {/* 温度容忍带 (橙色区域) - 可以覆盖全宽度 */}
          <div
            className="absolute top-0 h-full bg-[#ff9500] opacity-60"
            style={{
              left: `${Math.max(0, (gameState.targetTemperature - gameState.toleranceWidth) * 100)}%`,
              width: `${Math.min(100, (gameState.toleranceWidth * 2) * 100)}%`,
            }}
          />
          
          {/* 温度填充 (蓝色) - 可以覆盖全宽度 */}
          <div 
            className="h-full bg-[#728cff] transition-all duration-100"
            style={{ width: `${Math.max(0, Math.min(100, gameState.currentTemperature * 100))}%` }}
          />
        </div>

        {/* 温度指针 (16x40px) - 可以移动到整个温度条 */}
        <div
          className="absolute w-[16px] h-[40px] bg-[#f8cb56] border-[#3a3656] border-[5px] transition-all duration-100"
          style={{
            left: `${(gameState.currentTemperature * 612) - 8}px`, // 612 = 628 - 16 (指针宽度)
            top: '0px',
          }}
        />

        {/* 目标温度显示 - 跟随温度容忍带中心位置 */}
        <div 
          className="absolute top-[40px] transform -translate-x-1/2 silkscreen-text"
          style={{
            left: `${gameState.targetTemperature * 628}px`, // 跟随目标温度位置，覆盖全宽度
            color: '#F0BC08',
            textAlign: 'center',
            fontFamily: 'Silkscreen, monospace',
            fontSize: '18px',
            fontStyle: 'normal',
            fontWeight: '700',
            lineHeight: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // 强制字体渲染优化
            textRendering: 'optimizeLegibility',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          }}
        >
          {Math.round(gameState.targetTemperature * 40 + 20)}°C
        </div>
      </div>

      {/* 控制按钮 - 左侧按钮 (56x56px) - 根据controls_reversed切换功能和图片 */}
      <button
        className="absolute left-[84px] top-[460px] w-[56px] h-[56px] transition-all duration-100 hover:scale-105 active:scale-95"
        onMouseDown={gameState.controlsReversed ? onPlusPress : onMinusPress}
        onMouseUp={gameState.controlsReversed ? onPlusRelease : onMinusRelease}
        onMouseLeave={gameState.controlsReversed ? onPlusRelease : onMinusRelease}
        disabled={gameState.gameStatus !== 'playing'}
      >
        <img
          className="w-full h-full object-cover"
          alt={gameState.controlsReversed ? "Temperature plus" : "Temperature minus"}
          src={gameState.controlsReversed ? "/button-temp-plus.png" : "/button-temp-minus.png"}
        />
      </button>

      {/* 控制按钮 - 右侧按钮 (56x56px) - 根据controls_reversed切换功能和图片 */}
      <button
        className="absolute left-[584px] top-[460px] w-[56px] h-[56px] transition-all duration-100 hover:scale-105 active:scale-95"
        onMouseDown={gameState.controlsReversed ? onMinusPress : onPlusPress}
        onMouseUp={gameState.controlsReversed ? onMinusRelease : onPlusRelease}
        onMouseLeave={gameState.controlsReversed ? onMinusRelease : onPlusRelease}
        disabled={gameState.gameStatus !== 'playing'}
      >
        <img
          className="w-full h-full object-cover"
          alt={gameState.controlsReversed ? "Temperature minus" : "Temperature plus"}
          src={gameState.controlsReversed ? "/button-temp-minus.png" : "/button-temp-plus.png"}
        />
      </button>

      {/* 中央水龙头按钮 (80x80px) */}
      <button
        className="absolute left-[322px] top-[448px] w-[80px] h-[80px] transition-all duration-200 hover:scale-105 active:scale-95"
        onClick={onCenterButtonClick}
        disabled={gameState.gameStatus !== 'playing'}
      >
        <img
          className="w-full h-full object-cover"
          alt="Center tap button"
          src="/button-center-interaction.png"
        />
      </button>

      {/* 计时器 (左上角) */}
      <div className="absolute left-[275px] top-[36px] flex items-center gap-2">
        {/* 时钟图标 (32x32px) */}
        <img
          className="w-[32px] h-[32px]"
          alt="Clock"
          src="/clock-icon.png"
          onError={(e) => {
            // 如果图片不存在，隐藏
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
        
        {/* 时间文字 */}
        <div 
          className="text-white font-bold silkscreen-text"
          style={{
            color: '#FFF',
            fontFamily: 'Silkscreen, monospace',
            fontSize: '28px',
            fontStyle: 'normal',
            fontWeight: '700',
            lineHeight: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // 字体渲染优化
            textRendering: 'optimizeLegibility',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          }}
        >
          {formatTime(gameState.gameTimer)}
        </div>
      </div>

      {/* 音乐按钮 (右上角, 80x36px) */}
      <button 
        className="absolute left-[620px] top-[24px] w-[80px] h-[36px] transition-all duration-200 hover:scale-105"
        onClick={handleMusicToggle}
      >
        <img
          className="w-full h-full object-cover"
          alt={isMusicOn ? "Music on" : "Music off"}
          src={isMusicOn ? "/Button_Music_On.png" : "/Button_Music_Off.png"}
        />
      </button>

      {/* 状态图标 - 左侧失败图标 (28x28px) */}
      <div className="absolute left-[48px] top-[72px] w-[28px] h-[28px]">
        <img
          className={`w-full h-full transition-opacity duration-300 ${gameState.currentComfort <= 0.2 ? 'opacity-100' : 'opacity-30'}`}
          alt="Comfort fail"
          src="/avatar-bad.png"
        />
      </div>

      {/* 状态图标 - 右侧成功图标 (28x28px) */}
      <div className="absolute left-[648px] top-[72px] w-[28px] h-[28px]">
        <img
          className={`w-full h-full transition-opacity duration-300 ${gameState.currentComfort >= 0.8 ? 'opacity-100' : 'opacity-30'}`}
          alt="Comfort success"
          src="/avatar-yellowsmiley.png"
        />
      </div>




      {/* 干扰事件指示器 */}
      {gameState.interferenceEvent?.isActive && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-600 bg-opacity-90 text-white p-4 rounded-lg text-center">
          <div className="text-lg font-bold mb-2">⚡ INTERFERENCE ⚡</div>
          <div className="text-sm">
            {gameState.interferenceEvent.type === 'controls_reversed' && '🤡 Controls Reversed!'}
            {gameState.interferenceEvent.type === 'temperature_shock' && '🥶 Temperature Shock!'}
            {gameState.interferenceEvent.type === 'bubble_obstruction' && '🫧 Bubble Obstruction!'}
          </div>
        </div>
      )}

      {/* 泡泡效果 - 仅在Bubble Obstruction时显示 */}
      {gameState.interferenceEvent?.isActive && gameState.interferenceEvent.type === 'bubble_obstruction' && (
        <>
          {/* 大型泡泡覆盖整个界面，但避开控制按钮区域 */}
          {[
            // 上半部分泡泡
            { left: 50, top: 50, size: 80 },
            { left: 200, top: 30, size: 120 },
            { left: 400, top: 80, size: 100 },
            { left: 550, top: 40, size: 90 },
            { left: 150, top: 150, size: 110 },
            { left: 450, top: 180, size: 95 },
            { left: 600, top: 120, size: 85 },
            
            // 中间部分泡泡（避开猫咪区域）
            { left: 100, top: 280, size: 70 },
            { left: 500, top: 300, size: 75 },
            { left: 30, top: 350, size: 65 },
            { left: 600, top: 320, size: 80 },
            
            // 下半部分泡泡（避开控制按钮）
            { left: 200, top: 500, size: 60 },
            { left: 400, top: 520, size: 70 },
            { left: 50, top: 480, size: 55 },
            { left: 600, top: 490, size: 65 },
          ].map((bubble, index) => (
            <div
              key={index}
              className="absolute rounded-full opacity-60"
              style={{
                width: `${bubble.size}px`,
                height: `${bubble.size}px`,
                left: `${bubble.left}px`,
                top: `${bubble.top}px`,
                background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(173,216,230,0.7))`,
                border: '3px solid rgba(135,206,235,0.6)',
                boxShadow: 'inset 0 0 20px rgba(255,255,255,0.4), 0 0 10px rgba(173,216,230,0.3)',
                animation: `bubble-float-${index % 3} 3s ease-out forwards`,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};

export const GameInterface: React.FC = () => {
  // 界面控制状态 - 添加启动页面状态
  const [showLaunchScreen, setShowLaunchScreen] = useState(true);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);
  
  // 游戏状态
  const {
    gameState,
    currentRound,
    handlePlusPress,
    handlePlusRelease,
    handleMinusPress,
    handleMinusRelease,
    handleCenterButtonClick,
    resetGame,
  } = useGameState(GAME_CONFIG);

  // 排行榜状态
  const {
    playerBest,
    submitScore,
    fetchPlayerBest,
  } = useLeaderboard();

  // UI 状态
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showGameCompletion, setShowGameCompletion] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number>(Date.now());
  const [totalGameTime, setTotalGameTime] = useState<number>(0);
  
  // 用户国家代码 (在实际应用中，这应该从用户数据或地理位置API获取)
  const [userCountryCode] = useState<string>('US'); // 默认美国，可以根据需要修改

  // 处理开始游戏
  const handleStartGame = (newPlayerInfo: PlayerInfo) => {
    setPlayerInfo(newPlayerInfo);
    setIsGameStarted(true);
    setShowGameCompletion(false); // 确保重置游戏完成状态
    setGameStartTime(Date.now());
    resetGame(); // 重置游戏状态
  };

  // 处理从启动页面进入游戏设置
  const handleStartFromLaunch = () => {
    setShowLaunchScreen(false);
  };

  // 处理返回开始界面
  const handleBackToStart = () => {
    setShowLaunchScreen(true);
    setIsGameStarted(false);
    setPlayerInfo(null);
    setShowGameCompletion(false);
    resetGame();
  };

  // 当游戏开始时记录开始时间
  useEffect(() => {
    if (gameState.gameStatus === 'playing' && currentRound === 1 && isGameStarted) {
      setGameStartTime(Date.now());
    }
  }, [gameState.gameStatus, currentRound, isGameStarted]);

  // 当游戏结束时计算总时间并显示游戏结算界面
  useEffect(() => {
    if (gameState.gameStatus === 'success' || gameState.gameStatus === 'failure') {
      const endTime = Date.now();
      const totalTime = Math.round((endTime - gameStartTime) / 1000);
      setTotalGameTime(totalTime);

      // 自动提交分数到排行榜
      if (playerInfo && (currentRound > 1 || gameState.gameStatus === 'success')) {
        handleAutoScoreSubmit(totalTime);
      }

      // 延迟一小段时间显示游戏结算界面，避免立即跳转
      setTimeout(() => {
      setShowGameCompletion(true);
      }, 1000);
    }
  }, [gameState.gameStatus, gameStartTime, currentRound, playerInfo]);

  // 初始化时获取玩家最佳成绩
  useEffect(() => {
    if (isGameStarted) {
    fetchPlayerBest();
    }
  }, [fetchPlayerBest, isGameStarted]);

  // 处理自动分数提交
  const handleAutoScoreSubmit = async (totalTime: number) => {
    if (!playerInfo) return;

    try {
      // 获取坚持时长（从gameTimer获取）
      const enduranceDuration = Math.floor(gameState.gameTimer);
      
      const result = await submitScore(
        playerInfo.playerName, 
        enduranceDuration, // 坚持时长
        playerInfo.catAvatarId,
        playerInfo.continentId,
        // 可选参数
        0, // roundsCompleted
        totalTime || 0, // totalTime
        'medium', // difficulty
        userCountryCode || 'US' // countryCode
      );
      
      // 提交成功后刷新玩家最佳成绩
      await fetchPlayerBest();
      
      console.log('Score auto-submitted:', result);
    } catch (error) {
      console.error('Error auto-submitting score:', error);
    }
  };

  // 如果显示启动页面，显示游戏启动界面
  if (showLaunchScreen) {
    return <GameLaunchScreen onStartGame={handleStartFromLaunch} />;
  }

  // 如果游戏未开始，显示开始游戏界面
  if (!isGameStarted) {
    return <StartGameScreen onStartGame={handleStartGame} onBackToLaunch={handleBackToStart} />;
  }

  // 如果游戏结束，显示游戏结算界面
  if (showGameCompletion && playerInfo) {
    return (
      <GameCompletionScreen
        onPlayAgain={() => {
          setShowGameCompletion(false);
          resetGame();
        }}
        onBackToStart={handleBackToStart}
        gameStats={{
          roundsCompleted: gameState.gameStatus === 'success' ? currentRound : currentRound - 1,
          totalTime: totalGameTime,
          finalComfort: gameState.currentComfort
        }}
        playerInfo={playerInfo}
      />
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      {/* 像素艺术风格游戏界面 */}
      {playerInfo && (
        <PixelGameInterface
          gameState={gameState}
          currentRound={currentRound}
          playerInfo={playerInfo}
          onPlusPress={handlePlusPress}
          onPlusRelease={handlePlusRelease}
          onMinusPress={handleMinusPress}
          onMinusRelease={handleMinusRelease}
          onCenterButtonClick={handleCenterButtonClick}
          onBackToStart={handleBackToStart}
        />
      )}

      {/* 排行榜模态框 */}
       {showLeaderboard && playerBest && (
      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
           currentPlayerScore={{
             score: playerBest.totalTime,
             rank: 0,
          roundsCompleted: playerBest.roundsCompleted,
          compositeScore: playerBest.compositeScore
           }}
        userCountryCode={userCountryCode}
      />
       )}
    </div>
  );
};