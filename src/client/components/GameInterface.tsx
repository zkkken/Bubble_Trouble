/**
 * 主游戏界面组件 (V2 - 新机制)
 * 724x584像素的像素艺术风格游戏界面
 * 
 * @author 开发者B - UI/UX 界面负责人 & Gemini
 */

import React, { useState, useEffect } from 'react';
import { GameConfig, FallingObject, BubbleTimeState, Bubble } from '../types/GameTypes';
import { WindEffect } from './WindEffect';
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
  isMusicOn: boolean;
  onMusicToggle: () => void;
  onSetImmortalMode: (enabled: boolean) => void;
  onTriggerInterference: (interferenceType: 'electric_leakage' | 'cold_wind' | 'controls_reversed' | 'bubble_time' | 'surprise_drop') => void;
}> = ({ 
  gameState, 
  playerInfo,
  onLeftButtonClick, 
  onRightButtonClick, 
  onCenterButtonClick,
  onBackToStart,
  isMusicOn,
  onMusicToggle,
  onSetImmortalMode,
  onTriggerInterference
}) => {
  
  const { cssVars } = useResponsiveScale();
  const { scale, scaleFont } = useResponsiveSize();
  const [catFlipped, setCatFlipped] = useState(false);
  
  // 温度指针边界反弹状态
  const [isPointerBouncing, setIsPointerBouncing] = useState(false);
  const [bounceDirection, setBounceDirection] = useState<'left' | 'right' | null>(null);
  
  // 按钮自动循环动画状态
  const [isLeftButtonAnimating, setIsLeftButtonAnimating] = useState(false);
  const [isRightButtonAnimating, setIsRightButtonAnimating] = useState(false);

  // Tap图标动画状态
  const [tapIconAnimationState, setTapIconAnimationState] = useState<'idle' | 'animating'>('idle');

  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  // 随机获取背景图片 - 5个场景随机选择
  const getRandomBackground = (): string => {
    const backgrounds = [
      '/background-1.png', 
      '/background-2.png', 
      '/background-3.png', 
      '/background-4.png', 
      '/background-5.png'
    ];
    return backgrounds[Math.floor(Math.random() * backgrounds.length)] || '/background-1.png';
  };

  // 使用useState确保组件生命周期内背景保持一致
  const [selectedBackground] = useState(() => getRandomBackground());
  
  // 不死模式状态
  const [immortalMode, setImmortalMode] = useState(false);

  // 精确的舒适度条颜色映射 - 按照用户规格
  const getComfortBarColor = (comfort: number): string => {
    const percentage = comfort * 100;
    if (percentage >= 75) return '#5FF367'; // 绿色 75-100%
    if (percentage >= 50) return '#FFDF2B'; // 黄色 50-75%
    if (percentage >= 25) return '#FE8E39'; // 橙色 25-50%
    return '#FE4339'; // 红色 0-25%
  };

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

  useEffect(() => {
    const flipInterval = setInterval(() => setCatFlipped(prev => !prev), 3000 + Math.random() * 3000);
    return () => clearInterval(flipInterval);
  }, []);

  // 键盘监听器 - 不死模式和干扰机制快捷键
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      
      // 防止在输入框中触发
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (key) {
        case 'd':
          // 切换不死模式
          setImmortalMode(prev => {
            const newMode = !prev;
            console.log(`🛡️ 不死模式: ${newMode ? '开启' : '关闭'}`);
            onSetImmortalMode(newMode);
            return newMode;
          });
          break;
        
        case '1':
          // 触发漏电干扰
          console.log('⚡ 手动触发漏电干扰');
          onTriggerInterference('electric_leakage');
          break;
          
        case '2':
          // 触发冷风干扰
          console.log('🌬️ 手动触发冷风干扰');
          onTriggerInterference('cold_wind');
          break;
          
        case '3':
          // 触发控制反转干扰
          console.log('🔄 手动触发控制反转');
          onTriggerInterference('controls_reversed');
          break;
          
        case '4':
          // 触发泡泡时间干扰
          console.log('🫧 手动触发泡泡时间');
          onTriggerInterference('bubble_time');
          break;
          
        case '5':
          // 触发惊喜掉落干扰
          console.log('🎁 手动触发惊喜掉落');
          onTriggerInterference('surprise_drop');
          break;
          
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

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

  // 温度指针位置计算 - 精确像素级控制
  const calculatePointerPosition = (): number => {
    const temperature = Math.max(0, Math.min(1, gameState.currentTemperature + (gameState.temperatureOffset || 0)));
    
    // 温度条规格：628px总宽度，4px边框，内容区域620px
    const totalWidth = scale(628);
    const borderWidth = scale(4);
    const contentWidth = scale(620); // 628 - 4 - 4
    const pointerWidth = scale(16);
    
    // 指针移动范围：最左4px，最右608px，活动范围604px
    const minLeft = scale(4); // 紧贴左边框内侧
    const maxLeft = scale(608); // 4 + 620 - 16
    const range = scale(604); // 608 - 4
    
    const position = minLeft + (temperature * range);
    
    // 边界反弹偏移
    const bounceOffset = isPointerBouncing ? 
      (bounceDirection === 'left' ? -scale(8) : bounceDirection === 'right' ? scale(8) : 0) : 0;
    
    return position + bounceOffset;
  };

  // 蓝色填充区域计算 - 精确按照用户规格
  const calculateBlueZone = () => {
    // 总宽度628px，左右各40px边距，内容区548px
    // 分为5个等分区域，每区109.6px
    // 第4区域（60%-80%）显示蓝色填充
    const totalWidth = scale(628);
    const sidePadding = scale(40);
    const contentWidth = scale(548); // 628 - 40 - 40
    const sectionWidth = scale(109.6); // 548 / 5
    
    // 第4区域位置：距离左边368.8px
    const blueZoneLeft = scale(368.8);
    const blueZoneWidth = scale(109.6);
    
    return { left: blueZoneLeft, width: blueZoneWidth };
  };

  const blueZone = calculateBlueZone();
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
          {/* 蓝色填充区域 - 第4区域（60%-80%） */}
          <div
            className="absolute top-0"
            style={{
              left: `${blueZone.left}px`,
              width: `${blueZone.width}px`,
              height: '100%',
              backgroundColor: '#728CFF',
              borderTop: `${scale(4)}px solid #39358e`,
              borderBottom: `${scale(4)}px solid #39358e`,
            }}
          />
        </div>

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
        disabled={gameState.gameStatus !== 'playing'}
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
        disabled={gameState.gameStatus !== 'playing'}
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
        disabled={gameState.gameStatus !== 'playing'}
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
        style={{ left: `${scale(620)}px`, top: `${scale(24)}px`, width: `${scale(80)}px`, height: `${scale(36)}px` }}
        onClick={onMusicToggle}
      >
        <img 
          className="w-full h-full object-cover"
          alt={isMusicOn ? "Music on" : "Music off"} 
          src={isMusicOn ? "/Button_Music_On.png" : "/Button_Music_Off.png"} 
        />
      </button>

      {/* 不死模式指示器 - 隐藏 */}
      {false && immortalMode && (
        <div 
          className="absolute z-50 flex items-center justify-center bg-purple-600 text-white font-bold rounded-lg animate-pulse"
          style={{
            left: `${scale(10)}px`,
            top: `${scale(10)}px`,
            width: `${scale(100)}px`,
            height: `${scale(30)}px`,
            fontSize: `${scale(12)}px`,
            border: '2px solid #ffd700',
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)'
          }}
        >
          🛡️ 不死模式
        </div>
      )}

      {/* 快捷键提示 */}
      <div 
        className="absolute z-40 text-white text-opacity-60"
        style={{
          left: `${scale(10)}px`,
          bottom: `${scale(10)}px`,
          fontSize: `${scale(10)}px`,
          fontFamily: 'monospace'
        }}
      >
        快捷键: D-不死模式 | 1-漏电 | 2-冷风 | 3-反转 | 4-泡泡 | 5-掉落
      </div>

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

      {/* 泡泡时间效果 - 新的复杂运动系统 - 隐藏 */}
      {false && gameState.bubbleTimeState?.isActive && (
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
          {/* 泡泡时间提示文字 */}
          <div 
            className="absolute text-center font-bold"
            style={{
              top: `${scale(120)}px`,
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#fff',
              fontSize: `${scale(18)}px`,
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
            }}
          >
            🎵 点击中央按钮保持节奏！ 🎵
          </div>
        </div>
      )}

      {/* 惊喜掉落物品 - Surprise Drop Objects */}
      {gameState.fallingObjects && gameState.fallingObjects.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
                                {gameState.fallingObjects.map((obj: FallingObject) => (
             <div
               key={obj.id}
               className="absolute transition-none falling-item"
              style={{
                left: `${scale(obj.xPosition)}px`,
                top: `${scale(obj.yPosition)}px`,
                width: `${scale(40)}px`,
                height: `${scale(40)}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <img
                className="w-full h-full object-contain drop-shadow-lg"
                alt={`Falling ${obj.type}`}
                src={obj.imageSrc}
                onError={(e) => {
                  console.error(`Failed to load falling object image: ${obj.imageSrc}`);
                  // 如果图片加载失败，显示一个简单的表情符号
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              {/* 如果图片加载失败，显示文字替代 */}
              <div 
                className="absolute inset-0 flex items-center justify-center text-2xl"
                style={{
                  backgroundColor: obj.comfortEffect > 0 ? '#4ade80' : '#ef4444',
                  borderRadius: '50%',
                  color: 'white',
                }}
              >
                {obj.comfortEffect > 0 ? '✨' : '💀'}
              </div>
            </div>
          ))}
          {/* 掉落事件提示 */}
          <div 
            className="absolute text-center font-bold"
            style={{
              bottom: `${scale(100)}px`,
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#fff',
              fontSize: `${scale(16)}px`,
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
            }}
          >
            🎁 点击中央按钮接住物品！ 🎁
          </div>
        </div>
      )}

      {/* 接住区域指示器 - 绿色虚线框，内部透明 - 隐藏边框 */}
      {false && gameState.fallingObjects && gameState.fallingObjects.length > 0 && (
        <div 
          className="absolute pointer-events-none z-30"
          style={{
            left: `${scale(50)}px`,
            top: `${scale(480)}px`,
            width: `${scale(624)}px`,
            height: `${scale(80)}px`,
            border: '2px dashed #4ade80',
            backgroundColor: 'transparent',
          }}
        />
      )}

      {/* 冷风效果 - WindEffect组件 */}
      {gameState.interferenceEvent?.type === 'cold_wind' && gameState.interferenceEvent.isActive && (
        <>
          <WindEffect />
          {/* 冷风提示文字 - 清除 */}
          {false && (
            <div 
              className="absolute text-center font-bold z-30"
              style={{
                top: `${scale(150)}px`,
                left: '50%',
                transform: 'translateX(-50%)',
                color: '#87ceeb',
                fontSize: `${scale(16)}px`,
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
              }}
            >
              🌨️ 寒风呼啸，温度下降更快！ 🌨️
            </div>
          )}
        </>
      )}
    </div>
  );
};

export const GameInterface: React.FC = () => {
  const [showLaunchScreen, setShowLaunchScreen] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);
  const [isMusicOn, setIsMusicOn] = useState(true);
  
  const {
    gameState,
    handleLeftButtonClick,
    handleRightButtonClick,
    handleCenterButtonClick,
    resetGame,
    setImmortalMode,
    triggerInterference,
  } = useGameState(GAME_CONFIG);

  const { submitScore } = useLeaderboard();
  const [showGameCompletion, setShowGameCompletion] = useState(false);
  const [finalGameTime, setFinalGameTime] = useState<number>(0);
  const [userCountryCode] = useState<string>('US');

  const handleMusicToggle = () => setIsMusicOn(prev => !prev);

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

  const handleRestartToStartGame = () => {
    console.log('🔄 重新开始游戏 - 退回到主界面');
    setShowGameCompletion(false);
    setIsGameStarted(false);
    setPlayerInfo(null);
    resetGame();
    // 可选择是否退回到启动界面
    // setShowLaunchScreen(true);
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
    return <GameLaunchScreen 
      onStartGame={handleStartFromLaunch} 
      onToggleMusic={handleMusicToggle}
      isMusicEnabled={isMusicOn}
    />;
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
        onBackToStart={handleRestartToStartGame}
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
          onBackToStart={handleBackToStart}
          isMusicOn={isMusicOn}
          onMusicToggle={handleMusicToggle}
          onSetImmortalMode={setImmortalMode}
          onTriggerInterference={triggerInterference}
        />
      )}
    </div>
  );
};