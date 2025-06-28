/**
 * 开始游戏界面组件
 * 用户在此界面输入名字、选择大洲和猫咪头像
 * 
 * @author 开发者B - UI/UX 界面负责人
 */

import React, { useState } from 'react';

interface StartGameScreenProps {
  onStartGame: (playerInfo: {
    playerName: string;
    continentId: string;
    catAvatarId: string;
  }) => void;
}

// 随机名字列表
const RANDOM_NAMES = [
  'CatLover', 'WhiskerMaster', 'PurrfectPlayer', 'FelineHero', 'MeowChampion',
  'KittyKing', 'TabbyTamer', 'ClawsomeGamer', 'FurryFriend', 'CatNinja',
  'PawsomePro', 'WhiskerWizard', 'MeowMaster', 'KittenKnight', 'CatCommander',
  'PurrPlayer', 'FelineFan', 'WhiskerWarrior', 'CatCaptain', 'MeowMagician',
  'KittyChamp', 'PawPilot', 'CatCrafter', 'WhiskerWinner', 'PurrPioneer'
];

// 六大洲列表
const CONTINENTS = [
  { code: 'AS', name: 'Asia', flag: '🌏', description: 'The largest continent' },
  { code: 'EU', name: 'Europe', flag: '🌍', description: 'Rich in history and culture' },
  { code: 'AF', name: 'Africa', flag: '🌍', description: 'Cradle of humanity' },
  { code: 'NA', name: 'North America', flag: '🌎', description: 'Land of opportunity' },
  { code: 'SA', name: 'South America', flag: '🌎', description: 'Vibrant and diverse' },
  { code: 'OC', name: 'Oceania', flag: '🌏', description: 'Islands of wonder' },
];

// 猫咪头像列表
const CAT_AVATARS = [
  { id: '🐱', name: 'Classic Cat', emoji: '🐱' },
  { id: '🦁', name: 'Lion', emoji: '🦁' },
  { id: '🐯', name: 'Tiger', emoji: '🐯' },
  { id: '🐆', name: 'Leopard', emoji: '🐆' },
  { id: '😸', name: 'Happy Cat', emoji: '😸' },
  { id: '😻', name: 'Heart Eyes Cat', emoji: '😻' },
  { id: '🙀', name: 'Surprised Cat', emoji: '🙀' },
  { id: '😿', name: 'Crying Cat', emoji: '😿' },
];

export const StartGameScreen: React.FC<StartGameScreenProps> = ({ onStartGame }) => {
  const [playerName, setPlayerName] = useState('');
  const [continentId, setContinentId] = useState('');
  const [catAvatarId, setCatAvatarId] = useState('');

  // 生成随机名字
  const generateRandomName = () => {
    const randomIndex = Math.floor(Math.random() * RANDOM_NAMES.length);
    setPlayerName(RANDOM_NAMES[randomIndex]);
  };

  // 检查是否可以开始游戏
  const canStartGame = playerName.trim() && continentId && catAvatarId;

  // 处理开始游戏
  const handleStartGame = () => {
    if (!canStartGame) return;
    
    onStartGame({
      playerName: playerName.trim(),
      continentId,
      catAvatarId,
    });
  };

  const selectedContinent = CONTINENTS.find(c => c.code === continentId);
  const selectedAvatar = CAT_AVATARS.find(a => a.id === catAvatarId);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 via-blue-300 to-green-400">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4">
        {/* 标题区域 */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🐱</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Cat Comfort Game</h1>
          <p className="text-gray-600 text-lg">Keep your cat happy by controlling the temperature!</p>
        </div>

        {/* 玩家名字输入 */}
        <div className="mb-8">
          <label className="block text-lg font-semibold text-gray-700 mb-3">
            🎮 Your Player Name
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name..."
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              maxLength={20}
            />
            <button
              onClick={generateRandomName}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors duration-200 whitespace-nowrap"
            >
              🎲 Random
            </button>
          </div>
          {playerName && (
            <p className="text-sm text-green-600 mt-2">✓ Name: {playerName}</p>
          )}
        </div>

        {/* 大洲选择 */}
        <div className="mb-8">
          <label className="block text-lg font-semibold text-gray-700 mb-3">
            🌍 Choose Your Continent
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CONTINENTS.map((continent) => (
              <button
                key={continent.code}
                onClick={() => setContinentId(continent.code)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                  continentId === continent.code
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="text-3xl mb-2">{continent.flag}</div>
                <div className="font-semibold text-gray-800">{continent.name}</div>
                <div className="text-xs text-gray-500 mt-1">{continent.description}</div>
              </button>
            ))}
          </div>
          {selectedContinent && (
            <p className="text-sm text-green-600 mt-3">
              ✓ Selected: {selectedContinent.flag} {selectedContinent.name}
            </p>
          )}
        </div>

        {/* 猫咪头像选择 */}
        <div className="mb-8">
          <label className="block text-lg font-semibold text-gray-700 mb-3">
            😸 Choose Your Cat Avatar
          </label>
          <div className="grid grid-cols-4 gap-3">
            {CAT_AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => setCatAvatarId(avatar.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                  catAvatarId === avatar.id
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                title={avatar.name}
              >
                <div className="text-4xl mb-1">{avatar.emoji}</div>
                <div className="text-xs text-gray-600">{avatar.name}</div>
              </button>
            ))}
          </div>
          {selectedAvatar && (
            <p className="text-sm text-green-600 mt-3">
              ✓ Selected: {selectedAvatar.emoji} {selectedAvatar.name}
            </p>
          )}
        </div>

        {/* 开始游戏按钮 */}
        <div className="text-center">
          <button
            onClick={handleStartGame}
            disabled={!canStartGame}
            className={`px-8 py-4 rounded-lg font-bold text-xl transition-all duration-200 ${
              canStartGame
                ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {canStartGame ? '🚀 Start Game!' : '⚠️ Complete All Steps Above'}
          </button>
          
          {canStartGame && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-800 font-medium">Ready to play!</p>
              <div className="text-sm text-green-600 mt-2">
                Player: {playerName} | Continent: {selectedContinent?.name} | Avatar: {selectedAvatar?.emoji}
              </div>
            </div>
          )}
        </div>

        {/* 游戏说明 */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">🎯 How to Play:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Use +/- buttons to control temperature</li>
            <li>• Keep temperature in the target range (orange zone)</li>
            <li>• Maintain cat comfort above 80% to win each round</li>
            <li>• Watch out for interference events!</li>
            <li>• Complete multiple rounds with decreasing time limits</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

