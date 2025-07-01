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
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
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

  // 预加载关键图片
  useEffect(() => {
    const imagesToPreload = [
      "/Title_BubbleTrouble.png",
      "/Are_You_Ready_For_A_Wash.png",
      "/Button_Start.png",
      "/Button_Music_On.png",
      "/Button_Music_Off.png",
      "/Button_Help.png",
      "/Bg_Main.png"
    ];

    let loadedCount = 0;
    const totalImages = imagesToPreload.length;

    const preloadImage = (src: string) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            setImagesLoaded(true);
          }
          resolve();
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            setImagesLoaded(true);
          }
          resolve();
        };
        img.src = src;
      });
    };

    Promise.all(imagesToPreload.map(preloadImage)).then(() => {
      setImagesLoaded(true);
    });
  }, []);

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
            className="absolute z-50 flex flex-col"
            style={{
              top: `${scale(16)}px`,
              left: `${scale(16)}px`,
              gap: `${scale(8)}px`
            }}
          >
            {/* Built with Bolt.new Badge */}
            <a 
              href="https://bolt.new" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-white/20"
              style={{
                fontSize: `${scale(10)}px`,
                padding: `${scale(4)}px ${scale(8)}px`,
                borderRadius: `${scale(12)}px`
              }}
            >
              <svg 
                className="mr-1" 
                width={scale(12)} 
                height={scale(12)} 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M13 3L4 14h7l-1 8 9-11h-7l1-8z" 
                  fill="currentColor"
                />
              </svg>
              Built with Bolt.new
            </a>

            {/* The World's Largest Hackathon Badge */}
            <div 
              className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-semibold rounded-full shadow-lg border border-white/20"
              style={{
                fontSize: `${scale(9)}px`,
                padding: `${scale(4)}px ${scale(8)}px`,
                borderRadius: `${scale(12)}px`,
                width: 'max-content'
              }}
            >
              <svg 
                className="mr-1" 
                width={scale(12)} 
                height={scale(12)} 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" 
                  fill="currentColor"
                />
              </svg>
              The World's Largest Hackathon
            </div>
          </div>

          <CardContent className="p-0 relative h-full bg-[url(/Bg_Main.png)] bg-cover bg-[50%_50%] flex flex-col items-center">
            {/* Loading overlay */}
            {!imagesLoaded && (
              <div className="absolute inset-0 bg-[#2f2f2f] flex items-center justify-center z-40">
                <div className="flex flex-col items-center">
                  <div 
                    className="animate-spin rounded-full border-4 border-blue-500 border-t-transparent"
                    style={{
                      width: `${scale(40)}px`,
                      height: `${scale(40)}px`
                    }}
                  />
                  <div 
                    className="text-white mt-4 font-bold"
                    style={{ fontSize: `${scale(16)}px` }}
                  >
                    Loading...
                  </div>
                </div>
              </div>
            )}

            {/* Game title */}
            <img
              className={`${gameAssets.title.className} transition-opacity duration-300 ${imagesLoaded ? 'opacity-100' : 'opacity-0'}`}
              alt={gameAssets.title.alt}
              src={gameAssets.title.src}
              style={{
                width: `${scale(259)}px`,
                height: `${scale(259)}px`,
                marginTop: `${scale(32)}px`
              }}
              loading="eager"
              decoding="async"
            />

            {/* Game tagline */}
            <img
              className={`${gameAssets.tagline.className} transition-opacity duration-300 ${imagesLoaded ? 'opacity-100' : 'opacity-0'}`}
              alt={gameAssets.tagline.alt}
              src={gameAssets.tagline.src}
              style={{
                marginTop: `${scale(8)}px`
              }}
              loading="eager"
              decoding="async"
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
                className={`cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-150 ease-in-out hover:brightness-110 active:brightness-90 ${imagesLoaded ? 'opacity-100' : 'opacity-0'}`}
                disabled={!imagesLoaded}
              >
                <img
                  className={gameAssets.buttons[0].className}
                  alt={gameAssets.buttons[0].alt}
                  src={gameAssets.buttons[0].src}
                  style={{
                    width: `${scale(155)}px`,
                    height: `${scale(72)}px`
                  }}
                  loading="eager"
                  decoding="async"
                />
              </button>
            </div>

            {/* Control buttons container */}
            <div 
              className={`flex absolute transition-opacity duration-300 ${imagesLoaded ? 'opacity-100' : 'opacity-0'}`}
              style={{
                gap: `${scale(40)}px`,
                bottom: `${scale(40)}px`
              }}
            >
              <button
                onClick={() => handleButtonClick('music')}
                className="cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-150 ease-in-out hover:brightness-110 active:brightness-90"
                disabled={!imagesLoaded}
              >
                <img
                  className={gameAssets.buttons[1].className}
                  alt={gameAssets.buttons[1].alt}
                  src={gameAssets.buttons[1].src}
                  style={{
                    width: `${scale(124)}px`,
                    height: `${scale(53)}px`
                  }}
                  loading="lazy"
                  decoding="async"
                />
              </button>
              <button
                onClick={() => handleButtonClick('help')}
                className="cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-150 ease-in-out hover:brightness-110 active:brightness-90"
                disabled={!imagesLoaded}
              >
                <img
                  className={gameAssets.buttons[2].className}
                  alt={gameAssets.buttons[2].alt}
                  src={gameAssets.buttons[2].src}
                  style={{
                    width: `${scale(120)}px`,
                    height: `${scale(53)}px`
                  }}
                  loading="lazy"
                  decoding="async"
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