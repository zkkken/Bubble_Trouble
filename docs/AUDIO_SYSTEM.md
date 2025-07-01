# 猫咪洗澡游戏 - 音效系统文档

## 📋 概述

本文档描述了为猫咪洗澡游戏实现的完整音效系统，包括背景音乐和各种游戏事件音效。

## 🎵 音效文件列表

### 背景音乐
- **Pixel Purrfection (Remix).mp3** - 游戏主背景音乐（循环播放）

### 交互音效
- **cat-meow-loud-225307.mp3** - 选择/拖拽猫咪时的音效
- **(game-start-317318.mp3** - 点击开始按钮的音效

### 干扰事件音效
- **cartoon-bubbles-pop-729.wav** - 泡泡时间事件开始音效
- **water-bubble-1317.wav** - 泡泡时间事件结束音效
- **mixkit-wind-blowing-papers-2652.wav** - 冷风事件开始音效
- **electric-fence-buzzing-2967.wav** - 电击事件音效

### 游戏状态音效
- **mixkit-game-level-completed-2059.wav** - 游戏结束音效

## 🔧 技术实现

### AudioManager 类
位置：`src/client/services/audioManager.ts`

主要功能：
- 统一管理所有音频文件
- 支持预加载和延迟加载
- 音量控制和静音功能
- 循环播放和单次播放支持
- 错误处理和降级方案

### 核心方法

```typescript
// 播放音效
audioManager.playSound('catMeow')

// 控制背景音乐
audioManager.startBackgroundMusic()
audioManager.stopBackgroundMusic()

// 音量和静音控制
audioManager.setMuted(true/false)
audioManager.setMasterVolume(0.7)

// 预加载
audioManager.preloadAllAudio()
```

## 🎮 集成点

### 1. GameInterface.tsx
- 音乐开关按钮控制
- 游戏开始时播放背景音乐
- 游戏失败时播放结束音效
- 干扰事件音效触发

### 2. StartGameScreen.tsx
- 选择猫咪时播放猫叫音效

### 3. GameLaunchScreen.tsx
- 启动按钮音效
- 音乐系统初始化

## 🔄 音效触发时机

### 游戏流程音效
1. **启动界面** → 点击开始按钮 → `gameStart`
2. **游戏开始** → 背景音乐开始 → `backgroundMusic`
3. **选择猫咪** → 拖拽猫咪 → `catMeow`
4. **游戏失败** → 游戏结束 → `gameComplete`

### 干扰事件音效
- **泡泡时间开始** → `bubbleStart`
- **泡泡时间结束** → `bubbleEnd`
- **冷风事件** → `windStart`
- **电击事件** → `electricShock`

## ⚙️ 配置说明

### 音量设置
```typescript
const audioConfig = {
  backgroundMusic: { volume: 0.4 },  // 背景音乐较轻
  catMeow: { volume: 0.8 },         // 猫叫音效较响
  gameStart: { volume: 0.7 },       // 开始音效中等
  bubbleStart: { volume: 0.6 },     // 泡泡音效较轻
  gameComplete: { volume: 0.8 },    // 结束音效较响
  windStart: { volume: 0.5 },       // 风声较轻
  bubbleEnd: { volume: 0.6 },       // 泡泡结束音效较轻
  electricShock: { volume: 0.7 }    // 电击音效中等
};
```

### 主音量控制
- 默认主音量：70%
- 用户可通过音乐开关控制静音
- 所有音效都会受主音量影响

## 🚀 性能优化

### 预加载策略
- 页面加载1秒后开始预加载所有音频
- 首次播放时如果未加载会自动加载
- 失败容错，不会阻塞游戏进行

### 内存管理
- 音频文件在浏览器中缓存
- 停止游戏时释放所有音频资源
- 支持音频文件加载失败的降级处理

## 🔧 使用指南

### 添加新音效
1. 将音频文件放入 `src/client/public/music/` 目录
2. 在 `audioManager.ts` 中添加配置：
```typescript
// 在 SoundEffect 类型中添加
export type SoundEffect = 
  | 'backgroundMusic'
  | 'newSoundEffect';  // 新增

// 在 audioConfig 中添加配置
const audioConfig = {
  newSoundEffect: { 
    path: '/music/new-sound.mp3', 
    isLoop: false, 
    volume: 0.6 
  }
};
```
3. 在相应组件中调用：
```typescript
audioManager.playSound('newSoundEffect');
```

### 调试音效
- 打开浏览器开发者工具
- 查看控制台中的音频加载和播放日志
- 检查网络面板确认音频文件正确加载

## 🐛 常见问题

### 音效不播放
1. 检查音乐开关是否开启
2. 确认浏览器自动播放策略（需要用户交互后才能播放）
3. 检查音频文件路径是否正确
4. 查看控制台错误信息

### 音量问题
1. 检查主音量设置
2. 确认各个音效的相对音量配置
3. 测试浏览器音量设置

### 性能问题
1. 监控音频文件大小（建议小于2MB）
2. 检查同时播放的音效数量
3. 考虑使用压缩音频格式

## 📝 更新日志

### v1.0.0 (当前版本)
- ✅ 完整的音效系统实现
- ✅ 背景音乐循环播放
- ✅ 8种不同的游戏音效
- ✅ 音乐开关控制
- ✅ 音量管理系统
- ✅ 预加载和错误处理
- ✅ 性能优化

---

🎵 **享受有声的猫咪洗澡游戏体验！** 🐱 