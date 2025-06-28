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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className={`w-[600px] h-[500px] bg-gradient-to-b from-[#87ceeb] to-[#4682b4] border-4 border-[#2c5aa0] rounded-2xl relative overflow-hidden shadow-2xl transform transition-all duration-500 ease-out ${
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
          <div className="absolute top-4 left-8 w-6 h-6 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
          <div className="absolute top-12 right-12 w-4 h-4 bg-white/15 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
          <div className="absolute bottom-16 left-16 w-8 h-8 bg-white/10 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
          <div className="absolute bottom-8 right-8 w-5 h-5 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }}></div>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-[#2c5aa0] to-[#1e3a8a] px-6 py-4 border-b-4 border-[#1e3a8a] flex items-center justify-between shadow-lg relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          <h2 className="font-bold text-white text-3xl drop-shadow-lg relative z-10">
            GAME INSTRUCTIONS
          </h2>
          <button
            onClick={handleClose}
            className="w-10 h-10 bg-gradient-to-b from-[#ff6b6b] to-[#ff4444] hover:from-[#ff8888] hover:to-[#ff6666] active:from-[#cc3333] active:to-[#aa2222] border-3 border-[#cc3333] hover:border-[#aa2222] rounded-lg flex items-center justify-center text-white font-bold text-xl transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl relative z-10 group"
          >
            <span className="group-hover:rotate-90 transition-transform duration-200">×</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 text-white font-bold space-y-6 overflow-y-auto max-h-[380px]">
          {/* Objective */}
          <div className={`transform transition-all duration-700 delay-100 ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}>
            <h3 className="text-[#ffeb3b] text-xl font-bold mb-4 flex items-center gap-3 drop-shadow-md">
              <div className="w-3 h-3 bg-[#ffeb3b] rounded-full animate-pulse shadow-lg"></div>
              OBJECTIVE
            </h3>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-inner">
              <p className="text-base leading-relaxed text-white/90">
                Keep the cat comfortable by controlling the shower temperature! Maintain optimal comfort levels while dealing with control interference.
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className={`transform transition-all duration-700 delay-200 ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}>
            <h3 className="text-[#ffeb3b] text-xl font-bold mb-4 flex items-center gap-3 drop-shadow-md">
              <div className="w-3 h-3 bg-[#ffeb3b] rounded-full animate-pulse shadow-lg"></div>
              CONTROLS
            </h3>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-inner space-y-4">
              <div className="flex items-center gap-4 group">
                <div className="w-20 h-10 bg-gradient-to-b from-[#ffffff] to-[#e0e0e0] border-2 border-[#cccccc] rounded-lg flex items-center justify-center text-black font-bold text-sm shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
                  - / +
                </div>
                <span className="text-white/90 group-hover:text-white transition-colors duration-200">Adjust temperature</span>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-20 h-10 bg-gradient-to-b from-[#ffffff] to-[#e0e0e0] border-2 border-[#cccccc] rounded-lg flex items-center justify-center text-black font-bold text-sm shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
                  🔧
                </div>
                <span className="text-white/90 group-hover:text-white transition-colors duration-200">Center interaction button</span>
              </div>
            </div>
          </div>

          {/* Game Rules */}
          <div className={`transform transition-all duration-700 delay-300 ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}>
            <h3 className="text-[#ffeb3b] text-xl font-bold mb-4 flex items-center gap-3 drop-shadow-md">
              <div className="w-3 h-3 bg-[#ffeb3b] rounded-full animate-pulse shadow-lg"></div>
              GAME RULES
            </h3>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-inner">
              <ul className="space-y-3 text-white/90">
                <li className="flex items-start gap-3 hover:text-white hover:translate-x-1 transition-all duration-200">
                  <span className="text-[#4fc3f7] mt-1 text-lg">•</span>
                  <span>Keep the cat's comfort level high (green zone)</span>
                </li>
                <li className="flex items-start gap-3 hover:text-white hover:translate-x-1 transition-all duration-200">
                  <span className="text-[#4fc3f7] mt-1 text-lg">•</span>
                  <span>Complete multiple rounds to win</span>
                </li>
                <li className="flex items-start gap-3 hover:text-white hover:translate-x-1 transition-all duration-200">
                  <span className="text-[#ff6b6b] mt-1 text-lg">•</span>
                  <span>Watch out for control reversal interference!</span>
                </li>
                <li className="flex items-start gap-3 hover:text-white hover:translate-x-1 transition-all duration-200">
                  <span className="text-[#4fc3f7] mt-1 text-lg">•</span>
                  <span>Time matters - faster completion scores higher</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Tips */}
          <div className={`transform transition-all duration-700 delay-400 ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}>
            <h3 className="text-[#ffeb3b] text-xl font-bold mb-4 flex items-center gap-3 drop-shadow-md">
              <div className="w-3 h-3 bg-[#ffeb3b] rounded-full animate-pulse shadow-lg"></div>
              TIPS & TRICKS
            </h3>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-inner">
              <ul className="space-y-3 text-white/90">
                <li className="flex items-start gap-3 hover:text-white hover:translate-x-1 transition-all duration-200">
                  <span className="text-[#ffd700] mt-1">💡</span>
                  <span>Watch the visual cues for interference events</span>
                </li>
                <li className="flex items-start gap-3 hover:text-white hover:translate-x-1 transition-all duration-200">
                  <span className="text-[#ffd700] mt-1">💡</span>
                  <span>Use smooth, gradual temperature adjustments</span>
                </li>
                <li className="flex items-start gap-3 hover:text-white hover:translate-x-1 transition-all duration-200">
                  <span className="text-[#ffd700] mt-1">💡</span>
                  <span>Keep an eye on the timer to plan your strategy</span>
                </li>
                <li className="flex items-start gap-3 hover:text-white hover:translate-x-1 transition-all duration-200">
                  <span className="text-[#ffd700] mt-1">💡</span>
                  <span>Practice makes purr-fect!</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-[#2c5aa0] to-[#1e3a8a] px-6 py-4 border-t-4 border-[#1e3a8a] shadow-lg">
          <div className="text-center">
            <button
              onClick={handleClose}
              className={`px-8 py-3 bg-gradient-to-b from-[#4fc3f7] to-[#29b6f6] hover:from-[#81d4fa] hover:to-[#4fc3f7] active:from-[#29b6f6] active:to-[#0288d1] border-3 border-[#0288d1] hover:border-[#01579b] rounded-xl text-white font-bold text-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl transform ${
                isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{ transitionDelay: '500ms' }}
            >
              GOT IT!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 