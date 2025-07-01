/**
 * 干扰系统 - 负责游戏干扰事件的生成和管理
 * Interference System - Handles game interference events generation and management
 * 
 * @author 开发者A - 游戏核心逻辑负责人
 */

import { InterferenceEvent, InterferenceType, GameConfig, FallingObject, BubbleTimeState, Bubble, WindObject } from '../types/GameTypes';

export class InterferenceSystem {
  private config: GameConfig;

  constructor(config: GameConfig) {
    this.config = config;
  }

  /**
   * 生成随机干扰间隔时间
   * Generate random interference interval
   */
  generateRandomInterferenceInterval(): number {
    return Math.random() * 
      (this.config.INTERFERENCE_MAX_INTERVAL - this.config.INTERFERENCE_MIN_INTERVAL) + 
      this.config.INTERFERENCE_MIN_INTERVAL;
  }

  /**
   * 获取随机干扰类型
   * Get random interference type
   */
  getRandomInterferenceType(): InterferenceType {
    const types: InterferenceType[] = [
      'bubble_time',
      'controls_reversed', 
      'electric_leakage',
      'surprise_drop',
      'cold_wind'
    ];
    const randomIndex = Math.floor(Math.random() * types.length);
    const selectedType = types[randomIndex] || 'controls_reversed'; // Fallback to ensure valid type
    return selectedType;
  }

  /**
   * 创建新的干扰事件
   * Create new interference event
   */
  createInterferenceEvent(type: InterferenceType): InterferenceEvent {
    // 延长泡泡和掉落效果时间到8-10秒
    let duration: number;
    if (type === 'controls_reversed') {
      duration = 5;
    } else if (type === 'surprise_drop') {
      duration = 10; // 掉落模式固定为10秒
    } else if (type === 'bubble_time') {
      duration = 999; // 泡泡模式持续很长时间，直到被点击结束
    } else {
      duration = this.config.INTERFERENCE_DURATION;
    }
    
    return {
      type,
      isActive: true,
      duration,
      remainingTime: duration,
    };
  }

  /**
   * 清除干扰事件
   * Clear interference event
   */
  clearInterferenceEvent(): InterferenceEvent {
    return {
      type: 'none',
      isActive: false,
      duration: 0,
      remainingTime: 0,
    };
  }

  /**
   * 应用干扰效果到目标温度
   * Apply interference effects to target temperature
   */
  applyTemperatureShock(): number {
    // 温度冲击：设置具有挑战性但不极端的目标温度
    // Temperature shock: Set challenging but not extreme target temperatures
    // 避免0.1和0.9这样的极端值，改为0.2和0.8，保持游戏可玩性
    return Math.random() > 0.5 ? 0.8 : 0.2;
  }

  /**
   * 生成漏电效果的温度偏移值
   * Generate temperature offset for electric leakage effect
   */
  generateElectricLeakageOffset(): number {
    // 生成 -0.1 到 +0.1 之间的随机偏移值
    return (Math.random() - 0.5) * 0.2;
  }

