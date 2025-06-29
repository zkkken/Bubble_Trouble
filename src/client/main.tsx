import React from 'react';
import ReactDOM from 'react-dom/client';
import { CatComfortGame } from './CatComfortGame';
import { ErrorBoundary } from './components/ErrorBoundary';
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
  console.log('Application rendered successfully');
} else {
  console.error('❌ Root element not found!');
}