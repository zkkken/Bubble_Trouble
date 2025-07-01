/**
 * 主游戏界面组件 (V2 - 新机制)
 * 724x584像素的像素艺术风格游戏界面
 * 
 * @author 开发者B - UI/UX 界面负责人 & Gemini
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GameConfig, FallingObject, BubbleTimeState, Bubble, WindObject } from '../types/GameTypes';
import { useGameState } from '../hooks/useGameState';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useResponsiveScale, useResponsiveSize } from '../hooks/useResponsiveScale';
import { getGameBackground } from '../utils/shareUtils';
import { audioManager } from '../services/audioManager';

import { StartGameScreen } from './StartGameScreen';
import { GameCompletionScreen } from './GameCompletionScreen';
import { GameLaunchScreen } from './GameLaunchScreen';
import { TutorialScreen } from './TutorialScreen';
import { DifficultyScreen } from './DifficultyScreen';

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
  IMMORTAL_MODE: false, // 移除不死模式
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
  isMusicOn: boolean;
  onMusicToggle: () => void;
}> = ({ 
  gameState, 
  playerInfo,
  onLeftButtonClick, 
  onRightButtonClick, 
  onCenterButtonClick,
  isMusicOn,
  onMusicToggle
}) => {
  
  const { cssVars } = useResponsiveScale();
  const { scale } = useResponsiveSize();
  const [catFlipped, setCatFlipped] = useState(false);
  
  // 温度指针边界反弹状态
  const [isPointerBouncing, setIsPointerBouncing] = useState(false);
  const [bounceDirection, setBounceDirection] = useState<'left' | 'right' | null>(null);
  
  // 按钮自动循环动画状态
  const [isLeftButtonAnimating, setIsLeftButtonAnimating] = useState(false);
  const [isRightButtonAnimating, setIsRightButtonAnimating] = useState(false);

  // Tap图标动画状态
  const [tapIconAnimationState, setTapIconAnimationState] = useState<'idle' | 'animating'>('idle');

  // 添加状态记录干扰音效播放
  const [lastInterferenceType, setLastInterferenceType] = useState<string>('');

  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  // 使用游戏状态中的当前温度区域
  const currentTemperatureZone = gameState.currentTemperatureZone || 0;

  // 背景图片管理：根据温度区域变化随机切换
  const [selectedBackground, setSelectedBackground] = useState(() => getGameBackground());
  
  // 当温度区域变化时，随机切换背景图片
  useEffect(() => {
    const backgrounds = [
      '/background-1.png', 
      '/background-2.png', 
      '/background-3.png', 
      '/background-4.png', 
      '/background-5.png'
    ] as const;
    
    // 随机选择新的背景图片，确保索引有效
    const randomIndex = Math.floor(Math.random() * backgrounds.length);
    const safeIndex = Math.max(0, Math.min(randomIndex, backgrounds.length - 1));
    const newBackground = backgrounds[safeIndex] as string;
    setSelectedBackground(newBackground);
    
    console.log(`🎨 温度区域 ${currentTemperatureZone} 切换背景至: ${newBackground}`);
  }, [currentTemperatureZone]);

  // 精确的舒适度条颜色映射 - 按照用户规格
  const getComfortBarColor = (comfort: number): string => {
    if (comfort >= 0.85) return '#5ff367';  // 非常舒适 - 鲜绿色
    if (comfort >= 0.70) return '#8bc34a';  // 舒适 - 浅绿色
    if (comfort >= 0.55) return '#cddc39';  // 一般 - 黄绿色
    if (comfort >= 0.40) return '#ffc107';  // 不太舒适 - 黄色
    if (comfort >= 0.25) return '#ff9800';  // 不舒适 - 橙色
    return '#f44336';                       // 非常不舒适 - 红色
  };

  // 温度区域轮换现在由GameStateManager管理

  // 猫咪翻转动画
  useEffect(() => {
    const flipInterval = setInterval(() => {
      setCatFlipped(prev => !prev);
    }, 3000);
    return () => clearInterval(flipInterval);
  }, []);

  // 温度指针边界反弹效果
  useEffect(() => {
    const temperature = gameState.currentTemperature + (gameState.temperatureOffset || 0);
    
    if (temperature <= 0) {
      setIsPointerBouncing(true);
      setBounceDirection('left');
      const timer = setTimeout(() => {
        setIsPointerBouncing(false);
        setBounceDirection(null);
      }, 600);
      return () => clearTimeout(timer);
    } else if (temperature >= 1) {
      setIsPointerBouncing(true);
      setBounceDirection('right');
      const timer = setTimeout(() => {
        setIsPointerBouncing(false);
        setBounceDirection(null);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [gameState.currentTemperature, gameState.temperatureOffset]);

  // 左侧按钮自动循环弹跳动画 - 每2秒一次
  useEffect(() => {
    const startAnimation = () => {
      setIsLeftButtonAnimating(true);
      setTimeout(() => {
        setIsLeftButtonAnimating(false);
      }, 600);
    };

    startAnimation();
    const interval = setInterval(startAnimation, 2000);
    return () => clearInterval(interval);
  }, []);

  // 右侧按钮自动循环弹跳动画 - 每2秒一次
  useEffect(() => {
    const startAnimation = () => {
      setIsRightButtonAnimating(true);
      setTimeout(() => {
        setIsRightButtonAnimating(false);
      }, 600);
    };

    // 延迟启动，避免与左侧按钮同时动画
    setTimeout(() => {
      startAnimation();
      const interval = setInterval(startAnimation, 2000);
      return () => clearInterval(interval);
    }, 1000);
  }, []);

  // Tap图标旋转动画效果
  useEffect(() => {
    if (gameState.tapIconAnimationTrigger === 0) return;

    setTapIconAnimationState('animating');

    const animationTimer = setTimeout(() => {
      setTapIconAnimationState('idle');
    }, 300);

    return () => clearTimeout(animationTimer);
  }, [gameState.tapIconAnimationTrigger]);

  // 干扰音效处理函数 - 防止重复播放
  const handleInterferenceSound = useCallback((interferenceType: string) => {
    // 防止同一个干扰事件重复播放音效
    if (lastInterferenceType === interferenceType) return;
    
    if (isMusicOn && interferenceType) {
      console.log(`🎵 播放干扰音效: ${interferenceType}`);
      
      switch (interferenceType) {
        case 'bubble_time':
          audioManager.playSound('bubbleTime');
          break;
        case 'electric_leakage':
          audioManager.playSound('electricStart');
          break;
        case 'controls_reversed':
          audioManager.playSound('controlsReversed');
          break;
        case 'surprise_drop':
          audioManager.playSound('surpriseDrop');
          break;
        case 'cold_wind':
          audioManager.playSound('coldWind');
          break;
      }
      
      setLastInterferenceType(interferenceType);
    }
  }, [isMusicOn, lastInterferenceType]);

  // 监听干扰事件变化
  useEffect(() => {
    if (gameState.interferenceEvent.isActive && gameState.interferenceEvent.type) {
      handleInterferenceSound(gameState.interferenceEvent.type);
    } else if (!gameState.interferenceEvent.isActive) {
      // 干扰事件结束时重置
      setLastInterferenceType('');
    }
  }, [gameState.interferenceEvent.isActive, gameState.interferenceEvent.type, handleInterferenceSound]);

  // 移除泡泡时间结束音效 - 避免音乐冲突
  // 泡泡时间音效应该只在事件开始时播放，事件持续期间持续播放，只有用户点击中间按钮才停止

  // 接住物品音效 - 监听掉落物品数量变化
  const [previousFallingObjectsCount, setPreviousFallingObjectsCount] = useState<number>(0);
  useEffect(() => {
    const currentCount = gameState.fallingObjects?.length || 0;
    
    // 如果物品数量减少且当前是惊喜掉落事件，说明接住了物品
    if (currentCount < previousFallingObjectsCount && 
        gameState.interferenceEvent?.type === 'surprise_drop' && 
        gameState.interferenceEvent?.isActive && 
        isMusicOn) {
              audioManager.playSound('giftCaught');
    }
    
    setPreviousFallingObjectsCount(currentCount);
  }, [gameState.fallingObjects?.length, gameState.interferenceEvent?.type, gameState.interferenceEvent?.isActive, isMusicOn, previousFallingObjectsCount]);

  // 计算4个温度区域的位置和尺寸
  const calculateTemperatureZones = () => {
    // 总宽度724px，减去左右各40px无效区域 = 644px
    // 644px ÷ 4 = 161px 每个区域
    const totalWidth = 628;
    const leftPadding = 40;
    const rightPadding = 40;
    const availableWidth = totalWidth - leftPadding - rightPadding; // 644px
    const zoneWidth = availableWidth / 4; // 161px

    const zones = [];
    for (let i = 0; i < 4; i++) {
      zones.push({
        left: scale(leftPadding + (i * zoneWidth)), // 40 + i*161
        width: scale(zoneWidth), // 161
        centerX: scale(leftPadding + (i * zoneWidth) + (zoneWidth / 2)), // 区域中心X坐标
        temperatureImage: [`/18°C.png`, `/28°C.png`, `/38°C.png`, `/48°C.png`][i]
      });
    }

    return zones;
  };

  const temperatureZones = calculateTemperatureZones();

  // 干扰事件类型到图片文件名的映射
  const getInterferenceImageSrc = (interferenceType: string): string => {
    const interferenceImageMap: { [key: string]: string } = {
      'bubble_time': '/Bubble_Time!.png',
      'controls_reversed': '/Controls_reversed.png',
      'electric_leakage': '/Electric_leakage.png',
      'surprise_drop': '/Surprise_Drop!.png',
      'cold_wind': '/Cold_wind.png'
    };
    return interferenceImageMap[interferenceType] || '/Bubble_Time!.png';
  };

  // 温度指针位置计算 - 精确像素级控制
  const calculatePointerPosition = (): number => {
    const temperature = Math.max(0, Math.min(1, gameState.currentTemperature + (gameState.temperatureOffset || 0)));
    
    // 指针移动范围：最左4px，最右608px，活动范围604px
    const minLeft = scale(4); // 紧贴左边框内侧
    const range = scale(604); // 608 - 4
    
    const position = minLeft + (temperature * range);
    
    // 边界反弹偏移
    const bounceOffset = isPointerBouncing ? 
      (bounceDirection === 'left' ? -scale(8) : bounceDirection === 'right' ? scale(8) : 0) : 0;
    
    return position + bounceOffset;
  };

  // 蓝色填充区域计算 - 精确按照用户规格
  // 移除原来的单区域计算，使用新的4区域系统
  const pointerPosition = calculatePointerPosition();

  return (
    <div 
      className="bg-[#2f2f2f] relative"
      style={{
        width: `${scale(724)}px`,
        height: `${scale(584)}px`,
        ...cssVars
      }}
    >
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{
          backgroundImage: `url(${selectedBackground})`
        }}
      />
      
      <div 
        className="absolute"
        style={{
          width: `${scale(120)}px`,
          height: `${scale(120)}px`,
          left: `${scale(302)}px`,
          top: `${scale(270)}px`
        }}
      >
        <img
          className={`w-full h-full object-cover ${catFlipped ? 'scale-x-[-1]' : ''}`}
          alt="Cat in shower"
          src={`/Cat_${playerInfo.catAvatarId}.png`}
        />
      </div>

      {/* 舒适度进度条 (ComfortBar) - 按照用户规格 */}
      <div 
        className="absolute bg-[#d9d9d9] border-[#39358e]"
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

      {/* 温度条系统 (TemperatureBar) - 完全按照用户规格 */}
      <div 
        className="absolute"
        style={{
          left: `${scale(48)}px`,
          top: `${scale(136)}px`,
          width: `${scale(628)}px`,
          height: `${scale(78)}px`
        }}
      >
        {/* 温度条容器 - 628px × 24px */}
        <div 
          className="absolute bg-[#d9d9d9] border-[#39358e]"
          style={{
            top: `${scale(9)}px`,
            width: `${scale(628)}px`,
            height: `${scale(24)}px`,
            borderWidth: `${scale(4)}px`
          }}
        >
          {/* 4个蓝色填充区域 - 每隔15秒显示一个，同时更换背景地图 */}
          {temperatureZones.map((zone, index) => (
            <div
              key={index}
              className={`absolute top-0 ${
                index === currentTemperatureZone ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                left: `${zone.left}px`,
                width: `${zone.width}px`,
                height: '100%',
                backgroundColor: '#728CFF',
                borderTop: `${scale(4)}px solid #39358e`,
                borderBottom: `${scale(4)}px solid #39358e`,
              }}
            />
          ))}
        </div>

        {/* 温度图片 - 在各区域正下方18px处显示 */}
        {temperatureZones.map((zone, index) => (
          <div
            key={`temp-image-${index}`}
            className={`absolute ${
              index === currentTemperatureZone ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              left: `${zone.centerX - scale(12)}px`, // 图片居中，假设图片宽度约24px
              top: `${scale(9 + 24 + 18)}px`, // 温度条下方18px处
              width: 'auto',
              height: 'auto',
            }}
          >
            <img
              src={zone.temperatureImage}
              alt={`Temperature ${index + 1}`}
              style={{
                height: `${scale(20)}px`, // 设置图片高度
                width: 'auto',
              }}
              onError={(e) => {
                // 图片加载失败时的备用方案
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<div style="
                    color: #728CFF; 
                    font-size: ${scale(12)}px; 
                    font-weight: bold;
                    text-align: center;
                  ">${['18°C', '28°C', '38°C', '48°C'][index]}</div>`;
                }
              }}
            />
          </div>
        ))}

        {/* 温度指针 - 16px × 40px，向上偏移8px */}
        <div
          className={`absolute border-[#39358e] transition-all ${
            isPointerBouncing ? 'duration-600 ease-out' : 'duration-300 ease-out'
          } ${gameState.interferenceEvent?.type === 'electric_leakage' ? 'electric-leakage-effect' : ''}`}
          style={{
            width: `${scale(16)}px`,
            height: `${scale(40)}px`,
            top: `${scale(0)}px`, // 向上偏移8px
            left: `${pointerPosition}px`,
            borderWidth: `${scale(4.9)}px`,
            backgroundColor: gameState.interferenceEvent?.type === 'electric_leakage' ? '#ff6b6b' : '#f8cb56',
            boxShadow: gameState.interferenceEvent?.type === 'electric_leakage' ? '0 0 10px rgba(255, 107, 107, 0.8)' : 'none',
            transform: isPointerBouncing ? 'scaleX(1.1)' : 'scaleX(1)',
          }}
        />
      </div>

      {/* 温度控制按钮 - 按照用户规格 */}
      {/* 减号按钮 - 56px × 56px，位置 left-[84px] top-[460px] */}
      <button
        className={`absolute transition-all duration-200 hover:scale-105 active:scale-95 ${
          gameState.isControlsReversed ? 'ring-4 ring-purple-400 animate-pulse' : ''
        }`}
        style={{ 
          left: `${scale(84)}px`, 
          top: `${scale(460)}px`, 
          width: `${scale(56)}px`, 
          height: `${scale(56)}px`,
          transform: isLeftButtonAnimating ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.3s ease-out'
        }}
        onClick={onLeftButtonClick}
        disabled={gameState.gameStatus === 'failure' || gameState.gameStatus === 'success' || gameState.gameStatus === 'paused'}
      >
        <img
          className="w-full h-full object-cover"
          alt={gameState.isControlsReversed ? "Increase temperature" : "Decrease temperature"}
          src={gameState.isControlsReversed ? "/button-temp-plus.png" : "/button-temp-minus.png"}
        />
      </button>

      {/* 加号按钮 - 56px × 56px，位置 left-[584px] top-[460px] */}
      <button
        className={`absolute transition-all duration-200 hover:scale-105 active:scale-95 ${
          gameState.isControlsReversed ? 'ring-4 ring-purple-400 animate-pulse' : ''
        }`}
        style={{ 
          left: `${scale(584)}px`, 
          top: `${scale(460)}px`, 
          width: `${scale(56)}px`, 
          height: `${scale(56)}px`,
          transform: isRightButtonAnimating ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.3s ease-out'
        }}
        onClick={onRightButtonClick}
        disabled={gameState.gameStatus === 'failure' || gameState.gameStatus === 'success' || gameState.gameStatus === 'paused'}
      >
        <img
          className="w-full h-full object-cover"
          alt={gameState.isControlsReversed ? "Decrease temperature" : "Increase temperature"}
          src={gameState.isControlsReversed ? "/button-temp-minus.png" : "/button-temp-plus.png"}
        />
      </button>

      {/* 中央按钮 - 泡泡互动 (Center Button - Bubble Interaction) 带Tap图标旋转 */}
      <button
        className="absolute transition-all duration-200 hover:scale-105 active:scale-95"
        style={{ left: `${scale(322)}px`, top: `${scale(448)}px`, width: `${scale(80)}px`, height: `${scale(80)}px` }}
        onClick={onCenterButtonClick}
        disabled={gameState.gameStatus === 'failure' || gameState.gameStatus === 'success' || gameState.gameStatus === 'paused'}
      >
        <img 
          className={`w-full h-full object-cover transition-transform duration-300 ease-out ${
            tapIconAnimationState === 'animating' ? 'animate-[tapRotate_0.3s_ease-out]' : ''
          }`}
          style={{
            transform: `rotate(${gameState.tapIconRotation || 0}deg)`,
          }}
          alt="Center tap button" 
          src="/icon-tap.png" 
        />
      </button>

      {/* 计时器 (Timer) - 显示游戏进行时间 */}
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
            WebkitTextStroke: `${scale(2.4)}px #3A368E`,
          }}
        >
          {formatTime(gameState.gameTimer)}
        </div>
      </div>

      {/* 音乐按钮 (Music Button) */}
      <button 
        className="absolute transition-all duration-200 hover:scale-105"
        style={{ left: `${scale(600)}px`, top: `${scale(24)}px`, width: `${scale(80)}px`, height: `${scale(36)}px` }}
        onClick={onMusicToggle}
      >
        <img 
          className="w-full h-full object-contain"
          alt={isMusicOn ? "Music on" : "Music off"} 
          src={isMusicOn ? "/Button_Music_On.png" : "/Button_Music_Off.png"} 
        />
      </button>

      {/* Status Icons */}
      <div style={{ left: `${scale(48)}px`, top: `${scale(72)}px`, width: `${scale(28)}px`, height: `${scale(28)}px`, position: 'absolute' }}>
        <img
          className={`w-full h-full transition-opacity duration-300 ${gameState.currentComfort <= 0.25 ? 'opacity-100' : 'opacity-30'}`}
          alt="Comfort fail"
          src="/icon-comfortbar-fail.png"
        />
      </div>
      <div style={{ left: `${scale(648)}px`, top: `${scale(72)}px`, width: `${scale(28)}px`, height: `${scale(28)}px`, position: 'absolute' }}>
        <img
          className={`w-full h-full transition-opacity duration-300 ${gameState.currentComfort >= 0.75 ? 'opacity-100' : 'opacity-30'}`}
          alt="Comfort success"
          src="/icon-comfortbar-succ.png"
        />
      </div>

      {/* 干扰事件指示器 - 支持多个同时发生的事件 */}
      {gameState.interferenceEvents && gameState.interferenceEvents.length > 0 && (
        <div className="absolute">
          {gameState.interferenceEvents.map((event: any, index: number) => (
            <div 
              key={event.id || `${event.type}_${index}`}
              className="absolute transition-all duration-300 ease-out"
              style={{
                top: `${scale(24 + (index * 45))}px`, // 优先级高的事件在下方：第一个事件在24px，第二个在69px，第三个在114px
                left: `${scale(156)}px`,
                width: `${scale(412)}px`,
                height: `${scale(35)}px`,
                flexShrink: 0,
                aspectRatio: '412/35',
                zIndex: 30 - index, // 第一个事件层级最高，后续事件层级递减
                animation: index === gameState.interferenceEvents.length - 1 ? 'fadeInDown 0.3s ease-out' : undefined, // 只有最新事件有淡入动画
              }}
            >
              <img
                className="w-full h-full object-contain"
                alt={`${event.type} interference event`}
                src={getInterferenceImageSrc(event.type)}
                onError={(e) => {
                  console.error(`Failed to load interference image for type: ${event.type}`);
                  // 如果图片加载失败，设置一个默认图片
                  const target = e.target as HTMLImageElement;
                  target.src = '/Bubble_Time!.png';
                }}
              />
              
              {/* 多事件叠加时显示事件序号 */}
              {gameState.interferenceEvents.length > 1 && (
                <div 
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center"
                  style={{
                    width: `${scale(20)}px`,
                    height: `${scale(20)}px`,
                    fontSize: `${scale(12)}px`,
                    marginTop: `${scale(-5)}px`,
                    marginRight: `${scale(-5)}px`,
                  }}
                >
                  {index + 1}
                </div>
              )}
            </div>
          ))}
        </div>
      )}



      {/* 泡泡时间效果 - 新的从上到下下落系统 */}
      {gameState.bubbleTimeState?.isActive && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {gameState.bubbleTimeState.bubbles.map((bubble: Bubble) => (
            <div
              key={bubble.id}
              className="absolute"
              style={{
                left: `${bubble.x}px`,
                top: `${bubble.y}px`,
                width: `${scale(bubble.size)}px`,
                height: `${scale(bubble.size)}px`,
                opacity: bubble.opacity,
                transform: 'translate(-50%, -50%)',
                willChange: 'transform', // 性能优化
              }}
            >
              <img
                src="/bubble.png"
                alt="Bubble"
                className="w-full h-full object-contain"
                style={{
                  filter: 'drop-shadow(0 0 10px rgba(173, 216, 230, 0.6))',
                }}
                onError={(e) => {
                  // 如果bubble.png加载失败，使用原来的CSS泡泡
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.style.background = 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), rgba(173, 216, 230, 0.6))';
                  target.parentElement!.style.borderRadius = '50%';
                  target.parentElement!.style.border = '2px solid rgba(173, 216, 230, 0.8)';
                  target.parentElement!.style.boxShadow = '0 0 20px rgba(173, 216, 230, 0.4)';
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* 惊喜掉落物品 - Surprise Drop Objects (Devvit风格实现) */}
      {gameState.fallingObjects && gameState.fallingObjects.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-15">
          {gameState.fallingObjects.map((obj: FallingObject) => {
            // 定义接住区域：底部100px高度区域
            const catchZoneTop = 484; // 游戏区域底部向上100px
            const catchZoneBottom = 584; // 游戏区域底部
            const isInCatchZone = obj.yPosition >= catchZoneTop && obj.yPosition <= catchZoneBottom;
            
            return (
              <div
                key={obj.id}
                className="absolute transition-none falling-item"
                style={{
                  left: `${scale(obj.xPosition)}px`,
                  top: `${scale(obj.yPosition)}px`,
                  width: `${scale(40)}px`,
                  height: `${scale(40)}px`,
                  transform: 'translate(-50%, -50%)',
                  // 在接住区域时高亮显示
                  filter: isInCatchZone ? 'drop-shadow(0 0 15px #ffff00) brightness(1.3)' : 'drop-shadow(0 0 5px rgba(0,0,0,0.3))',
                  zIndex: isInCatchZone ? 25 : 15,
                }}
              >
                <img
                  className="w-full h-full object-contain"
                  alt={`Falling ${obj.type}`}
                  src={obj.imageSrc}
                  onError={(e) => {
                    // 如果图片加载失败，显示颜色编码的圆圈
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div style="
                          width: 100%; 
                          height: 100%; 
                          display: flex; 
                          align-items: center; 
                          justify-content: center; 
                          background: ${obj.comfortEffect > 0 ? '#4ade80' : '#ef4444'};
                          border-radius: 50%;
                          color: white;
                          font-size: ${scale(20)}px;
                          font-weight: bold;
                          border: 2px solid white;
                        ">
                          ${obj.comfortEffect > 0 ? '✨' : '💀'}
                        </div>
                      `;
                    }
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* 冷风效果 - Cold Wind Effects */}
      {gameState.windObjects && gameState.windObjects.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {gameState.windObjects.map((wind: WindObject) => (
            <div
              key={wind.id}
              className="absolute transition-none"
              style={{
                left: `${scale(wind.x)}px`,
                top: `${scale(wind.y)}px`,
                width: `${scale(90)}px`,  // 风图标尺寸 - 增加1.5倍 (60 * 1.5 = 90)
                height: `${scale(60)}px`, // 风图标尺寸 - 增加1.5倍 (40 * 1.5 = 60)
                opacity: wind.opacity,
                transform: wind.direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)', // 根据方向翻转
                willChange: 'transform, opacity', // 性能优化
              }}
            >
              <img
                src="/redom-below.png"
                alt="Cold wind"
                className="w-full h-full object-contain"
                onError={(e) => {
                  // 备用方案：使用CSS风效果
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div style="
                        width: 100%; 
                        height: 100%; 
                        background: linear-gradient(90deg, transparent, rgba(173, 216, 230, 0.6), transparent);
                        border-radius: 10px;
                        animation: windFlow 0.5s ease-in-out infinite alternate;
                      "></div>
                    `;
                  }
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const GameInterface: React.FC = () => {
  const [showLaunchScreen, setShowLaunchScreen] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showDifficultyScreen, setShowDifficultyScreen] = useState(false); // 新增难度选择页面
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);
  const [isMusicOn, setIsMusicOn] = useState(true);
  
  const {
    gameState,
    handleLeftButtonClick: gameHandleLeftButtonClick,
    handleRightButtonClick: gameHandleRightButtonClick,
    handleCenterButtonClick: gameHandleCenterButtonClick,
    resetGame,
  } = useGameState(GAME_CONFIG);

  const { submitScore } = useLeaderboard();
  const [showGameCompletion, setShowGameCompletion] = useState(false);
  const [finalGameTime, setFinalGameTime] = useState<number>(0);
  const [userCountryCode] = useState<string>('US');

  const handleMusicToggle = () => {
    setIsMusicOn(prev => {
      const newState = !prev;
      audioManager.setMuted(!newState);
      
      if (newState && gameState.gameStatus === 'playing') {
        // 重新开始背景音乐
        audioManager.startBackgroundMusic();
      }
      
      return newState;
    });
  };

  const handleStartGame = (newPlayerInfo: PlayerInfo) => {
    // 保存玩家信息到localStorage，确保数据持久化
    const playerData = {
      playerName: newPlayerInfo.playerName,
      continentId: newPlayerInfo.continentId,
      catAvatarId: newPlayerInfo.catAvatarId,
      selectedCat: `/Cat_${newPlayerInfo.catAvatarId}.png`
    };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('catComfortGame_playerInfo', JSON.stringify(playerData));
    }
    
    // 播放游戏开始音效和背景音乐
    if (isMusicOn) {
      audioManager.playSound('gameStartAction');
      setTimeout(() => {
        audioManager.startBackgroundMusic();
      }, 1000); // 延迟1秒播放背景音乐，让开始音效先播放
    }
    
    setPlayerInfo(newPlayerInfo);
    setIsGameStarted(true);
    setShowGameCompletion(false);
    resetGame();
  };

  const handleStartFromLaunch = () => {
    setShowLaunchScreen(false);
    setShowTutorial(true);
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setShowDifficultyScreen(true); // 显示难度选择页面
  };

  const handleTutorialSkip = () => {
    setShowTutorial(false);
    setShowDifficultyScreen(true); // 显示难度选择页面
  };

  const handleDifficultyContinue = () => {
    setShowDifficultyScreen(false); // 隐藏难度选择页面
  };

  const handleBackToStart = () => {
    // 停止所有音频
    audioManager.stopAllSounds();
    
    setShowLaunchScreen(true);
    setIsGameStarted(false);
    setPlayerInfo(null);
    setShowGameCompletion(false);
    setShowDifficultyScreen(false);
    resetGame();
  };

  // 修复：重新开始游戏，直接重置游戏状态而不退回选择界面
  const handleRestartGame = () => {
    setShowGameCompletion(false);
    
    // 重新开始背景音乐
    if (isMusicOn) {
      audioManager.startBackgroundMusic();
    }
    
    resetGame(); // 直接重置游戏，保持在GameInterface界面
  };

  useEffect(() => {
    if (gameState.gameStatus === 'failure') {
      const score = Math.floor(gameState.gameTimer);
      setFinalGameTime(score);
      
      // 停止背景音乐并播放游戏失败音效
      audioManager.stopBackgroundMusic();
      if (isMusicOn) {
        audioManager.playSound('gameFailure');
      }
      
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
  }, [gameState.gameStatus, gameState.gameTimer, playerInfo, submitScore, userCountryCode, isMusicOn]);

  // 包装按钮点击函数以添加音效
  const handleLeftButtonClick = useCallback(() => {
    if (isMusicOn) {
      audioManager.playSound('tapSound');
    }
    gameHandleLeftButtonClick();
  }, [isMusicOn, gameHandleLeftButtonClick]);

  const handleRightButtonClick = useCallback(() => {
    if (isMusicOn) {
      audioManager.playSound('tapSound');
    }
    gameHandleRightButtonClick();
  }, [isMusicOn, gameHandleRightButtonClick]);

  const handleCenterButtonClick = useCallback(() => {
    if (isMusicOn) {
      audioManager.playSound('tapSound');
    }
    gameHandleCenterButtonClick();
  }, [isMusicOn, gameHandleCenterButtonClick]);

  if (showLaunchScreen) {
    return <GameLaunchScreen 
      onStartGame={handleStartFromLaunch} 
      onToggleMusic={handleMusicToggle}
      isMusicEnabled={isMusicOn}
    />;
  }

  if (showTutorial) {
    return <TutorialScreen 
      onSkip={handleTutorialSkip} 
      onComplete={handleTutorialComplete}
      isMusicOn={isMusicOn}
      onMusicToggle={handleMusicToggle}
    />;
  }

  if (showDifficultyScreen) {
    return <DifficultyScreen onContinue={handleDifficultyContinue} />;
  }

  if (!isGameStarted) {
    return <StartGameScreen onStartGame={handleStartGame} onBackToLaunch={handleBackToStart} />;
  }

  if (showGameCompletion && playerInfo) {
    return (
      <GameCompletionScreen
        onPlayAgain={handleRestartGame} // 修复：使用handleRestartGame直接重置游戏
        onBackToStart={handleBackToStart} // 保持原有的退回主界面功能
        gameStats={{
          enduranceDuration: finalGameTime,
        }}
        playerInfo={playerInfo}
      />
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      {playerInfo && (
        <PixelGameInterface
          gameState={gameState}
          playerInfo={playerInfo}
          onLeftButtonClick={handleLeftButtonClick}
          onRightButtonClick={handleRightButtonClick}
          onCenterButtonClick={handleCenterButtonClick}
          isMusicOn={isMusicOn}
          onMusicToggle={handleMusicToggle}
        />
      )}
    </div>
  );
};