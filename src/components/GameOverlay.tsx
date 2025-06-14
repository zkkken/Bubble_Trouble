import React from 'react';
import { GameState } from '../types/GameTypes';

interface GameOverlayProps {
  gameState: GameState;
  currentRound: number;
  onRestart: () => void;
  onNextRound: () => void;
}

export const GameOverlay: React.FC<GameOverlayProps> = ({ 
  gameState, 
  currentRound, 
  onRestart, 
  onNextRound 
}) => {
  if (gameState.gameStatus === 'playing') return null;

  const isSuccess = gameState.gameStatus === 'success';

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 text-center shadow-2xl max-w-sm mx-4">
        <div className="text-6xl mb-4">
          {isSuccess ? '🎉' : '😿'}
        </div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {isSuccess ? `Round ${currentRound} Complete!` : 'Round Failed'}
        </h2>
        <p className="text-gray-600 mb-6">
          {isSuccess 
            ? `You successfully completed round ${currentRound}! The cat is happy with comfort level: ${Math.round(gameState.currentComfort * 100)}%` 
            : `Time ran out! Final comfort level: ${Math.round(gameState.currentComfort * 100)}%`
          }
        </p>
        
        <div className="flex flex-col gap-3">
          {isSuccess && (
            <button
              onClick={onNextRound}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Next Round ({Math.max(10, 30 - (currentRound * 10))}s)
            </button>
          )}
          <button
            onClick={onRestart}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
};