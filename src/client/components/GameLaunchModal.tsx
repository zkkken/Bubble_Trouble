import React, { useEffect, useState } from "react";
import { Modal } from "./ui/modal";

interface GameLaunchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GameLaunchModal: React.FC<GameLaunchModalProps> = ({ isOpen, onClose }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onClose();
      setIsAnimating(false);
    }, 300);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div 
        className={`w-[600px] h-[500px] bg-gradient-to-b from-blue-300 to-blue-600 border-4 border-blue-800 rounded-2xl relative overflow-hidden shadow-2xl transform transition-all duration-500 ease-out ${
          isAnimating && isOpen 
            ? 'scale-100 opacity-100 translate-y-0 rotate-0' 
            : isOpen 
              ? 'scale-100 opacity-100 translate-y-0 rotate-0'
              : 'scale-75 opacity-0 translate-y-8 rotate-3'
        }`}
        style={{
          background: 'linear-gradient(135deg, #87ceeb 0%, #4682b4 50%, #2c5aa0 100%)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.2)'
        }}
      >
        {/* Decorative bubbles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-4 left-8 w-6 h-6 bg-white bg-opacity-20 rounded-full animate-bounce"></div>
          <div className="absolute top-12 right-12 w-4 h-4 bg-white bg-opacity-15 rounded-full animate-bounce"></div>
          <div className="absolute bottom-16 left-16 w-8 h-8 bg-white bg-opacity-10 rounded-full animate-bounce"></div>
          <div className="absolute bottom-8 right-8 w-5 h-5 bg-white bg-opacity-20 rounded-full animate-bounce"></div>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-6 py-4 border-b-4 border-blue-900 flex items-center justify-between shadow-lg relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white via-opacity-5 to-transparent"></div>
          <h2 className="font-bold text-white text-3xl drop-shadow-lg relative z-10" style={{ fontFamily: 'Courier New, monospace' }}>
            游戏说明
          </h2>
          <button
            onClick={handleClose}
            className="w-10 h-10 bg-gradient-to-b from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 border-2 border-red-700 rounded-lg flex items-center justify-center text-white font-bold text-xl transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg relative z-10"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-8 text-white space-y-6 overflow-y-auto max-h-80" style={{ fontFamily: 'Courier New, monospace' }}>
          {/* Objective */}
          <div className={`transform transition-all duration-700 delay-100 ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}>
            <h3 className="text-yellow-300 text-xl font-bold mb-4 flex items-center gap-3 drop-shadow-md">
              <div className="w-3 h-3 bg-yellow-300 rounded-full animate-pulse shadow-lg"></div>
              游戏目标
            </h3>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20 shadow-inner">
              <p className="text-base leading-relaxed text-white text-opacity-90">
                帮助可爱的小猫找到完美的洗澡温度！调节水温，让小猫感到舒适愉快。
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className={`transform transition-all duration-700 delay-200 ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}>
            <h3 className="text-yellow-300 text-xl font-bold mb-4 flex items-center gap-3 drop-shadow-md">
              <div className="w-3 h-3 bg-yellow-300 rounded-full animate-pulse shadow-lg"></div>
              控制方式
            </h3>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20 shadow-inner space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-10 bg-gradient-to-b from-white to-gray-200 border-2 border-gray-400 rounded-lg flex items-center justify-center text-black font-bold text-sm shadow-md">
                  + 按钮
                </div>
                <span className="text-white text-opacity-90">提高水温</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-20 h-10 bg-gradient-to-b from-white to-gray-200 border-2 border-gray-400 rounded-lg flex items-center justify-center text-black font-bold text-sm shadow-md">
                  - 按钮
                </div>
                <span className="text-white text-opacity-90">降低水温</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-20 h-10 bg-gradient-to-b from-white to-gray-200 border-2 border-gray-400 rounded-lg flex items-center justify-center text-black font-bold text-sm shadow-md">
                  中心
                </div>
                <span className="text-white text-opacity-90">与小猫互动</span>
              </div>
            </div>
          </div>

          {/* Game Rules */}
          <div className={`transform transition-all duration-700 delay-300 ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}>
            <h3 className="text-yellow-300 text-xl font-bold mb-4 flex items-center gap-3 drop-shadow-md">
              <div className="w-3 h-3 bg-yellow-300 rounded-full animate-pulse shadow-lg"></div>
              游戏规则
            </h3>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20 shadow-inner">
              <ul className="space-y-3 text-white text-opacity-90">
                <li className="flex items-start gap-3">
                  <span className="text-blue-300 mt-1 text-lg">•</span>
                  <span>观察小猫的表情来判断水温是否合适</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-300 mt-1 text-lg">•</span>
                  <span>温度过高或过低都会让小猫不舒服</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-300 mt-1 text-lg">•</span>
                  <span>找到完美温度让小猫开心</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-300 mt-1 text-lg">•</span>
                  <span>完成挑战获得高分</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-blue-800 to-blue-900 px-6 py-4 border-t-4 border-blue-900 shadow-lg">
          <div className="text-center">
            <button
              onClick={handleClose}
              className={`px-8 py-3 bg-gradient-to-b from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 border-2 border-blue-700 rounded-xl text-white font-bold text-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg transform ${
                isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{ transitionDelay: '500ms' }}
            >
              明白了！
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}; 