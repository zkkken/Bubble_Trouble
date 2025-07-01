import React from 'react';
import ReactDOM from 'react-dom/client';
import { CatComfortGame } from './CatComfortGame';
import { ErrorBoundary } from './components/ErrorBoundary';
import { audioManager } from './services/audioManager';
import { globalPreloadStrategy } from './utils/imageOptimization';
import './index.css';

console.log('🚀 Main.tsx: Starting application initialization');

// 检查环境
const hostname = window.location.hostname;
const port = window.location.port;
console.log('🔍 Environment check:', { hostname, port });

// 移除内联脚本，改为在这里处理错误抑制
const suppressDevvitErrors = () => {
  // 抑制 Devvit 内部错误
  window.addEventListener('error', (event) => {
    if (event.message && (
      event.message.includes('AsyncLocalStorage') ||
      event.message.includes('beforeinstallprompt') ||
      (event.filename && (
        event.filename.includes('devvit-runtime') ||
        event.filename.includes('dist-') ||
        event.filename.includes('shell-') ||
        event.filename.includes('icon-')
      ))
    )) {
      console.log('🔇 Suppressed Devvit internal error:', event.message);
      event.preventDefault();
      return false;
    }
  });
  
  // 抑制未处理的 Promise 拒绝
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && 
        event.reason.message.includes('AsyncLocalStorage')) {
      console.log('🔇 Suppressed Devvit internal promise rejection');
      event.preventDefault();
      return false;
    }
  });
  
  // 禁用 PWA 安装提示
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    return false;
  });
};

// 图片预加载初始化函数
const initImagePreloading = async () => {
  console.log('🖼️ Starting critical image preloading...');
  
  try {
    // 立即开始预加载启动界面关键图片
    await globalPreloadStrategy.preloadForLaunch();
    console.log('✅ Launch images preloaded successfully');
    
    // 延迟预加载游戏核心图片
    setTimeout(async () => {
      try {
        await globalPreloadStrategy.preloadForGame();
        console.log('✅ Game images preloaded successfully');
      } catch (error) {
        console.warn('⚠️ Game images preload failed:', error);
      }
    }, 1000);
    
    // 进一步延迟预加载其他页面图片
    setTimeout(async () => {
      try {
        await Promise.allSettled([
          globalPreloadStrategy.preloadForTutorial(),
          globalPreloadStrategy.preloadForSelection(),
          globalPreloadStrategy.preloadForCompletion()
        ]);
        console.log('✅ Additional page images preloaded');
      } catch (error) {
        console.warn('⚠️ Additional images preload failed:', error);
      }
    }, 3000);
    
  } catch (error) {
    console.error('❌ Critical image preload failed:', error);
    // 即使预加载失败也要继续渲染应用
  }
};

// 初始化错误抑制
suppressDevvitErrors();

// 禁用 Service Worker 注册以避免 fetch 事件处理器警告
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  }).catch(err => {
    console.log('Service Worker cleanup failed:', err);
  });
}

console.log('🎯 Application starting');

// 初始化音频管理器 - 确保用户交互监听器已设置
console.log('🎵 Audio Manager initialized - ready for user interaction');

// 页面卸载时清理音频资源
window.addEventListener('beforeunload', () => {
  audioManager.dispose();
});

// 启动图片预加载（非阻塞）
initImagePreloading();

// 渲染应用
const rootElement = document.getElementById('root');
if (rootElement) {
  // 清除加载状态
  rootElement.innerHTML = '';
  
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <CatComfortGame />
      </ErrorBoundary>
    </React.StrictMode>,
  );
  
  console.log('Application rendered successfully');
} else {
  console.error('❌ Root element not found!');
}