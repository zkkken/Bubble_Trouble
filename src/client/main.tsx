import React from 'react';
import ReactDOM from 'react-dom/client';
import { CatComfortGame } from './CatComfortGame';
import './index.css';

console.log('🚀 Main.tsx: Starting application initialization');

// 检查环境
const hostname = window.location.hostname;
const port = window.location.port;
console.log('🔍 Environment check:', { hostname, port });

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

// 禁用 PWA 安装横幅
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  return false;
});

// 添加全局错误处理
window.addEventListener('error', (event) => {
  // 忽略 Devvit 内部错误
  if (event.message.includes('AsyncLocalStorage') || 
      event.filename?.includes('devvit-runtime') ||
      event.filename?.includes('dist-')) {
    console.log('🔇 Suppressed Devvit internal error:', event.message);
    event.preventDefault();
    return false;
  }
});

// 添加未处理的 Promise 拒绝处理
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('AsyncLocalStorage')) {
    console.log('🔇 Suppressed Devvit internal promise rejection');
    event.preventDefault();
    return false;
  }
});

console.log('🎯 Application starting');

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
  
  console.log('Application rendered successfully');
} else {
  console.error('❌ Root element not found!');
}