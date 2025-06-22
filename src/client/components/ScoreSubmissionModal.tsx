/**
 * 分数提交模态框组件
 * Score Submission Modal Component
 * 
 * @author 开发者B - UI/UX 界面负责人
 */

import React, { useState } from 'react';

interface ScoreSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (playerName: string, difficulty: 'easy' | 'medium' | 'hard') => void;
  gameStats: {
    roundsCompleted: number;
    totalTime: number;
    finalComfort: number;
  };
}

export const ScoreSubmissionModal: React.FC<ScoreSubmissionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  gameStats
}) => {
  const [playerName, setPlayerName] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!playerName.trim()) {
      alert('Please enter your name!');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(playerName.trim(), difficulty);
      onClose();
    } catch (error) {
      console.error('Error submitting score:', error);
      alert('Failed to submit score. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateEstimatedScore = (): number => {
    const baseScore = gameStats.roundsCompleted * 1000;
    const timeBonus = Math.max(0, (180 - gameStats.totalTime) * 10);
    const comboBonus = gameStats.roundsCompleted > 1 ? (gameStats.roundsCompleted - 1) * 500 : 0;
    const difficultyMultiplier = { easy: 1.0, medium: 1.5, hard: 2.0 }[difficulty];
    
    return Math.round((baseScore + timeBonus + comboBonus) * difficultyMultiplier);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6 rounded-t-lg">
          <div className="text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h2 className="text-2xl font-bold">Great Job!</h2>
            <p className="text-green-100 mt-1">Submit your score to the leaderboard</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Game stats */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-gray-800 mb-3">Your Performance</h3>
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

          {/* Player name input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={20}
            />
          </div>

          {/* Difficulty selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    difficulty === level
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-lg mb-1">
                    {level === 'easy' && '🟢'}
                    {level === 'medium' && '🟡'}
                    {level === 'hard' && '🔴'}
                  </div>
                  <div className="text-sm font-medium capitalize">{level}</div>
                  <div className="text-xs text-gray-500">
                    {level === 'easy' && '×1.0'}
                    {level === 'medium' && '×1.5'}
                    {level === 'hard' && '×2.0'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Estimated score */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="text-center">
              <div className="text-sm text-blue-600 mb-1">Estimated Score</div>
              <div className="text-2xl font-bold text-blue-700">
                {calculateEstimatedScore().toLocaleString()}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Skip
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !playerName.trim()}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg font-medium"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Score'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};