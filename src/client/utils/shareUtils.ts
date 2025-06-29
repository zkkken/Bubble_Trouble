/**
 * 游戏结果分享和下载工具函数
 * 基于Devvit游戏分享技术文档实现
 */

// 捕获游戏完成界面截图
export const captureGameCompletionScreenshot = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // 查找GameCompletionScreen容器
      const gameCompletionContainer = document.querySelector('[data-testid="game-completion-screen"]') || 
                                    document.querySelector('.game-completion-screen') ||
                                    document.querySelector('[class*="GameCompletion"]') ||
                                    document.body;

      // 使用html2canvas截图（如果可用）
      if (typeof window !== 'undefined' && (window as any).html2canvas) {
        (window as any).html2canvas(gameCompletionContainer, {
          width: 724,
          height: 584,
          backgroundColor: '#2f2f2f',
          allowTaint: true,
          useCORS: true,
          scale: 1
        }).then((canvas: HTMLCanvasElement) => {
          const imageDataUrl = canvas.toDataURL('image/png');
          resolve(imageDataUrl);
        }).catch(reject);
      } else {
        // 降级方案：使用简化的截图方法
        captureElementAsImage(gameCompletionContainer as HTMLElement)
          .then(resolve)
          .catch(reject);
      }
    } catch (error) {
      reject(error);
    }
  });
};

// 简化的DOM截图方法
const captureElementAsImage = (element: HTMLElement): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // 创建canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('无法创建canvas上下文'));
        return;
      }

      // 设置canvas尺寸
      canvas.width = 724;
      canvas.height = 584;

      // 绘制背景
      ctx.fillStyle = '#2f2f2f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 绘制简化的游戏完成界面
      drawSimplifiedCompletionScreen(ctx, canvas.width, canvas.height);

      // 转换为Data URL
      const imageDataUrl = canvas.toDataURL('image/png');
      resolve(imageDataUrl);
    } catch (error) {
      reject(error);
    }
  });
};

// 绘制简化的游戏完成界面
const drawSimplifiedCompletionScreen = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  // 绘制背景
  ctx.fillStyle = '#2f2f2f';
  ctx.fillRect(0, 0, width, height);

  // 绘制装饰边框
  ctx.strokeStyle = '#F0BC08';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // 绘制标题
  ctx.fillStyle = '#F0BC08';
  ctx.font = 'bold 36px "Silkscreen", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Cat Shower Game', width / 2, 80);

  // 绘制完成提示
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px "Silkscreen", monospace';
  ctx.fillText('游戏完成！', width / 2, 130);

  // 绘制猫咪图标
  ctx.fillStyle = '#ff9500';
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, 80, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#000';
  ctx.font = '96px Arial';
  ctx.fillText('🐱', width / 2, height / 2 + 20);

  // 绘制底部信息
  ctx.fillStyle = '#F0BC08';
  ctx.font = 'bold 18px "Silkscreen", monospace';
  ctx.fillText('感谢游玩！', width / 2, height - 60);
};

// 绘制游戏结果图像
const drawGameResultImage = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  // 绘制背景
  ctx.fillStyle = '#2f2f2f';
  ctx.fillRect(0, 0, width, height);

  // 绘制游戏标题
  ctx.fillStyle = '#F0BC08';
  ctx.font = 'bold 48px "Silkscreen", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Cat Shower Game', width / 2, 80);

  // 绘制分数信息（这些需要从外部传入）
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px "Silkscreen", monospace';
  ctx.fillText('游戏完成！', width / 2, 150);
  
  // 绘制装饰边框
  ctx.strokeStyle = '#3A368E';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // 绘制猫咪图标(简化版)
  ctx.fillStyle = '#ff9500';
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, 60, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#000';
  ctx.font = '48px Arial';
  ctx.fillText('🐱', width / 2, height / 2 + 15);
};

// 捕获游戏完成界面截图（包含游戏数据的版本）
export const captureGameResultImage = (gameData: {
  playerName: string;
  score: number;
  time: string;
  continentName: string;
}): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      console.log('Capturing game completion screen for:', gameData.playerName);
      
      // 直接使用GameCompletionScreen的截图
      captureGameCompletionScreenshot()
        .then(resolve)
        .catch((error) => {
          console.warn('截图失败，使用降级方案:', error);
          // 降级方案：创建简单的结果图像
          createFallbackResultImage(gameData)
            .then(resolve)
            .catch(reject);
        });
    } catch (error) {
      reject(error);
    }
  });
};

// 降级方案：创建简单的结果图像
const createFallbackResultImage = (gameData: {
  playerName: string;
  score: number;
  time: string;
  continentName: string;
}): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('无法创建canvas上下文'));
        return;
      }

      canvas.width = 724;
      canvas.height = 584;

      // 绘制带有游戏数据的结果图像
      drawEnhancedGameResult(ctx, canvas.width, canvas.height, gameData);
      
      const imageDataUrl = canvas.toDataURL('image/png');
      resolve(imageDataUrl);
    } catch (error) {
      reject(error);
    }
  });
};

