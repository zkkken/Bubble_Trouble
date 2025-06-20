/**
 * 测试模式指示器组件
 * 显示独立测试模式状态，强调无需 Devvit 设置
 * 
 * @author 开发者B - UI/UX 界面负责人
 */

import React from 'react';
import { isTestMode, isBoltPreview, isStandaloneMode, getTestConfig } from '../config/testMode';

export const TestModeIndicator: React.FC = () => {
  if (!isTestMode()) return null;

  const config = getTestConfig();
  const inBoltPreview = isBoltPreview();
  const isStandalone = isStandaloneMode();

  return (
    <div className="fixed top-2 left-2 z-50 max-w-xs">
      {/* 主要指示器 */}
      <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-lg border-2 border-green-300 mb-2">
        <div className="flex items-center gap-2">
          <span>
            {inBoltPreview ? '🚀 BOLT PREVIEW' : '🧪 STANDALONE TEST'}
          </span>
          <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
            READY!
          </span>
        </div>
        <div className="text-xs mt-1 opacity-90">
          {inBoltPreview ? 'Perfect for testing!' : 'Independent mode'}
        </div>
      </div>

      {/* 状态指示器 */}
      {isStandalone && (
        <div className="bg-gray-800 text-green-400 px-3 py-2 rounded-lg text-xs shadow-lg border border-green-500">
          <div className="font-bold mb-1">✅ BYPASSED:</div>
          <div className="space-y-1">
            <div>• Reddit Authentication</div>
            <div>• App Initialization</div>
            <div>• Subreddit Setup</div>
          </div>
          <div className="mt-2 text-yellow-400 font-bold">
            🎮 Ready to Play!
          </div>
        </div>
      )}

      {/* 调试信息 */}
      {config.showDebugInfo && (
        <div className="mt-2 bg-black bg-opacity-50 text-yellow-300 px-2 py-1 rounded text-xs">
          Debug: ON | Local Storage: ON
        </div>
      )}
    </div>
  );
};