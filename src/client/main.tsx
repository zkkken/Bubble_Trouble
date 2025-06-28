import React from 'react';
import ReactDOM from 'react-dom/client';
import { CatComfortGame } from './CatComfortGame';
import './index.css';

console.log('🚀 Main.tsx: Starting application initialization');

// 检查环境
const hostname = window.location.hostname;
const port = window.location.port;
console.log('🔍 Environment check:', { hostname, port });

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