  /**
   * 创建初始泡泡状态 - 新的从上到下下落系统，限制在游戏画面内
   * Create initial bubble time state - New top-to-bottom falling system, constrained to game area
   */
  createBubbleTimeState(): BubbleTimeState {
    const bubbles: Bubble[] = [];
    // 生成5-8个随机位置的泡泡
    const bubbleCount = 5 + Math.floor(Math.random() * 4);
    
    // 游戏画面尺寸限制：724x584
    const gameWidth = 724;
    const gameHeight = 584;
    
    for (let i = 0; i < bubbleCount; i++) {
      // 尺寸分布：70% 大泡泡（120-150px），30% 小泡泡（50-70px）
      const isLargeBubble = Math.random() < 0.7;
      const size = isLargeBubble 
        ? 120 + Math.random() * 30  // 120-150px
        : 50 + Math.random() * 20;  // 50-70px

      // 防重叠机制：尝试找到合适位置，限制在游戏画面内
      let x, y;
      let attempts = 0;
      const maxAttempts = 10;
      
      do {
        x = size / 2 + Math.random() * (gameWidth - size); // 确保不超出游戏画面边界
        y = -size - Math.random() * 200; // 从屏幕顶部上方开始
        attempts++;
      } while (attempts < maxAttempts && this.checkBubbleOverlap(x, y, size, bubbles));

      // 如果找不到合适位置，使用网格布局，限制在游戏画面内
      if (attempts >= maxAttempts) {
        const cols = 3;
        const rows = 3;
        const gridX = (i % cols) * (gameWidth / cols) + size / 2;
        const gridY = -size - Math.floor(i / cols) * (200 / rows);
        x = Math.min(gridX, gameWidth - size / 2); // 确保不超出游戏画面
        y = gridY;
      }

      bubbles.push({
        id: i,
        x: x,
        y: y,
        size: size,
        opacity: 0.6 + Math.random() * 0.4, // 0.6-1.0 透明度
        speed: 1.0 + Math.random() * 1.5,      // 垂直下降速度：1.0-2.5 像素/帧 (减慢)
        horizontalSpeed: (Math.random() - 0.5) * 1.5, // 水平漂移：-0.75 到 +0.75 像素/帧
        swayAmplitude: 20 + Math.random() * 40,        // 摆动幅度：20-60 像素
        swayFrequency: 0.01 + Math.random() * 0.02,    // 摆动频率：0.01-0.03
        time: Math.random() * Math.PI * 2              // 随机初始相位
      });
    }

    return {
      isActive: true,
      bubbles,
      lastClickTime: 0,
      rhythmClickCount: 0,
    };
  }

  /**
   * 检查泡泡重叠
   * Check bubble overlap for anti-collision
   */
  private checkBubbleOverlap(x: number, y: number, size: number, existingBubbles: Bubble[]): boolean {
    const minDistance = 80 + size / 2; // 最小间距：80像素 + 泡泡半径
    
    for (const bubble of existingBubbles) {
      const distance = Math.sqrt(
        Math.pow(x - bubble.x, 2) + Math.pow(y - bubble.y, 2)
      );
      
      if (distance < minDistance + bubble.size / 2) {
        return true; // 重叠
      }
    }
    
    return false; // 不重叠
  }

  /**
   * 更新泡泡位置 - 60fps动画循环，从上到下下落，限制在游戏画面内
   * Update bubble positions - 60fps animation loop, falling from top to bottom, constrained to game area
   */
  updateBubbles(bubbles: Bubble[]): Bubble[] {
    const gameWidth = 724;
    const gameHeight = 584;
    
    return bubbles.map(bubble => {
      // 垂直下降：简单的线性运动（向下）
      const newY = bubble.y + bubble.speed;
      
      // 更新时间参数
      const newTime = bubble.time + bubble.swayFrequency;
      
      // 水平位置：漂移 + 正弦波摆动
      const newX = bubble.x + bubble.horizontalSpeed + 
                   Math.sin(newTime) * bubble.swayAmplitude * 0.1;
      
      // 边界处理：水平边界不会飘出游戏画面
      const clampedX = Math.max(bubble.size / 2, Math.min(gameWidth - bubble.size / 2, newX));
      
      // 垂直边界：泡泡离开游戏画面底部后重新从顶部生成
      const clampedY = newY > gameHeight + bubble.size ? -bubble.size - Math.random() * 100 : newY;
      
      return {
        ...bubble,
        x: clampedX,
        y: clampedY,
        time: newTime
      };
    });
  }

