# 🧪 Cat Comfort Game - 测试模式说明

## 概述

测试模式允许你在本地运行游戏而无需依赖 Devvit 后端，专门用于测试 UI 和游戏机制。

## 启用测试模式

### 方法1：开发环境自动启用
```bash
npm run dev:vite
```
在开发环境下，测试模式会自动启用。

### 方法2：URL参数启用
在任何环境下，在URL后添加 `?test=true` 参数：
```
http://localhost:7474?test=true
```

## 测试模式特性

### ✅ **完整的游戏功能**
- 🎮 所有游戏机制正常工作
- 🎯 温度控制系统
- 😸 舒适度管理
- 🔄 干扰事件（控制反转、温度冲击、气泡遮挡）
- ⏰ 计时器和多回合系统
- 🖼️ 图片资源加载

### 🔧 **测试模式专用功能**
- 💾 **本地存储**：游戏状态保存到 localStorage
- 🚫 **跳过后端**：不发送任何 API 请求
- 🐛 **调试日志**：控制台显示详细的游戏状态信息
- 🧪 **测试指示器**：界面显示当前在测试模式

### 📊 **调试信息**
测试模式下，控制台会显示：
- 游戏状态更新
- 按钮交互
- 干扰事件触发
- 回合切换
- 本地存储操作

## 使用方法

### 1. 启动测试模式
```bash
cd src/client
npm run dev
```

### 2. 打开浏览器
访问 `http://localhost:7474`

### 3. 开始测试
- 🎮 使用 +/- 按钮控制温度
- 🎯 观察舒适度变化
- 🔄 体验干扰事件
- ⏰ 测试多回合机制

### 4. 查看调试信息
打开浏览器开发者工具的控制台，查看详细的调试日志。

## 测试场景

### 基础功能测试
- [ ] 温度控制响应
- [ ] 舒适度计算正确
- [ ] 计时器倒计时
- [ ] 游戏结束条件

### 干扰系统测试
- [ ] 控制反转：按钮功能互换
- [ ] 温度冲击：目标温度突变
- [ ] 气泡干扰：视觉遮挡效果
- [ ] 中心按钮清除干扰

### 多回合测试
- [ ] 回合时间递减（30s → 20s → 10s）
- [ ] 成功进入下一回合
- [ ] 失败重新开始

### UI/UX测试
- [ ] 按钮交互反馈
- [ ] 进度条动画
- [ ] 覆盖层显示
- [ ] 图片加载回退

## 本地存储数据

测试模式使用以下 localStorage 键：
- `catComfortGame_gameState`：当前游戏状态
- `catComfortGame_currentRound`：当前回合
- `catComfortGame_postId`：模拟的帖子ID

### 清除测试数据
```javascript
// 在浏览器控制台执行
localStorage.removeItem('catComfortGame_gameState');
localStorage.removeItem('catComfortGame_currentRound');
localStorage.removeItem('catComfortGame_postId');
```

## 与生产环境的区别

| 功能 | 测试模式 | 生产环境 |
|------|----------|----------|
| 数据存储 | localStorage | Redis (Devvit) |
| API调用 | 模拟 | 真实后端 |
| 状态同步 | 本地 | 服务器 |
| 调试信息 | 显示 | 隐藏 |
| 性能 | 本地计算 | 服务器计算 |

## 故障排除

### 游戏状态异常
```javascript
// 重置游戏状态
localStorage.clear();
location.reload();
```

### 图片无法加载
确保图片文件在 `assets/` 目录下：
- `assets/background.png`
- `assets/avatar-bad.png`
- `assets/avatar-yellowsmiley.png`
- `assets/button-temp-minus.png`
- `assets/button-temp-plus.png`
- `assets/button-center-interaction.png`

### 控制台错误
检查浏览器控制台的错误信息，大多数问题会有详细的错误日志。

## 开发建议

1. **先在测试模式下验证功能**
2. **使用控制台调试信息定位问题**
3. **测试所有交互场景**
4. **验证多回合逻辑**
5. **确认UI响应正常**

测试模式让你可以快速迭代和验证游戏功能，无需依赖复杂的后端环境！