/**
 * 简化的分数提交模态框组件
 * 现在只用于显示分数，不再收集用户信息
 * 
 * @author 开发者B - UI/UX 界面负责人
 */

import React from 'react';

interface ScoreSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameStats: {
    roundsCompleted: number;
    totalTime: number;
    finalComfort: number;
  };
}

export const ScoreSubmissionModal: React.FC<ScoreSubmissionModalProps> = ({
  isOpen,
  onClose,
  gameStats,
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const isSuccess = gameStats.roundsCompleted > 0 && gameStats.finalComfort >= 0.8;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className={`${isSuccess ? 'bg-gradient-to-r from-green-500 to-blue-600' : 'bg-gradient-to-r from-red-500 to-orange-600'} text-white p-6 rounded-t-lg`}>
          <div className="text-center">
            <div className="text-4xl mb-2">{isSuccess ? '🎉' : '😿'}</div>
            <h2 className="text-2xl font-bold">
              {isSuccess ? 'Game Complete!' : 'Game Over'}
            </h2>
            <p className={`${isSuccess ? 'text-green-100' : 'text-red-100'} mt-1`}>
              {isSuccess ? 'Well done!' : 'Better luck next time!'}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Game stats */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-gray-800 mb-3">Final Results</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Rounds Completed:</span>
                <span className="font-bold text-blue-600">{gameStats.roundsCompleted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Time:</span>
                <span className="font-bold text-blue-600">{formatTime(gameStats.totalTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Final Comfort:</span>
                <span className="font-bold text-blue-600">{Math.round(gameStats.finalComfort * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};