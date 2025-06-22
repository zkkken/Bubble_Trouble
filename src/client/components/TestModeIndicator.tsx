/**
 * 测试模式指示器组件
 * 显示独立测试模式状态，强调无需 Devvit 设置
 * 
 * @author 开发者B - UI/UX 界面负责人
 */

import React, { useState, useEffect } from 'react';
import { isTestMode, isBoltPreview, isStandaloneMode, getTestConfig } from '../config/testMode';

export const TestModeIndicator: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [environmentInfo, setEnvironmentInfo] = useState<any>({});

  useEffect(() => {
    // 收集环境信息
    setEnvironmentInfo({
      hostname: window.location.hostname,
      port: window.location.port,
      pathname: window.location.pathname,
      search: window.location.search,
      userAgent: navigator.userAgent.substring(0, 50) + '...',
      testMode: isTestMode(),
      boltPreview: isBoltPreview(),
      standaloneMode: isStandaloneMode(),
      globalFlags: {
        __TEST_MODE__: (window as any).__TEST_MODE__,
        __SKIP_DEVVIT__: (window as any).__SKIP_DEVVIT__,
        __STANDALONE_GAME__: (window as any).__STANDALONE_GAME__,
        __BOLT_PREVIEW__: (window as any).__BOLT_PREVIEW__,
        __FORCE_TEST_MODE__: (window as any).__FORCE_TEST_MODE__
      }
    });
  }, []);

  if (!isTestMode()) {
    // 如果测试模式未启用，显示警告
    return (
      <div className="fixed top-2 left-2 z-50 max-w-xs">
        <div className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-lg border-2 border-red-300">
          <div className="flex items-center gap-2">
            <span>⚠️ TEST MODE DISABLED</span>
          </div>
          <div className="text-xs mt-1 opacity-90">
            Game may not work properly
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs underline mt-1"
          >
            Debug Info
          </button>
          {showDetails && (
            <div className="mt-2 text-xs bg-black bg-opacity-50 p-2 rounded">
              <pre>{JSON.stringify(environmentInfo, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    );
  }

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
        
        {/* 调试按钮 */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs underline mt-1 opacity-75 hover:opacity-100"
        >
          {showDetails ? 'Hide' : 'Show'} Debug
        </button>
      </div>

      {/* 状态指示器 */}
      {isStandalone && (
        <div className="bg-gray-800 text-green-400 px-3 py-2 rounded-lg text-xs shadow-lg border border-green-500 mb-2">
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
      {showDetails && (
        <div className="bg-black bg-opacity-90 text-green-300 px-3 py-2 rounded-lg text-xs shadow-lg border border-green-500 max-h-64 overflow-y-auto">
          <div className="font-bold mb-2">🔍 Debug Information:</div>
          <div className="space-y-1">
            <div><strong>Hostname:</strong> {environmentInfo.hostname}</div>
            <div><strong>Port:</strong> {environmentInfo.port || 'N/A'}</div>
            <div><strong>Test Mode:</strong> {environmentInfo.testMode ? '✅' : '❌'}</div>
            <div><strong>Bolt Preview:</strong> {environmentInfo.boltPreview ? '✅' : '❌'}</div>
            <div><strong>Standalone:</strong> {environmentInfo.standaloneMode ? '✅' : '❌'}</div>
          </div>
          
          <div className="mt-2">
            <strong>Global Flags:</strong>
            <div className="ml-2 text-xs">
              {Object.entries(environmentInfo.globalFlags || {}).map(([key, value]) => (
                <div key={key}>
                  {key}: {value ? '✅' : '❌'}
                </div>
              ))}
            </div>
          </div>
          
          {config.showDebugInfo && (
            <div className="mt-2 text-yellow-300">
              <strong>Config:</strong>
              <div className="ml-2 text-xs">
                <div>Skip Backend: {config.skipBackendCalls ? '✅' : '❌'}</div>
                <div>Local Storage: {config.useLocalStorage ? '✅' : '❌'}</div>
                <div>Debug Info: {config.showDebugInfo ? '✅' : '❌'}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};