import React from 'react';
import { GameState } from '../types/GameTypes';

interface GameOverlayProps {
  gameState: GameState;
  onRestart: () => void;
}

export const GameOverlay: React.FC<GameOverlayProps> = ({ gameState, onRestart }) => {
  if (gameState.gameStatus === 'playing') return null;

  const isSuccess = gameState.gameStatus === 'success';

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 text-center shadow-2xl max-w-sm mx-4">
        <div className="text-6xl mb-4">
          {isSuccess ? '🎉' : '😿'}
        </div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {isSuccess ? 'Bath Complete!' : 'Game Over'}
        </h2>
        <p className="text-gray-600 mb-6">
          {isSuccess 
            ? 'You successfully gave the cat a perfect bath!' 
            : gameState.gameTimer <= 0 
              ? 'Time ran out! The cat got impatient.' 
              : 'The cat became too uncomfortable and ran away!'
          }
        </p>
        <button
          onClick={onRestart}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};