import React, { useEffect, useState } from "react";
import { useResponsiveScale, useResponsiveSize } from '../hooks/useResponsiveScale';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  // 响应式设计hooks
  const { cssVars } = useResponsiveScale();
  const { scale } = useResponsiveSize();

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Reset animation state after animation completes
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(true);
    // Delay the actual close to allow exit animation
    setTimeout(() => {
      onClose();
      setIsAnimating(false);
    }, 300);
  };

  const handleStartClick = () => {
    console.log("Start button clicked from help modal!");
    handleClose(); // Close modal when start is clicked
  };

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Cat images data for mapping - 使用与项目相同的图片加载方式
  const cats = [
    { src: "/Cat_1.png", width: 48, height: 48 },
    { src: "/Cat_2.png", width: 41, height: 41 },
    { src: "/Cat_4.png", width: 43, height: 43 },
    { src: "/Cat_3.png", width: 36, height: 50 },
    { src: "/Cat_5.png", width: 38, height: 38 },
    { src: "/Cat_6.png", width: 44, height: 48 },
    { src: "/Cat_7.png", width: 38, height: 43 },
  ];

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
      <div 
        className={`transform transition-all duration-500 ease-out ${
          isAnimating && isOpen 
            ? 'scale-100 opacity-100 translate-y-0 rotate-0' 
            : isOpen 
              ? 'scale-100 opacity-100 translate-y-0 rotate-0'
              : 'scale-75 opacity-0 translate-y-8 rotate-3'
        }`}
        style={{ 
          fontFamily: '"Pixelify Sans", sans-serif', 
          fontWeight: 400, 
          fontStyle: 'normal',
          lineHeight: 'normal',
          ...cssVars
        }}
      >
        {/* 主容器移除背景图片 */}
        <div 
          className="relative"
          style={{
            width: `${scale(724)}px`,
            height: `${scale(584)}px`
          }}
        >
          {/* 使用原始div而不是Card组件，完全匹配参考HTML */}
          <div 
            className="text-card-foreground shadow flex flex-col justify-center border-solid border-white items-center absolute"
            style={{
              width: `${scale(630)}px`,
              height: `${scale(470)}px`,
              gap: `${scale(10)}px`,
              paddingLeft: `${scale(33)}px`,
              paddingRight: `${scale(33)}px`,
              paddingTop: `${scale(36)}px`,
              paddingBottom: `${scale(36)}px`,
              top: `${scale(74)}px`,
              left: `${scale(47)}px`,
              backgroundColor: '#d4f5ff',
              borderRadius: `${scale(49.42)}px`,
              borderWidth: `${scale(6)}px`
            }}
          >
            <div 
              className="flex flex-col items-center p-0"
              style={{
                width: `${scale(621)}px`,
                gap: `${scale(9)}px`
              }}
            >
              {/* 猫咪图片展示 */}
              <div 
                className="inline-flex items-center"
                style={{
                  gap: `${scale(10)}px`,
                  marginTop: `${scale(30)}px`
                }}
              >
                {cats.map((cat, index) => (
                  <img
                    key={`cat-${index}`}
                    className="relative hover:scale-110 transition-transform duration-200"
                    style={{
                      width: `${scale(cat.width)}px`,
                      height: `${scale(cat.height)}px`
                    }}
                    alt="Cat"
                    src={cat.src}
                  />
                ))}
              </div>

              {/* 标题图片 - 替换文字为图片 */}
              <img
                className="relative self-stretch mx-auto"
                alt="Keep your cat comfortable!"
                src="/keep-your-cat-comfortable.png"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  objectFit: 'contain'
                }}
              />

              {/* 第一个说明面板 */}
              <div 
                className="text-card-foreground shadow flex items-center hover:bg-[#ddf4ff] transition-colors duration-200" 
                style={{ 
                  width: `${scale(551)}px`,
                  height: `${scale(57)}px`,
                  gap: `${scale(10)}px`,
                  paddingLeft: `${scale(24)}px`,
                  paddingRight: `${scale(24)}px`,
                  paddingTop: `${scale(7)}px`,
                  paddingBottom: `${scale(7)}px`,
                  borderRadius: `${scale(15)}px`, 
                  background: '#E7FAFF' 
                }}
              >
                <div className="p-0">
                  <div 
                    className="relative w-fit text-black tracking-[0] leading-[normal]" 
                    style={{ 
                      fontFamily: '"Pixelify Sans", sans-serif', 
                      fontWeight: 400, 
                      fontStyle: 'normal',
                      lineHeight: 'normal',
                      fontSize: `${scale(20)}px`
                    }}
                  >
                    [🌡] Adjust the water temperature using + and –<br />
                    [💖] stay in the orange zone to stay comfortable
                  </div>
                </div>
              </div>

              {/* 第二个说明面板 */}
              <div 
                className="text-card-foreground shadow flex items-center hover:bg-[#ddf4ff] transition-colors duration-200" 
                style={{ 
                  width: `${scale(551)}px`,
                  height: `${scale(150)}px`,
                  gap: `${scale(10)}px`,
                  paddingLeft: `${scale(24)}px`,
                  paddingRight: `${scale(24)}px`,
                  paddingTop: `${scale(7)}px`,
                  paddingBottom: `${scale(7)}px`,
                  borderRadius: `${scale(15)}px`, 
                  background: '#E7FAFF' 
                }}
              >
                <div className="p-0">
                  <div 
                    className="relative w-fit text-black tracking-[0] leading-[normal]" 
                    style={{ 
                      fontFamily: '"Pixelify Sans", sans-serif', 
                      fontWeight: 400, 
                      fontStyle: 'normal',
                      lineHeight: 'normal',
                      fontSize: `${scale(20)}px`
                    }}
                  >
                    [⚡] Bar moves unpredictably<br />
                    [🥶] Temperature drops instantly<br />
                    [🤡] Controls are reversed<br />
                    [🫧] Tap to boost comfort<br />
                    [🎁] Catch to gain bonus or avoid penalty
                  </div>
                </div>
              </div>

              {/* 第三个说明面板 */}
              <div 
                className="text-card-foreground shadow flex items-center hover:bg-[#ddf4ff] transition-colors duration-200" 
                style={{ 
                  width: `${scale(551)}px`,
                  height: `${scale(57)}px`,
                  gap: `${scale(10)}px`,
                  paddingLeft: `${scale(24)}px`,
                  paddingRight: `${scale(24)}px`,
                  paddingTop: `${scale(7)}px`,
                  paddingBottom: `${scale(7)}px`,
                  borderRadius: `${scale(15)}px`, 
                  background: '#E7FAFF' 
                }}
              >
                <div className="p-0">
                  <div 
                    className="relative w-fit text-black tracking-[0] leading-[normal]" 
                    style={{ 
                      fontFamily: '"Pixelify Sans", sans-serif', 
                      fontWeight: 400, 
                      fontStyle: 'normal',
                      lineHeight: 'normal',
                      fontSize: `${scale(20)}px`
                    }}
                  >
                    [🥇] Maintain max comfort for 5 seconds<br />
                    [☠] Comfort hits zero or time runs out
                  </div>
                </div>
              </div>
            </div>

            {/* 说明标题图片 */}
            <img
              className="absolute object-cover"
              style={{
                width: `${scale(119)}px`,
                height: `${scale(94)}px`,
                top: `${scale(-56)}px`,
                left: `${scale(250)}px`
              }}
              alt="Instructions title"
              src="/instructions-title.png"
            />

            {/* 关闭按钮 */}
            <button
              onClick={handleClose}
              className="absolute cursor-pointer transition-all duration-200 hover:scale-105 hover:brightness-110 active:scale-95 focus:outline-none rounded-lg"
              style={{
                width: `${scale(110)}px`,
                height: `${scale(51)}px`,
                top: `${scale(445)}px`,
                left: `${scale(180)}px`
              }}
              aria-label="Close"
            >
              <img
                className="w-full h-full pointer-events-none"
                alt="Close button"
                src="/Close button.png"
              />
            </button>

            {/* 开始游戏按钮 */}
            <button
              onClick={handleStartClick}
              className="absolute cursor-pointer transition-all duration-200 hover:scale-105 hover:brightness-110 active:scale-95 focus:outline-none rounded-lg"
              style={{
                width: `${scale(110)}px`,
                height: `${scale(51)}px`,
                top: `${scale(445)}px`,
                left: `${scale(320)}px`
              }}
              aria-label="Start game"
            >
              <img
                className="w-full h-full pointer-events-none"
                alt="Start button"
                src="/start-button.png"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 