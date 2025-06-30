import React, { useState, useEffect, useCallback } from 'react';
import { WindObject } from '../types/GameTypes';

interface WindConfig {
  windSize?: { width: number; height: number };
  maxWinds?: number;
  speedRange?: { min: number; max: number };
  intervalRange?: { min: number; max: number };
  heightRange?: { min: number; max: number };
  windImage?: string;
}

interface WindEffectProps {
  config?: WindConfig;
}

export const WindEffect: React.FC<WindEffectProps> = ({ 
  config = {} 
}) => {
  const {
    windSize = { width: 400, height: 200 },
    maxWinds = 5,
    speedRange = { min: 3, max: 8 }, // 3-8秒穿越屏幕
    intervalRange = { min: 3000, max: 8000 }, // 3-8秒生成间隔
    heightRange = { min: 10, max: 70 }, // 屏幕高度10%-70%
    windImage = '/redom-below.png'
  } = config;

  const [winds, setWinds] = useState<WindObject[]>([]);
  const [nextWindId, setNextWindId] = useState(0);

  // 生成新的风对象
  const generateWind = useCallback((): WindObject => {
    const direction = Math.random() < 0.5 ? 'left' : 'right';
    const startX = direction === 'left' ? -windSize.width : window.innerWidth;
    const y = (heightRange.min + Math.random() * (heightRange.max - heightRange.min)) / 100 * window.innerHeight;
    const speed = speedRange.min + Math.random() * (speedRange.max - speedRange.min);

    return {
      id: nextWindId,
      x: startX,
      y: y,
      direction,
      speed: speed * 1000, // 转换为毫秒
      opacity: 0.6 + Math.random() * 0.4 // 0.6-1.0透明度
    };
  }, [nextWindId, windSize.width, heightRange.min, heightRange.max, speedRange.min, speedRange.max]);

  // 递归生成风效果
  const scheduleNextWind = useCallback(() => {
    const delay = intervalRange.min + Math.random() * (intervalRange.max - intervalRange.min);
    
    setTimeout(() => {
      setWinds(currentWinds => {
        if (currentWinds.length < maxWinds) {
          const newWind = generateWind();
          setNextWindId(prev => prev + 1);
          return [...currentWinds, newWind];
        }
        return currentWinds;
      });
      
      // 继续递归生成
      scheduleNextWind();
    }, delay);
  }, [generateWind, intervalRange.min, intervalRange.max, maxWinds]);

  // 移除离开屏幕的风对象
  const removeOffscreenWinds = useCallback(() => {
    setWinds(currentWinds => 
      currentWinds.filter(wind => {
        if (wind.direction === 'left') {
          return wind.x > -windSize.width;
        } else {
          return wind.x < window.innerWidth + windSize.width;
        }
      })
    );
  }, [windSize.width]);

  // 初始化和清理
  useEffect(() => {
    scheduleNextWind();
    
    const cleanupInterval = setInterval(removeOffscreenWinds, 1000);
    
    return () => {
      clearInterval(cleanupInterval);
    };
  }, [scheduleNextWind, removeOffscreenWinds]);

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {winds.map((wind) => (
        <div
          key={wind.id}
          className="absolute wind-object"
          style={{
            left: `${wind.x}px`,
            top: `${wind.y}px`,
            width: `${windSize.width}px`,
            height: `${windSize.height}px`,
            opacity: wind.opacity,
            animation: `windTravel-${wind.direction} ${wind.speed}ms linear infinite`,
            willChange: 'transform'
          }}
        >
          <img
            src={windImage}
            alt="Wind effect"
            className="w-full h-full object-contain"
            style={{
              transform: wind.direction === 'right' ? 'scaleX(-1)' : 'scaleX(1)'
            }}
            onError={(e) => {
              console.warn('Wind image failed to load:', windImage);
              // 如果图片加载失败，创建一个简单的风效果
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.style.background = 'linear-gradient(90deg, transparent 0%, rgba(147, 197, 253, 0.4) 50%, transparent 100%)';
            }}
          />
        </div>
      ))}
      
      <style>
        {`
          @keyframes windTravel-left {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(calc(-100vw - ${windSize.width}px));
            }
          }
          
          @keyframes windTravel-right {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(calc(100vw + ${windSize.width}px));
            }
          }
          
          .wind-object {
            transition: opacity 0.5s ease-in-out;
          }
        `}
      </style>
    </div>
  );
}; 