import React from 'react';
import ReactDOM from 'react-dom/client';
import { CatComfortGame } from './CatComfortGame';
import { initTestMode, isTestMode, debugLog, forceEnableTestMode } from './config/testMode';
import './index.css';

// 强制初始化测试模式
console.log('🚀 Main.tsx: Starting application initialization');

// 检查环境
const hostname = window.location.hostname;
const port = window.location.port;
console.log('🔍 Environment check:', { hostname, port });

// 强制启用测试模式在特定环境下
if (hostname.includes('bolt') || 
    hostname.includes('stackblitz') || 
    hostname.includes('webcontainer') ||
    hostname === 'localhost' ||
    port === '7474' ||
    port === '5173') {
  console.log('🧪 Force enabling test mode for this environment');
  (window as any).__FORCE_TEST_MODE__ = true;
}

// 初始化测试模式
initTestMode();

// 验证测试模式状态
console.log('🎯 Test mode status:', {
  isTestMode: isTestMode(),
  testModeEnabled: (window as any).__TEST_MODE__,
  skipDevvit: (window as any).__SKIP_DEVVIT__,
  standaloneGame: (window as any).__STANDALONE_GAME__,
  boltPreview: (window as any).__BOLT_PREVIEW__
});

// 如果测试模式未启用，强制启用（同步方式）
if (!isTestMode()) {
  console.warn('⚠️ Test mode not detected, force enabling...');
  forceEnableTestMode();
}

debugLog('Application starting in test mode');

// 渲染应用
const rootElement = document.getElementById('root');
if (rootElement) {
  // 清除加载状态
  rootElement.innerHTML = '';
  
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <CatComfortGame />
    </React.StrictMode>,
  );
  
  debugLog('Application rendered successfully');
} else {
  console.error('❌ Root element not found!');
}