import React, { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { HelpModal } from "./HelpModal";
import { useResponsiveScale, useResponsiveSize } from '../hooks/useResponsiveScale';
import { audioManager } from '../services/audioManager';

interface GameLaunchScreenProps {
  onStartGame: () => void;
  onToggleMusic?: () => void;
  isMusicEnabled?: boolean;
}

interface GameAsset {
  src: string;
  alt: string;
  className: string;
  id?: string;
}

interface GameAssets {
  title: GameAsset;
  tagline: GameAsset;
  buttons: [GameAsset, GameAsset, GameAsset]; // Fixed length tuple type
}

export const GameLaunchScreen: React.FC<GameLaunchScreenProps> = ({
  onStartGame,
  onToggleMusic,
  isMusicEnabled = true,
}) => {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  
  // 响应式设计hooks
  const { cssVars } = useResponsiveScale();
  const { scale } = useResponsiveSize();

  // 音频初始化效果 - 移除自动播放，改为用户交互时播放
  useEffect(() => {
    // 预加载音频文件，但不自动播放
    if (isMusicEnabled) {
      audioManager.preloadAudio('backgroundMusic');
    }
  }, [isMusicEnabled]);

  // Game assets data - 响应式图片尺寸
  const gameAssets: GameAssets = {
    title: {
      src: "/Title_BubbleTrouble.png",
      alt: "Title_BubbleTrouble",
      className: "mx-auto",
    },
    tagline: {
      src: "/Are_You_Ready_For_A_Wash.png",
      alt: "Are you ready for a wash?",
      className: "w-auto h-auto",
    },
    buttons: [
      {
        src: "/Button_Start.png",
        alt: "Start Game Button",
        className: "mx-auto",
        id: "start"
      },
      {
        src: isMusicEnabled ? "/Button_Music_On.png" : "/Button_Music_Off.png",
        alt: isMusicEnabled ? "Music On" : "Music Off",
        className: "",
        id: "music"
      },
      {
        src: "/Button_Help.png",
        alt: "Help Button",
        className: "object-cover",
        id: "help"
      },
    ],
  };

  // Button click handlers
  const handleButtonClick = (buttonId: string) => {
    // 用户首次交互时启动背景音乐
    if (isMusicEnabled) {
      audioManager.startBackgroundMusic();
    }

    switch (buttonId) {
      case 'start':
        // 播放按钮点击音效
        if (isMusicEnabled) {
          audioManager.playSound('buttonClick');
        }
        onStartGame();
        break;
      case 'music':
        if (onToggleMusic) {
          onToggleMusic();
        }
        break;
      case 'help':
        setIsHelpModalOpen(true);
        break;
      default:
        break;
    }
  };

  // 处理从help页面启动教学的函数
  const handleStartTutorial = () => {
    setIsHelpModalOpen(false);
    // 用户交互时启动背景音乐
    if (isMusicEnabled) {
      audioManager.startBackgroundMusic();
    }
    // 播放按钮点击音效
    if (isMusicEnabled) {
      audioManager.playSound('buttonClick');
    }
    onStartGame(); // 与正常开始游戏相同，进入教学页面
  };

  // Handle Bolt.new link click
  const handleBoltLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Open in the same window instead of a new tab
    window.location.href = "https://bolt.new";
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen">
        <Card 
          className="bg-[#2f2f2f] rounded-none overflow-hidden border-0 relative"
          style={{
            width: `${scale(724)}px`,
            height: `${scale(584)}px`,
            ...cssVars
          }}
        >
          {/* Built with Bolt.new Badge - Top Left Corner */}
          <div 
            className="absolute z-50"
            style={{
              top: `${scale(16)}px`,
              left: `${scale(16)}px`
            }}
          >
            <a 
              href="https://bolt.new" 
              onClick={handleBoltLinkClick}
              className="inline-flex items-center transition-all duration-200 hover:scale-105"
            >
              <img 
                src="/bolt.png" 
                alt="Built with Bolt.new" 
                style={{
                  width: `${scale(120)}px`,
                  height: `${scale(120)}px`
                }}
              />
            </a>
          </div>


          <CardContent className="p-0 relative h-full bg-[url(/Bg_Main.png)] bg-cover bg-[50%_50%] flex flex-col items-center">
            {/* Game title */}
            <img
              className={gameAssets.title.className}
              alt={gameAssets.title.alt}
              src={gameAssets.title.src}
              style={{
                width: `${scale(259)}px`,
                height: `${scale(259)}px`,
                marginTop: `${scale(32)}px`
              }}
            />

            {/* Game tagline */}
            <img
              className={gameAssets.tagline.className}
              alt={gameAssets.tagline.alt}
              src={gameAssets.tagline.src}
              style={{
                marginTop: `${scale(8)}px`
              }}
            />

            {/* Start button */}
            <div 
              style={{ 
                fontFamily: '"Pixelify Sans", sans-serif', 
                fontWeight: 400, 
                fontStyle: 'normal',
                marginTop: `${scale(16)}px`
              }}
            >
              <button
                onClick={() => handleButtonClick('start')}
                className="cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-150 ease-in-out hover:brightness-110 active:brightness-90"
              >
                <img
                  className={gameAssets.buttons[0].className}
                  alt={gameAssets.buttons[0].alt}
                  src={gameAssets.buttons[0].src}
                  style={{
                    width: `${scale(155)}px`,
                    height: `${scale(72)}px`
                  }}
                />
              </button>
            </div>

            {/* Control buttons container */}
            <div 
              className="flex absolute"
              style={{
                gap: `${scale(40)}px`,
                bottom: `${scale(40)}px`
              }}
            >
              <button
                onClick={() => handleButtonClick('music')}
                className="cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-150 ease-in-out hover:brightness-110 active:brightness-90"
              >
                <img
                  className={gameAssets.buttons[1].className}
                  alt={gameAssets.buttons[1].alt}
                  src={gameAssets.buttons[1].src}
                  style={{
                    width: `${scale(124)}px`,
                    height: `${scale(53)}px`
                  }}
                />
              </button>
              <button
                onClick={() => handleButtonClick('help')}
                className="cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-150 ease-in-out hover:brightness-110 active:brightness-90"
              >
                <img
                  className={gameAssets.buttons[2].className}
                  alt={gameAssets.buttons[2].alt}
                  src={gameAssets.buttons[2].src}
                  style={{
                    width: `${scale(120)}px`,
                    height: `${scale(53)}px`
                  }}
                />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Help Modal */}
      <HelpModal 
        isOpen={isHelpModalOpen} 
        onClose={() => setIsHelpModalOpen(false)}
        onStartTutorial={handleStartTutorial}
      />
    </>
  );
};