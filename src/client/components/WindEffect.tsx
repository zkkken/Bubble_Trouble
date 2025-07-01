/**
 * WindEffect 组件 - 冷风干扰事件的视觉效果
 * 实现多个风效果元素的动画和管理
 * 
 * @author 开发者B - UI/UX 界面负责人
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useResponsiveScale, useResponsiveSize } from '../hooks/useResponsiveScale';

// 配置接口
interface WindConfig {
  windSize?: { width: number; height: number };
  maxWinds?: number;
  speedRange?: { min: number; max: number }; // 动画持续时间（秒）
  intervalRange?: { min: number; max: number }; // 生成间隔（秒）
  heightRange?: { min: number; max: number }; // 高度范围（百分比）
  windImage?: string;
}

// 单个风对象接口
interface WindElement {
  id: string;
  x: number;
  y: number;
  direction: 'left-to-right' | 'right-to-left';
  speed: number;
  opacity: number;
  phase: 'fade-in' | 'moving' | 'fade-out';
}

// 生成随机值的辅助函数 - 移到组件外部
const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

// 默认配置
const defaultConfig: Required<WindConfig> = {
  windSize: { width: 120, height: 80 },
  maxWinds: 5,
  speedRange: { min: 3, max: 8 }, // 3-8秒穿越屏幕
  intervalRange: { min: 3, max: 8 }, // 3-8秒生成间隔
  heightRange: { min: 10, max: 70 }, // 屏幕高度10%-70%
  windImage: '/redom-below.png'
};

interface WindEffectProps {
  config?: WindConfig;
}

export const WindEffect: React.FC<WindEffectProps> = ({ config = {} }) => {
  const [windElements, setWindElements] = useState<WindElement[]>([]);
  const { scale } = useResponsiveSize();
  
  // 游戏区域尺寸
  const gameWidth = scale(724);
  const gameHeight = scale(584);

  // 合并配置
  const finalConfig = { ...defaultConfig, ...config };

  // 生成新的风元素
  const generateWindElement = useCallback((): WindElement => {
    const direction = Math.random() > 0.5 ? 'left-to-right' : 'right-to-left';
    const y = (finalConfig.heightRange.min / 100) * gameHeight + 
              Math.random() * ((finalConfig.heightRange.max - finalConfig.heightRange.min) / 100) * gameHeight;
    
    // 根据方向设置初始位置
    const x = direction === 'left-to-right' 
      ? -scale(finalConfig.windSize.width) 
      : gameWidth + scale(finalConfig.windSize.width);
    
    // 计算速度（像素/秒）
    const duration = finalConfig.speedRange.min + Math.random() * (finalConfig.speedRange.max - finalConfig.speedRange.min);
    const distance = gameWidth + 2 * scale(finalConfig.windSize.width);
    const speed = distance / duration / 60; // 转换为像素/帧（假设60fps）

    return {
      id: `wind-${Date.now()}-${Math.random()}`,
      x,
      y,
      direction,
      speed,
      opacity: 0,
      phase: 'fade-in'
    };
  }, [gameWidth, gameHeight, scale, finalConfig.heightRange.min, finalConfig.heightRange.max, finalConfig.windSize.width, finalConfig.speedRange.min, finalConfig.speedRange.max]);

  // 更新风元素状态
  const updateWindElements = useCallback(() => {
    setWindElements(prevElements => {
      return prevElements.map(element => {
        let newElement = { ...element };

        // 处理淡入阶段
        if (element.phase === 'fade-in') {
          newElement.opacity = Math.min(1, element.opacity + 0.05); // 约1秒淡入
          if (newElement.opacity >= 1) {
            newElement.phase = 'moving';
          }
        }

        // 处理移动阶段
        if (element.phase === 'moving') {
          if (element.direction === 'left-to-right') {
            newElement.x += element.speed;
            // 检查是否开始离开屏幕
            if (newElement.x > gameWidth * 0.8) {
              newElement.phase = 'fade-out';
            }
          } else {
            newElement.x -= element.speed;
            // 检查是否开始离开屏幕
            if (newElement.x < gameWidth * 0.2 - scale(finalConfig.windSize.width)) {
              newElement.phase = 'fade-out';
            }
          }
        }

        // 处理淡出阶段
        if (element.phase === 'fade-out') {
          newElement.opacity = Math.max(0, element.opacity - 0.05); // 约1秒淡出
          // 继续移动
          if (element.direction === 'left-to-right') {
            newElement.x += element.speed;
          } else {
            newElement.x -= element.speed;
          }
        }

        return newElement;
      }).filter(element => {
        // 移除完全消失或离开屏幕的元素
        const isOffScreen = element.direction === 'left-to-right' 
          ? element.x > gameWidth + scale(finalConfig.windSize.width)
          : element.x < -scale(finalConfig.windSize.width) * 2;
        return !(element.opacity <= 0 && isOffScreen);
      });
    });
  }, [gameWidth, scale, finalConfig.windSize.width]);

  // 生成新风元素的计时器
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const generateInterval = () => {
      const interval = finalConfig.intervalRange.min + 
                     Math.random() * (finalConfig.intervalRange.max - finalConfig.intervalRange.min);
      return interval * 1000; // 转换为毫秒
    };

    const scheduleNextGeneration = () => {
      const delay = generateInterval();
      timeoutId = setTimeout(() => {
        setWindElements(prevElements => {
          // 检查是否达到最大数量
          if (prevElements.length < finalConfig.maxWinds) {
            const newElement = generateWindElement();
            return [...prevElements, newElement];
          }
          return prevElements;
        });
        scheduleNextGeneration();
      }, delay);
    };

    // 立即生成第一个风元素
    const firstElement = generateWindElement();
    setWindElements([firstElement]);

    // 安排后续生成
    scheduleNextGeneration();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [finalConfig.maxWinds, finalConfig.intervalRange.min, finalConfig.intervalRange.max, generateWindElement]);

  // 动画循环
  useEffect(() => {
    const animationLoop = setInterval(updateWindElements, 1000 / 60); // 60fps

    return () => {
      clearInterval(animationLoop);
    };
  }, [updateWindElements]);

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {windElements.map(element => (
        <div
          key={element.id}
          className="absolute transition-none"
          style={{
            left: `${element.x}px`,
            top: `${element.y}px`,
            width: `${scale(finalConfig.windSize.width)}px`,
            height: `${scale(finalConfig.windSize.height)}px`,
            opacity: element.opacity,
            transform: element.direction === 'right-to-left' ? 'scaleX(-1)' : 'scaleX(1)',
            willChange: 'transform, opacity', // 性能优化
          }}
        >
          <img
            src={finalConfig.windImage}
            alt="Wind effect"
            className="w-full h-full object-contain"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(173, 216, 230, 0.6))',
            }}
            onError={(e) => {
              // 如果图片加载失败，使用CSS风效果
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `
                  <div style="
                    width: 100%; 
                    height: 100%; 
                    background: linear-gradient(90deg, 
                      transparent 0%, 
                      rgba(173, 216, 230, 0.6) 30%, 
                      rgba(173, 216, 230, 0.8) 50%, 
                      rgba(173, 216, 230, 0.6) 70%, 
                      transparent 100%
                    );
                    border-radius: 40px;
                    position: relative;
                    overflow: hidden;
                  ">
                    <div style="
                      position: absolute;
                      top: 50%;
                      left: 50%;
                      transform: translate(-50%, -50%);
                      color: #87CEEB;
                      font-size: ${scale(24)}px;
                      font-weight: bold;
                      text-shadow: 0 0 10px rgba(173, 216, 230, 0.8);
                    ">💨</div>
                  </div>
                `;
              }
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default WindEffect; 