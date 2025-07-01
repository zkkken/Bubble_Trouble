# 🎮 Cat Shower Game - 完整游戏文档

## 游戏概述
Cat Shower Game 是一个关于保持猫咪舒适洗澡的互动游戏，具有渐进式难度系统和多种干扰机制。

## 🔥 新功能：难度递增系统 (V3.0)

### 难度等级配置
游戏现在支持6个难度等级，每30秒自动提升：

| 等级 | 事件间隔 | 最大同时事件数 | 特点 |
|------|----------|----------------|------|
| 1 | 8-15秒 | 1个 | 基础难度 |
| 2 | 6-12秒 | 1个 | 间隔缩短 |
| 3 | 4-10秒 | 1个 | 快速事件 |
| 4 | 3-8秒 | 2个 | **事件叠加开始** |
| 5 | 2-6秒 | 2个 | 高频叠加 |
| 6 | 1.5-5秒 | 3个 | **最高难度** |

### 🎯 多事件叠加机制

#### 视觉显示
- **垂直堆叠**: 新事件指示器显示在原指示器正上方45px
- **序号标识**: 多事件时右上角显示红色序号 (1, 2, 3...)
- **淡入动画**: 新增事件有0.3秒淡入效果
- **层级管理**: 确保正确的z-index层级

#### 事件处理逻辑
- **独立计时**: 每个事件有独立的剩余时间
- **智能清除**: 点击中心按钮可清除所有可清除的事件
- **效果叠加**: 某些效果(如控制反转)可以叠加
- **状态保护**: 泡泡时间等特殊事件有独立处理

### 🕐 计时器系统升级

#### 难度提升计时
- **间隔**: 30秒 (从15秒调整)
- **计算方式**: 只在无干扰事件时累计时间
- **温度区域**: 轮换间隔同步为30秒

#### 事件间隔动态调整
```typescript
// 基于难度等级的间隔计算
const level = DIFFICULTY_LEVELS[difficultyLevel - 1];
const interval = level.interferenceMinInterval + 
  Math.random() * (level.interferenceMaxInterval - level.interferenceMinInterval);
```

## 🎨 UI/UX 改进

### 新增界面元素
1. **难度等级指示器**: 右上角显示当前难度 (等级2+)
2. **多事件指示器**: 垂直堆叠的干扰事件显示
3. **事件序号**: 多事件时的编号显示
4. **动画效果**: 淡入、堆叠、层级管理

### 交互改进
- **中心按钮**: 支持一键清除多个可清除事件
- **视觉反馈**: 更清晰的事件状态显示
- **音效增强**: 难度提升音效和事件组合音效

## 🔧 技术实现

### 数据结构升级
```typescript
// 新的游戏状态结构
interface GameState {
  // 多事件支持
  interferenceEvents: InterferenceEvent[];
  difficultyLevel: number;
  
  // 兼容性保持
  interferenceEvent: InterferenceEvent; // 向后兼容
}

// 难度等级配置
interface DifficultyLevel {
  level: number;
  interferenceMinInterval: number;
  interferenceMaxInterval: number;
  maxSimultaneousEvents: number;
}
```

### 核心算法

#### 事件触发逻辑
```typescript
// 检查是否可以添加新事件
const currentDifficulty = getCurrentDifficultyLevel(difficultyLevel);
const canAddMoreEvents = activeEvents.length < currentDifficulty.maxSimultaneousEvents;

if (canAddMoreEvents) {
  // 创建新事件
  const newEvent = createInterferenceEvent(randomType);
  activeEvents.push(newEvent);
}
```

#### 多事件处理
```typescript
// 分类处理不同类型的事件
const electricEvents = events.filter(e => e.type === 'electric_leakage');
const bubbleEvents = events.filter(e => e.type === 'bubble_time');
const dropEvents = events.filter(e => e.type === 'surprise_drop');
const coldWindEvents = events.filter(e => e.type === 'cold_wind');
```

## 🎵 音效系统集成

### 难度相关音效
- **难度提升**: `difficultyUp` - 每30秒播放
- **多事件触发**: 组合音效提示
- **事件清除**: 批量清除音效

### 音效防重复机制
```typescript
const handleInterferenceSound = useCallback((interferenceType: string) => {
  if (lastInterferenceType === interferenceType) return;
  // 播放音效并记录
  setLastInterferenceType(interferenceType);
}, [lastInterferenceType]);
```

## 🚀 性能优化

### 渲染优化
- **条件渲染**: 只渲染活跃的事件
- **key属性**: 使用唯一ID避免重复渲染
- **动画性能**: CSS动画替代JS动画

### 内存管理
- **事件清理**: 自动清除过期事件
- **状态重置**: 游戏重置时完全清理状态
- **计时器管理**: 统一的计时器重置机制

## 🧪 测试场景

### 难度递增测试
1. **0-30秒**: 难度1，单事件，8-15秒间隔
2. **30-60秒**: 难度2，单事件，6-12秒间隔
3. **90-120秒**: 难度4，双事件开始叠加
4. **150秒+**: 难度6，最多3个事件同时发生

### 多事件组合测试
- **双控制反转**: 效果叠加
- **泡泡+掉落**: 独立处理
- **冷风+漏电**: 视觉和机制叠加
- **三事件叠加**: 最高难度测试

## 📱 响应式设计

### 移动端适配
- **指示器尺寸**: 自动缩放
- **触摸优化**: 更大的点击区域
- **性能考虑**: 减少同时动画数量

### 不同分辨率支持
- **scale函数**: 统一的尺寸缩放
- **相对定位**: 适应不同屏幕比例
- **字体缩放**: 可读性优化

## 🔮 未来扩展

### 可能的增强功能
1. **自定义难度**: 玩家选择起始难度
2. **成就系统**: 多事件生存成就
3. **事件预告**: 提前显示即将到来的事件
4. **特殊组合**: 特定事件组合的特殊效果
5. **难度平衡**: 基于玩家表现的动态调整

### 技术改进方向
1. **状态机**: 更复杂的游戏状态管理
2. **事件系统**: 解耦的事件处理架构
3. **配置系统**: 外部配置文件支持
4. **分析系统**: 玩家行为数据收集

---

*本文档更新时间: 2024年12月*
*版本: V3.0 - 难度递增系统*