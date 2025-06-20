import React from 'react';
import ReactDOM from 'react-dom/client';
import { CatComfortGame } from './CatComfortGame';
import { initTestMode } from './config/testMode';
import './index.css';

// 初始化测试模式
initTestMode();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CatComfortGame />
  </React.StrictMode>,
);