  /**
   * 检查节奏点击是否有效
   * Check if rhythm click is valid
   */
  isValidRhythmClick(currentTime: number, lastClickTime: number): boolean {
    if (lastClickTime === 0) return true; // 第一次点击总是有效
    
    const timeDiff = currentTime - lastClickTime;
    // 有效节奏：500ms-1500ms 之间的点击间隔
    return timeDiff >= 500 && timeDiff <= 1500;
  }

  /**
   * 生成随机掉落物品 - 更新物品效果和图片关联
   * Generate random falling object - Updated item effects and image associations
   */
  generateFallingObject(gameWidth: number = 724): FallingObject {
    const types = ['rubber_duck', 'fish', 'comb', 'grime_goblin', 'alarm_clock'] as const;
    const type = types[Math.floor(Math.random() * types.length)] || 'rubber_duck';
    
    // 根据物品类型设置舒适度效果 - 更新效果值
    const comfortEffects = {
      rubber_duck: 0.05,     // +5% 舒适度
      fish: 0.05,            // +5% 舒适度  
      comb: -0.05,           // -5% 舒适度
      grime_goblin: -0.05,   // -5% 舒适度 (水垢怪)
      alarm_clock: -0.1,     // -10% 舒适度
    };

    // 根据物品类型设置图片路径 - 确保与PNG文件关联
    const imagePaths = {
      rubber_duck: '/Rubber_Duck.png',
      fish: '/Fish.png', 
      comb: '/Comb.png',
      grime_goblin: '/Grime_Goblin.png',
      alarm_clock: '/Alarm_Clock.png',
    };

    return {
      id: `falling-${Date.now()}-${Math.random()}`,
      type,
      yPosition: 0, // 从顶部开始
      xPosition: Math.random() * (gameWidth - 60), // 避免物品出现在边缘
      imageSrc: imagePaths[type],
      comfortEffect: comfortEffects[type],
    };
  }

  /**
   * 更新掉落物品位置
   * Update falling objects positions
   */
  updateFallingObjects(fallingObjects: FallingObject[], deltaTime: number): FallingObject[] {
    const fallSpeed = 200; // 200px/秒 的下落速度
    
    return fallingObjects
      .map(obj => ({
        ...obj,
        yPosition: obj.yPosition + fallSpeed * deltaTime,
      }))
      .filter(obj => obj.yPosition < 600); // 移除已经落到底部的物品
  }

  /**
   * 检查掉落物品是否在接住区域
   * Check if falling object is in catch zone
   */
  isObjectInCatchZone(obj: FallingObject, catchZoneTop: number = 480, catchZoneBottom: number = 560): boolean {
    return obj.yPosition >= catchZoneTop && obj.yPosition <= catchZoneBottom;
  }

  /**
   * 获取干扰事件的文本内容
   * Get interference event text content
   */
  getInterferenceContent(type: InterferenceType) {
    switch (type) {
      case 'bubble_time':
        return {
          icon: '🫧',
          title: 'Bubble Time!',
          description: 'Bubbles are everywhere!',
          bgColor: 'bg-blue-500',
        };
      case 'controls_reversed':
        return {
          icon: '🔄',
          title: 'Controls Reversed!',
          description: 'The + and - buttons are swapped!',
          bgColor: 'bg-purple-500',
        };
      case 'electric_leakage':
        return {
          icon: '⚡',
          title: 'Electric Leakage!',
          description: 'Warning! Electric leakage detected!',
          bgColor: 'bg-yellow-500',
        };
      case 'surprise_drop':
        return {
          icon: '🎁',
          title: 'Surprise Drop!',
          description: 'Something unexpected has happened!',
          bgColor: 'bg-pink-500',
        };
      default:
        return {
          icon: '⚠️',
          title: 'Interference!',
          description: 'Something is wrong!',
          bgColor: 'bg-red-500',
        };
    }
  }

  /**
   * 检查是否应该触发干扰事件
   * Check if interference event should be triggered
   */
  shouldTriggerInterference(
    interferenceTimer: number,
    isInterferenceActive: boolean
  ): boolean {
    return interferenceTimer <= 0 && !isInterferenceActive;
  }

