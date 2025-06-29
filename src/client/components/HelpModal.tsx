import React, { useEffect, useState } from "react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [isAnimating, setIsAnimating] = useState(false);

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
    { src: "/Cat_1.png", width: "w-12", height: "h-12" },
    { src: "/Cat_2.png", width: "w-[41px]", height: "h-[41px]" },
    { src: "/Cat_2-1.png", width: "w-[43px]", height: "h-[43px]" },
    { src: "/Cat_3.png", width: "w-9", height: "h-[50px]" },
    { src: "/Cat_5.png", width: "w-[38px]", height: "h-[38px]" },
    { src: "/Cat_6.png", width: "w-11", height: "h-12" },
    { src: "/Cat_7.png", width: "w-[38px]", height: "h-[43px]" },
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
        style={{ fontFamily: '"lores-12", sans-serif', fontWeight: 400, fontStyle: 'normal' }}
      >
        {/* 主容器使用help页面的背景图片 */}
        <div className="w-[724px] h-[584px] bg-[url(/bg-main.png)] bg-[100%_100%] relative">
          {/* 使用原始div而不是Card组件，完全匹配参考HTML */}
          <div className="text-card-foreground shadow flex flex-col w-[630px] h-[470px] justify-center gap-2.5 px-[33px] py-9 top-[74px] left-[47px] bg-[#d4f5ff] rounded-[49.42px] border-[6px] border-solid border-white items-center absolute">
            <div className="flex flex-col w-[621px] gap-[9px] items-center p-0">
              {/* 猫咪图片展示 */}
              <div className="inline-flex gap-2.5 items-center mt-[30px]">
                {cats.map((cat, index) => (
                  <img
                    key={`cat-${index}`}
                    className={`relative ${cat.width} ${cat.height} hover:scale-110 transition-transform duration-200`}
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
              <div className="text-card-foreground shadow flex w-[551px] h-[57px] gap-2.5 px-6 py-[7px] items-center hover:bg-[#ddf4ff] transition-colors duration-200" style={{ borderRadius: '15px', background: '#E7FAFF' }}>
                <div className="p-0">
                  <div className="relative w-fit text-black text-xl tracking-[0] leading-[normal]" style={{ fontFamily: '"lores-12", sans-serif', fontWeight: 400, fontStyle: 'normal' }}>
                    [🌡] Adjust the water temperature using + and –<br />
                    [💖] stay in the orange zone to stay comfortable
                  </div>
                </div>
              </div>

              {/* 第二个说明面板 */}
              <div className="text-card-foreground shadow flex w-[551px] h-[150px] gap-2.5 px-6 py-[7px] items-center hover:bg-[#ddf4ff] transition-colors duration-200" style={{ borderRadius: '15px', background: '#E7FAFF' }}>
                <div className="p-0">
                  <div className="relative w-fit text-black text-xl tracking-[0] leading-[normal]" style={{ fontFamily: '"lores-12", sans-serif', fontWeight: 400, fontStyle: 'normal' }}>
                    [⚡] Bar moves unpredictably<br />
                    [🥶] Temperature drops instantly<br />
                    [🤡] Controls are reversed<br />
                    [🫧] Tap to boost comfort<br />
                    [🎁] Catch to gain bonus or avoid penalty
                  </div>
                </div>
              </div>

              {/* 第三个说明面板 */}
              <div className="text-card-foreground shadow flex w-[551px] h-[57px] gap-2.5 px-6 py-[7px] items-center hover:bg-[#ddf4ff] transition-colors duration-200" style={{ borderRadius: '15px', background: '#E7FAFF' }}>
                <div className="p-0">
                  <div className="relative w-fit text-black text-xl tracking-[0] leading-[normal]" style={{ fontFamily: '"lores-12", sans-serif', fontWeight: 400, fontStyle: 'normal' }}>
                    [🥇] Maintain max comfort for 5 seconds<br />
                    [☠] Comfort hits zero or time runs out
                  </div>
                </div>
              </div>
            </div>

            {/* 说明标题图片 */}
            <img
              className="absolute w-[119px] h-[94px] -top-14 left-[250px] object-cover"
              alt="Instructions title"
              src="/instructions-title.png"
            />

            {/* 关闭按钮 */}
            <button
              onClick={handleClose}
              className="absolute w-[110px] h-[51px] top-[445px] left-[180px] cursor-pointer transition-all duration-200 hover:scale-105 hover:brightness-110 active:scale-95 focus:outline-none rounded-lg"
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
              className="absolute w-[110px] h-[51px] top-[445px] left-[320px] cursor-pointer transition-all duration-200 hover:scale-105 hover:brightness-110 active:scale-95 focus:outline-none rounded-lg"
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