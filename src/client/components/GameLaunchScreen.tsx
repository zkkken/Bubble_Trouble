import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { GameLaunchModal } from "./GameLaunchModal";

interface GameLaunchScreenProps {
  onStartGame: () => void;
  onToggleMusic?: () => void;
  isMusicOn?: boolean;
}

export const GameLaunchScreen: React.FC<GameLaunchScreenProps> = ({ 
  onStartGame, 
  onToggleMusic, 
  isMusicOn = true 
}) => {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Game assets data
  const gameAssets = {
    title: {
      src: "/Title_BubbleTrouble.png",
      alt: "小猫洗澡游戏标题",
      className: "w-[259px] h-[259px] mx-auto mt-8",
    },
    buttons: [
      {
        src: "/Button_Start.png",
        alt: "开始游戏按钮",
        className: "w-[155px] h-[72px] mx-auto mt-4",
        id: "start"
      },
      {
        src: isMusicOn ? "/Button_Music_On.png" : "/button-music-on.png",
        alt: isMusicOn ? "音乐开启" : "音乐关闭",
        className: "w-[124px] h-[53px]",
        id: "music"
      },
      {
        src: "/Button_Help.png",
        alt: "帮助按钮",
        className: "w-[120px] h-[53px] object-cover",
        id: "help"
      },
    ],
  };

  // Button click handlers
  const handleButtonClick = (buttonId: string) => {
    switch (buttonId) {
      case 'start':
        console.log('开始游戏！');
        onStartGame();
        break;
      case 'music':
        console.log('音乐切换！');
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

  return (
    <>
      <Card className="w-[724px] h-[584px] bg-gray-700 rounded-none overflow-hidden mx-auto">
        <CardContent className="p-0 relative h-full bg-cover bg-center flex flex-col items-center" 
                     style={{ backgroundImage: `url(/Bg_Main.png)` }}>
          
          {/* Game title */}
          <img
            className={gameAssets.title.className}
            alt={gameAssets.title.alt}
            src={gameAssets.title.src}
          />

          {/* Game tagline */}
          <div className="mt-2 font-bold text-pink-300 text-3xl text-center tracking-wide leading-10 whitespace-nowrap"
               style={{ 
                 fontFamily: 'Courier New, monospace',
                 textShadow: '2px 2px 4px rgba(61, 118, 206, 0.8), -2px -2px 4px rgba(61, 118, 206, 0.8), 2px -2px 4px rgba(61, 118, 206, 0.8), -2px 2px 4px rgba(61, 118, 206, 0.8)'
               }}>
            准备好给小猫洗澡了吗？
          </div>

          {/* Start button */}
          <div className="mt-4">
            <button
              onClick={() => handleButtonClick('start')}
              className="cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-150 ease-in-out hover:brightness-110 active:brightness-90 focus:outline-none"
            >
              <img
                className={gameAssets.buttons[0].className}
                alt={gameAssets.buttons[0].alt}
                src={gameAssets.buttons[0].src}
              />
            </button>
          </div>

          {/* Control buttons container */}
          <div className="flex gap-10 absolute bottom-10">
            <button
              onClick={() => handleButtonClick('music')}
              className="cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-150 ease-in-out hover:brightness-110 active:brightness-90 focus:outline-none"
            >
              <img
                className={gameAssets.buttons[1].className}
                alt={gameAssets.buttons[1].alt}
                src={gameAssets.buttons[1].src}
              />
            </button>
            <button
              onClick={() => handleButtonClick('help')}
              className="cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-150 ease-in-out hover:brightness-110 active:brightness-90 focus:outline-none"
            >
              <img
                className={gameAssets.buttons[2].className}
                alt={gameAssets.buttons[2].alt}
                src={gameAssets.buttons[2].src}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Help Modal */}
      <GameLaunchModal 
        isOpen={isHelpModalOpen} 
        onClose={() => setIsHelpModalOpen(false)} 
      />
    </>
  );
}; 