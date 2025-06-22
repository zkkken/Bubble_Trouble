/**
 * 分数提交模态框组件 (复合分数版本)
 * Score Submission Modal Component (Composite Score Version)
 * 
 * @author 开发者B - UI/UX 界面负责人
 */

import React, { useState } from 'react';

interface ScoreSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    playerName: string, 
    difficulty: 'easy' | 'medium' | 'hard',
    countryCode: string
  ) => void;
  gameStats: {
    roundsCompleted: number;
    totalTime: number;
    finalComfort: number;
  };
  userCountryCode?: string; // 用户的国家代码
}

// 常见国家列表
const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
];

export const ScoreSubmissionModal: React.FC<ScoreSubmissionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  gameStats,
  userCountryCode = 'US'
}) => {
  const [playerName, setPlayerName] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [countryCode, setCountryCode] = useState(userCountryCode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!playerName.trim()) {
      alert('Please enter your name!');
      return;
    }

    if (!countryCode) {
      alert('Please select your country!');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(playerName.trim(), difficulty, countryCode);
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

  const calculateEstimatedRawScore = (): number => {
    const baseScore = gameStats.roundsCompleted * 1000;
    const timeBonus = Math.max(0, (180 - gameStats.totalTime) * 10);
    const comboBonus = gameStats.roundsCompleted > 1 ? (gameStats.roundsCompleted - 1) * 500 : 0;
    const difficultyMultiplier = { easy: 1.0, medium: 1.5, hard: 2.0 }[difficulty];
    
    return Math.round((baseScore + timeBonus + comboBonus) * difficultyMultiplier);
  };

  const calculateEstimatedCompositeScore = (): number => {
    const rawScore = calculateEstimatedRawScore();
    const COMPOSITE_SCORE_MULTIPLIER = 10000000;
    return (gameStats.roundsCompleted * COMPOSITE_SCORE_MULTIPLIER) + rawScore;
  };

  if (!isOpen) return null;

  const selectedCountry = COUNTRIES.find(c => c.code === countryCode);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6 rounded-t-lg">
          <div className="text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h2 className="text-2xl font-bold">Great Job!</h2>
            <p className="text-green-100 mt-1">Submit your composite score to the leaderboard</p>
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

          {/* Country selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Country
            </label>
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
            {selectedCountry && (
              <p className="text-xs text-gray-500 mt-1">
                You'll compete in the {selectedCountry.name} leaderboard
              </p>
            )}
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

          {/* Estimated scores */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="text-center">
              <div className="text-sm text-blue-600 mb-1">Estimated Scores</div>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-blue-600">Raw Score: </span>
                  <span className="text-lg font-bold text-blue-700">
                    {calculateEstimatedRawScore().toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-blue-600">Composite Score: </span>
                  <span className="text-lg font-bold text-blue-700">
                    {calculateEstimatedCompositeScore().toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="text-xs text-blue-500 mt-2">
                Ranking priority: Rounds first, then raw score
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