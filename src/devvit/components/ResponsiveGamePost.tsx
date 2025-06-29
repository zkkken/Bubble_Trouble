import { Devvit, Context } from '@devvit/public-api';
import { getResponsiveFontSize, getResponsiveSpacing, ResponsiveLayout } from '../responsive-utils';

interface GameState {
  currentTemperature: number;
  targetTemperature: number;
  currentComfort: number;
  gameTimer: number;
  gameStatus: 'playing' | 'success' | 'failure';
  isControlsReversed: boolean;
}

interface ResponsiveGamePostProps {
  gameState?: GameState;
  onButtonPress?: (buttonType: 'plus' | 'minus' | 'center') => void;
}

export const ResponsiveGamePost: Devvit.BlockComponent<ResponsiveGamePostProps> = (
  { gameState, onButtonPress }, 
  context: Context
) => {
  // 计算全局缩放因子
  const scaleFactor = context.uiEnvironment.viewport.width / 724;
  
  // 默认游戏状态
  const defaultGameState: GameState = {
    currentTemperature: 0.5,
    targetTemperature: 0.6,
    currentComfort: 0.75,
    gameTimer: 150, // 2:30
    gameStatus: 'playing',
    isControlsReversed: false,
  };
  
  const state = gameState || defaultGameState;
  
  // 格式化时间显示
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // 获取响应式图片尺寸
  const getImageProps = (width: number, height: number) => 
    ResponsiveLayout.getImageSize(width, height, scaleFactor);
  
  return (
    <zstack width={'100%'} height={'100%'}>
      {/* 背景图片 */}
      <image
        url="background.png"
        description="Game Background"
        {...getImageProps(724, 584)}
        resizeMode="cover"
      />
      
      {/* 主游戏界面 */}
      <vstack width={'100%'} height={'100%'} padding={getResponsiveSpacing(16, scaleFactor)}>
        {/* 顶部状态栏 */}
        <hstack width={'100%'} alignment="space-between">
          {/* 计时器区域 */}
          <hstack alignment="center middle" gap={getResponsiveSpacing(8, scaleFactor)}>
            <text size={getResponsiveFontSize(32, scaleFactor)}>⏰</text>
            <text 
              size={getResponsiveFontSize(28, scaleFactor)} 
              weight="bold" 
              color="white"
            >
              {formatTime(state.gameTimer)}
            </text>
          </hstack>
          
          {/* 音乐按钮 */}
          <image
            url="Button_Music_On.png"
            description="Music Toggle"
            {...getImageProps(80, 36)}
            onPress={() => {
              // 音乐切换逻辑
              console.log('Music toggled');
            }}
          />
        </hstack>
        
        <spacer size={getResponsiveSpacing(24, scaleFactor)} />
        
        {/* 状态指示器 */}
        <hstack width={'100%'} alignment="space-between">
          <image
            url="avatar-bad.png"
            description="Sad Cat"
            {...getImageProps(28, 28)}
          />
          <image
            url="avatar-yellowsmiley.png"
            description="Happy Cat"
            {...getImageProps(28, 28)}
          />
        </hstack>
        
        <spacer size={getResponsiveSpacing(16, scaleFactor)} />
        
        {/* 舒适度进度条 */}
        <vstack width={'100%'} gap={getResponsiveSpacing(4, scaleFactor)}>
          <hstack 
            width={'100%'} 
            height={Math.round(24 * scaleFactor)} 
            backgroundColor="#d9d9d9" 
            cornerRadius="small"
          >
            <hstack 
              width={`${Math.round(state.currentComfort * 100)}%`} 
              height={'100%'} 
              backgroundColor="#5ff367" 
            />
          </hstack>
        </vstack>
        
        <spacer size={getResponsiveSpacing(8, scaleFactor)} />
        
        {/* 温度进度条系统 */}
        <vstack width={'100%'} gap={getResponsiveSpacing(8, scaleFactor)}>
          {/* 温度条背景 */}
          <hstack 
            width={'100%'} 
            height={Math.round(24 * scaleFactor)} 
            backgroundColor="#d9d9d9" 
            cornerRadius="small"
          >
            {/* 容忍带 (橙色区域) */}
            <hstack 
              width={`${Math.round((state.targetTemperature - 0.1) * 100)}%`} 
              height={'100%'} 
              backgroundColor="transparent" 
            />
            <hstack 
              width="20%" 
              height={'100%'} 
              backgroundColor="#ff9500" 
            />
            <hstack 
              width={`${Math.round((1 - state.targetTemperature - 0.1) * 100)}%`} 
              height={'100%'} 
              backgroundColor="transparent" 
            />
          </hstack>
          
          {/* 当前温度填充 */}
          <hstack 
            width={'100%'} 
            height={Math.round(24 * scaleFactor)} 
            backgroundColor="transparent"
          >
            <hstack 
              width={`${Math.round(state.currentTemperature * 100)}%`} 
              height={'100%'} 
              backgroundColor="#728cff" 
            />
          </hstack>
          
          {/* 目标温度显示 */}
          <hstack width={'100%'} alignment="center middle">
            <text 
              size={getResponsiveFontSize(18, scaleFactor)} 
              weight="bold" 
              color="#F0BC08"
            >
              {Math.round(state.targetTemperature * 40 + 20)}°C
            </text>
          </hstack>
        </vstack>
        
        <spacer size={getResponsiveSpacing(32, scaleFactor)} />
        
        {/* 中央猫咪 */}
        <hstack width={'100%'} alignment="center middle">
          <image
            url="Cat_1.png"
            description="Cat in shower"
            {...getImageProps(120, 120)}
          />
        </hstack>
        
        <spacer size={getResponsiveSpacing(32, scaleFactor)} />
        
        {/* 控制按钮区域 */}
        <hstack width={'100%'} alignment="space-between">
          {/* 减温按钮 */}
          <image
            url={state.isControlsReversed ? "button-temp-plus.png" : "button-temp-minus.png"}
            description={state.isControlsReversed ? "Increase Temperature" : "Decrease Temperature"}
            {...getImageProps(56, 56)}
            onPress={() => onButtonPress?.('minus')}
          />
          
          {/* 中央交互按钮 */}
          <image
            url="button-center-interaction.png"
            description="Center Interaction"
            {...getImageProps(80, 80)}
            onPress={() => onButtonPress?.('center')}
          />
          
          {/* 加温按钮 */}
          <image
            url={state.isControlsReversed ? "button-temp-minus.png" : "button-temp-plus.png"}
            description={state.isControlsReversed ? "Decrease Temperature" : "Increase Temperature"}
            {...getImageProps(56, 56)}
            onPress={() => onButtonPress?.('plus')}
          />
        </hstack>
        
        {/* 干扰事件指示器 */}
        {state.isControlsReversed && (
          <vstack width={'100%'} alignment="center middle" padding={getResponsiveSpacing(8, scaleFactor)}>
            <hstack 
              backgroundColor="#9333ea" 
              cornerRadius="medium" 
              padding={getResponsiveSpacing(12, scaleFactor)}
            >
              <text 
                size={getResponsiveFontSize(16, scaleFactor)} 
                color="white" 
                weight="bold"
              >
                🔄 Controls Reversed!
              </text>
            </hstack>
          </vstack>
        )}
        
        {/* 游戏状态指示器 */}
        <hstack width={'100%'} alignment="space-between" padding={getResponsiveSpacing(8, scaleFactor)}>
          <hstack 
            backgroundColor="rgba(0,0,0,0.5)" 
            cornerRadius="small" 
            padding={getResponsiveSpacing(4, scaleFactor)}
          >
            <text size={getResponsiveFontSize(12, scaleFactor)} color="white">
              Temp: {Math.round(state.currentTemperature * 100)}%
            </text>
          </hstack>
          
          <hstack 
            backgroundColor="rgba(0,0,0,0.5)" 
            cornerRadius="small" 
            padding={getResponsiveSpacing(4, scaleFactor)}
          >
            <text size={getResponsiveFontSize(12, scaleFactor)} color="white">
              Comfort: {Math.round(state.currentComfort * 100)}%
            </text>
          </hstack>
          
          <hstack 
            backgroundColor="rgba(0,0,0,0.5)" 
            cornerRadius="small" 
            padding={getResponsiveSpacing(4, scaleFactor)}
          >
            <text size={getResponsiveFontSize(12, scaleFactor)} color="white">
              Target: {Math.round(state.targetTemperature * 100)}%
            </text>
          </hstack>
        </hstack>
      </vstack>
    </zstack>
  );
};