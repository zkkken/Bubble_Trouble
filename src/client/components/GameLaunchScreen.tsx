import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { HelpModal } from "./HelpModal";

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

  // Game assets data - 使用与当前项目相同的图片加载方式
  const gameAssets: GameAssets = {
    title: {
      src: "/Title_BubbleTrouble.png",
      alt: "Cat Comfort Game Title",
      className: "w-[259px] h-[259px] mx-auto mt-8",
    },
    tagline: {
      src: "/Are_You_Ready_For_A_Wash.png",
      alt: "Are you ready for a wash?",
      className: "mt-2 w-auto h-auto",
    },
    buttons: [
      {
        src: "/Button_Start.png",
        alt: "Start Game Button",
        className: "w-[155px] h-[72px] mx-auto mt-4",
        id: "start"
      },
      {
        src: isMusicEnabled ? "/Button_Music_On.png" : "/Button_Music_On.png", // 可以后续添加音乐关闭的图片
        alt: isMusicEnabled ? "Music On" : "Music Off",
        className: "w-[124px] h-[53px]",
        id: "music"
      },
      {
        src: "/Button_Help.png",
        alt: "Help Button",
        className: "w-[120px] h-[53px] object-cover",
        id: "help"
      },
    ],
  };

  // Button click handlers
  const handleButtonClick = (buttonId: string) => {
    switch (buttonId) {
      case 'start':
        console.log('Start game clicked!');
        onStartGame();
        break;
      case 'music':
        console.log('Music toggle clicked!');
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
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[724px] h-[584px] bg-[#2f2f2f] rounded-none overflow-hidden border-0">
          <CardContent className="p-0 relative h-full bg-[url(/Bg_Main.png)] bg-cover bg-[50%_50%] flex flex-col items-center">
            {/* Game title */}
            <img
              className={gameAssets.title.className}
              alt={gameAssets.title.alt}
              src={gameAssets.title.src}
            />

            {/* Game tagline */}
            <img
              className={gameAssets.tagline.className}
              alt={gameAssets.tagline.alt}
              src={gameAssets.tagline.src}
            />

            {/* Start button */}
            <div className="mt-4" style={{ fontFamily: '"lores-12", sans-serif', fontWeight: 400, fontStyle: 'normal' }}>
              <button
                onClick={() => handleButtonClick('start')}
                className="cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-150 ease-in-out hover:brightness-110 active:brightness-90"
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
                className="cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-150 ease-in-out hover:brightness-110 active:brightness-90"
              >
                <img
                  className={gameAssets.buttons[1].className}
                  alt={gameAssets.buttons[1].alt}
                  src={gameAssets.buttons[1].src}
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
      />
    </>
  );
}; 