  /**
   * 检查干扰是否可以通过点击中心按钮清除
   * Check if interference can be cleared by clicking center button
   */
  canBeClearedByClick(type: InterferenceType): boolean {
    // 'bubble_time' and 'surprise_drop' should not be cleared by a generic click.
    return type === 'controls_reversed' || type === 'electric_leakage';
  }

  /**
   * 创建冷风状态 - 生成随机移动的风图标
   * Create cold wind state - Generate randomly moving wind icons
   */
  createColdWindState(): WindObject[] {
    const windObjects: WindObject[] = [];
    
    // 最少同时2朵云，最多4朵云
    const initialCount = 2 + Math.floor(Math.random() * 3); // 2-4个 (2 + 0/1/2 = 2/3/4)
    
    for (let i = 0; i < initialCount; i++) {
      windObjects.push(this.generateWindObject());
    }
    
    return windObjects;
  }

  /**
   * 生成单个风对象
   * Generate single wind object  
   */
  generateWindObject(): WindObject {
    const gameHeight = 584;
    const gameWidth = 724;
    
    // 随机方向：左右双向
    const direction = Math.random() > 0.5 ? 'left' : 'right';
    
    // 出现位置：游戏画面高度的10%-70%随机
    const yRange = gameHeight * 0.6; // 70% - 10% = 60%
    const yMin = gameHeight * 0.1;   // 10%
    const y = yMin + Math.random() * yRange;
    
    // X位置：根据方向决定起始位置
    const x = direction === 'left' ? gameWidth + 50 : -50; // 从屏幕外开始
    
    // 动画速度：3-8秒穿越整个屏幕
    const duration = 3 + Math.random() * 5; // 3-8秒
    const speed = (gameWidth + 100) / (duration * 60); // 像素/帧 (60fps)
    
    return {
      id: Math.random(),
      x,
      y,
      direction,
      speed,
      opacity: 0 // 开始时透明，淡入效果
    };
  }

  /**
   * 更新风对象位置和透明度
   * Update wind objects position and opacity
   */
  updateWindObjects(windObjects: WindObject[]): WindObject[] {
    const gameWidth = 724;
    const fadeDistance = 100; // 淡入淡出距离
    
    return windObjects.map(wind => {
      // 更新位置
      const newX = wind.direction === 'left' 
        ? wind.x - wind.speed 
        : wind.x + wind.speed;
      
      // 计算透明度（淡入淡出效果）
      let opacity = 1;
      
      if (wind.direction === 'left') {
        // 从右到左移动
        if (wind.x > gameWidth) {
          // 淡入阶段
          opacity = Math.min(1, (gameWidth + fadeDistance - wind.x) / fadeDistance);
        } else if (newX < 0) {
          // 淡出阶段  
          opacity = Math.max(0, (newX + fadeDistance) / fadeDistance);
        }
      } else {
        // 从左到右移动
        if (wind.x < 0) {
          // 淡入阶段
          opacity = Math.min(1, (wind.x + fadeDistance) / fadeDistance);
        } else if (newX > gameWidth) {
          // 淡出阶段
          opacity = Math.max(0, (gameWidth + fadeDistance - newX) / fadeDistance);
        }
      }
      
      return {
        ...wind,
        x: newX,
        opacity
      };
    }).filter(wind => {
      // 移除完全离开屏幕的风对象
      return wind.direction === 'left' 
        ? wind.x > -200 
        : wind.x < gameWidth + 200;
    });
  }

  /**
   * 生成新风对象的时机检查
   * Check timing for generating new wind objects
   */
  shouldGenerateNewWind(lastGenerateTime: number, currentTime: number): boolean {
    const interval = 3 + Math.random() * 5; // 3-8秒随机间隔
    return (currentTime - lastGenerateTime) >= interval * 1000;
  }
}