// 绘制增强版游戏结果
const drawEnhancedGameResult = (
  ctx: CanvasRenderingContext2D, 
  width: number, 
  height: number, 
  gameData: {
    playerName: string;
    score: number;
    time: string;
    continentName: string;
  }
) => {
  // 绘制背景渐变
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#4A90E2');
  gradient.addColorStop(1, '#2f2f2f');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 绘制装饰边框
  ctx.strokeStyle = '#F0BC08';
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // 绘制标题
  ctx.fillStyle = '#F0BC08';
  ctx.font = 'bold 42px "Silkscreen", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Cat Shower Champions', width / 2, 70);

  // 绘制玩家信息
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px "Silkscreen", monospace';
  ctx.fillText(`玩家: ${gameData.playerName}`, width / 2, 130);
  
  ctx.font = 'bold 24px "Silkscreen", monospace';
  ctx.fillText(`地区: ${gameData.continentName}`, width / 2, 170);

  // 绘制分数
  ctx.fillStyle = '#F0BC08';
  ctx.font = 'bold 48px "Silkscreen", monospace';
  ctx.fillText(`分数: ${gameData.score}`, width / 2, 250);

  // 绘制时间
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px "Silkscreen", monospace';
  ctx.fillText(`用时: ${gameData.time}`, width / 2, 300);

  // 绘制大猫咪图标
  ctx.fillStyle = '#ff9500';
  ctx.beginPath();
  ctx.arc(width / 2, 400, 80, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#000';
  ctx.font = '96px Arial';
  ctx.fillText('🐱', width / 2, 420);

  // 绘制挑战文字
  ctx.fillStyle = '#F0BC08';
  ctx.font = 'bold 20px "Silkscreen", monospace';
  ctx.fillText('你能超越我吗？', width / 2, 520);
  ctx.fillText('来挑战Cat Shower Game！', width / 2, 550);
};

// 下载图像文件
export const downloadImage = (dataUrl: string, filename: string = 'cat-shower-result.png') => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 直接分享文本到剪贴板（新的简化分享方式）
export const shareResultToClipboard = async (gameData: {
  playerName: string;
  time: string;
}): Promise<boolean> => {
  try {
    const gamePostUrl = getCurrentGamePostUrl();
    const shareText = generateShareText(gameData, gamePostUrl);
    
    const success = await copyToClipboard(shareText);
    console.log('分享文本复制结果:', success);
    return success;
  } catch (error) {
    console.error('分享到剪贴板失败:', error);
    return false;
  }
};

// 发送分享请求到Devvit后端（保留用于可能的后续功能）
export const shareResultToReddit = (gameData: {
  playerName: string;
  score: number;
  time: string;
  continentName: string;
  imageData?: string;
}) => {
  // 通过postMessage发送到Devvit后端
  if (typeof window !== 'undefined' && window.parent) {
    console.log('Sending share request to Devvit backend:', gameData);
    
    // 获取当前游戏帖子链接
    const gamePostUrl = getCurrentGamePostUrl();
    
    window.parent.postMessage({
      type: 'shareGameResult',
      payload: {
        playerName: gameData.playerName,
        score: gameData.score,
        time: gameData.time,
        continentName: gameData.continentName,
        imageData: gameData.imageData,
        gamePostUrl: gamePostUrl,
        timestamp: Date.now()
      }
    }, '*');
  } else {
    console.warn('无法发送分享请求：不在Devvit环境中');
  }
};

// 获取当前游戏帖子的URL
export const getCurrentGamePostUrl = (): string => {
  try {
    // 尝试从多个来源获取游戏帖子URL
    
    // 方法1：从window.location获取
    if (window.location.href.includes('reddit.com')) {
      return window.location.href;
    }
    
    // 方法2：从parent window获取
    if (window.parent && window.parent.location) {
      try {
        return window.parent.location.href;
      } catch (e) {
        // 跨域限制，忽略错误
      }
    }
    
    // 方法3：从document.referrer获取
    if (document.referrer && document.referrer.includes('reddit.com')) {
      return document.referrer;
    }
    
    // 降级方案：返回一个通用的Reddit游戏链接
    return 'https://www.reddit.com/r/catshowergame';
  } catch (error) {
    console.warn('无法获取游戏帖子URL:', error);
    return 'https://www.reddit.com/r/catshowergame';
  }
};

// 生成分享文案
export const generateShareText = (gameData: {
  playerName: string;
  time: string;
}, gamePostUrl: string): string => {
  const gameName = 'Cat Shower Game';
  
  return `玩家🐱 ${gameData.playerName} 在${gameName}中坚持了 ${gameData.time}！

🎮 **游戏结果分享** 🎮

👤 **玩家**: ${gameData.playerName}
⏱️ **坚持时长**: ${gameData.time}

🏆 ${gameData.playerName} 在 ${gameName} 中表现出色！

你能超越这个成绩吗？快来挑战吧！ 🐾
${gamePostUrl}
---
*通过 ${gameName} 自动分享*`;
};

// 模拟分享功能（用于非Devvit环境的测试）
export const simulateShare = (gameData: {
  playerName: string;
  score: number;
  time: string;
  continentName: string;
}) => {
  // 使用新的分享文案格式
  const gamePostUrl = getCurrentGamePostUrl();
  const shareText = generateShareText(gameData, gamePostUrl);
  
  // 尝试使用Web Share API
  if (navigator.share) {
    navigator.share({
      title: 'Cat Shower Game 成绩分享',
      text: shareText,
      url: gamePostUrl
    }).catch(console.error);
  } else {
    // 降级到复制到剪贴板
    copyToClipboard(shareText);
  }
};

// 复制链接到剪贴板
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'absolute';
      textArea.style.left = '-999999px';
      document.body.prepend(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        return true;
      } catch (error) {
        console.error(error);
        return false;
      } finally {
        textArea.remove();
      }
    }
  } catch (error) {
    console.error('复制失败:', error);
    return false;
  }
}; 