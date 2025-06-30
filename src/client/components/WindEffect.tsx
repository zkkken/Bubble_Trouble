import React, { useState, useEffect, useCallback, useRef } from 'react';

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
interface WindObject {
  id: string;
  x: number;
  y: number;
  direction: 'left' | 'right';
  duration: number; // 动画持续时间
  opacity: number;
}

// 生成随机值的辅助函数 - 移到组件外部
const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

// 默认配置
const defaultConfig: Required<WindConfig> = {
  windSize: { width: 400, height: 200 },
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
  const [winds, setWinds] = useState<WindObject[]>([]);
  const nextGenerationTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // 合并配置
  const finalConfig = { ...defaultConfig, ...config };

  // 创建新的风对象
  const createWind = useCallback((): WindObject => {
    const direction = Math.random() < 0.5 ? 'left' : 'right';
    const gameHeight = 584; // 游戏区域高度
    const { heightRange, speedRange, windSize } = finalConfig;
    
    return {
      id: `wind-${Date.now()}-${Math.random()}`,
      x: direction === 'right' ? -windSize.width : 724 + windSize.width, // 从屏幕外开始
      y: (gameHeight * heightRange.min / 100) + 
         Math.random() * (gameHeight * (heightRange.max - heightRange.min) / 100),
      direction,
      duration: randomBetween(speedRange.min, speedRange.max),
      opacity: 0
    };
  }, [finalConfig]);

  // 更新风对象位置和状态
  const updateWinds = useCallback((currentTime: number, deltaTime: number) => {
    setWinds(prevWinds => {
      return prevWinds.map(wind => {
        const { windSize } = finalConfig;
        const screenWidth = 724;
        const speed = (screenWidth + windSize.width * 2) / (wind.duration * 1000); // 像素/毫秒
        
        let newX = wind.x;
        let newOpacity = wind.opacity;

        // 更新位置
        if (wind.direction === 'right') {
          newX += speed * deltaTime;
        } else {
          newX -= speed * deltaTime;
        }

        // 计算透明度（淡入淡出效果）
        const totalDistance = screenWidth + windSize.width * 2;
        const traveledDistance = wind.direction === 'right' 
          ? newX + windSize.width 
          : (screenWidth + windSize.width) - newX;
        const progress = traveledDistance / totalDistance;

        if (progress < 0.1) {
          // 淡入阶段
          newOpacity = progress / 0.1;
        } else if (progress > 0.9) {
          // 淡出阶段
          newOpacity = (1 - progress) / 0.1;
        } else {
          // 完全可见阶段
          newOpacity = 1;
        }

        return {
          ...wind,
          x: newX,
          opacity: Math.max(0, Math.min(1, newOpacity))
        };
      }).filter(wind => {
        // 移除已经完全离开屏幕的风对象
        const { windSize } = finalConfig;
        return wind.direction === 'right' 
          ? wind.x < 724 + windSize.width 
          : wind.x > -windSize.width;
      });
    });
  }, [finalConfig]);

  // 尝试生成新的风对象
  const tryGenerateWind = useCallback((currentTime: number) => {
    if (currentTime >= nextGenerationTimeRef.current) {
      setWinds(prevWinds => {
        // 检查当前数量是否已达到上限
        if (prevWinds.length >= finalConfig.maxWinds) {
          return prevWinds;
        }

        const newWind = createWind();
        return [...prevWinds, newWind];
      });

      // 设置下次生成时间
      const nextInterval = randomBetween(finalConfig.intervalRange.min, finalConfig.intervalRange.max) * 1000;
      nextGenerationTimeRef.current = currentTime + nextInterval;
    }
  }, [finalConfig, createWind]);

  // 主动画循环
  const animate = useCallback((currentTime: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = currentTime;
    }

    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    // 更新现有风对象
    updateWinds(currentTime, deltaTime);

    // 尝试生成新风对象
    tryGenerateWind(currentTime);

    // 继续动画循环
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [updateWinds, tryGenerateWind]);

  // 启动动画循环
  useEffect(() => {
    // 初始化第一次生成时间 - 减少初始延迟以便更快看到效果
    const initialDelay = 500; // 500毫秒后生成第一个风对象
    nextGenerationTimeRef.current = performance.now() + initialDelay;
    
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate, finalConfig]);

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {winds.map(wind => (
        <img
          key={wind.id}
          src={finalConfig.windImage}
          alt="Wind effect"
          className="absolute"
          style={{
            left: `${wind.x}px`,
            top: `${wind.y}px`,
            width: `${finalConfig.windSize.width}px`,
            height: `${finalConfig.windSize.height}px`,
            opacity: wind.opacity,
            transform: wind.direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
            transition: 'opacity 0.3s ease-in-out',
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'block';
            target.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
            target.alt = 'Wind (Image Failed)';
          }}
        />
      ))}
    </div>
  );
};

export default WindEffect; 