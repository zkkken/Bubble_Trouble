import { Devvit, Post, useWebView } from '@devvit/public-api';
import '../server/index';
import { defineConfig } from '@devvit/server';
import { postConfigNew } from '../server/core/post';
import { 
  getScaleFactor, 
  getResponsiveFontSize, 
  getResponsiveSpacing, 
  getViewportWidth,
  logResponsiveInfo,
  BASE_WIDTH
} from './utils';

defineConfig({
  name: 'BubbleTrouble',
  entry: 'index.html',
  height: 'tall',
  menu: { enable: false },
});

export const Preview: Devvit.BlockComponent<{ text?: string }> = ({ text = 'Loading...' }, context) => {
  try {
    // 第二阶段：建立全局缩放基准（使用兼容性方法）
    const viewportWidth = getViewportWidth(context);
    const scaleFactor = getScaleFactor(viewportWidth);
    
    // 响应式调试信息
    logResponsiveInfo(viewportWidth, scaleFactor);
    
    // 第三阶段：实施全局像素级完美缩放
    const titleFontSize = getResponsiveFontSize(18, scaleFactor);
    const spacing = getResponsiveSpacing(16, scaleFactor);
    const imageSize = Math.round(140 * scaleFactor);
    
    return (
      <zstack width={'100%'} height={'100%'} alignment="center middle">
        <vstack width={'100%'} height={'100%'} alignment="center middle" gap={spacing}>
          <image
            url="loading.gif"
            description="Loading..."
            height={`${imageSize}px`}
            width={`${imageSize}px`}
            imageHeight={imageSize}
            imageWidth={imageSize}
          />
          <text maxWidth={`80%`} size={titleFontSize} weight="bold" alignment="center middle" wrap>
            {text}
          </text>
        </vstack>
      </zstack>
    );
  } catch (error) {
    console.error('🚨 Preview render error:', error);
    return (
      <zstack width={'100%'} height={'100%'} alignment="center middle">
        <text size="medium" color="red">Preview Error: {error?.toString() || 'Unknown error'}</text>
      </zstack>
    );
  }
};

// 响应式游戏预览组件，支持错误处理和完美缩放
export const CatComfortGameDevvit: Devvit.BlockComponent = (_, context) => {
  try {
    // 第二阶段：建立全局缩放基准（使用兼容性方法）
    const viewportWidth = getViewportWidth(context);
    const scaleFactor = getScaleFactor(viewportWidth);
    
    // 响应式调试信息
    logResponsiveInfo(viewportWidth, scaleFactor);
    
    // 第三阶段：实施全局像素级完美缩放
    // 字体缩放（基于724px设计稿的原始像素大小）
    const titleFontSize = getResponsiveFontSize(28, scaleFactor);          // 主标题：28px
    const subtitleFontSize = getResponsiveFontSize(16, scaleFactor);       // 副标题：16px  
    const bodyFontSize = getResponsiveFontSize(14, scaleFactor);           // 正文：14px
    const emojiFontSize = getResponsiveFontSize(32, scaleFactor);          // emoji：32px
    const controlFontSize = getResponsiveFontSize(18, scaleFactor);        // 控制按钮：18px
    const debugFontSize = getResponsiveFontSize(12, scaleFactor);          // 调试信息：12px
    const smallDebugFontSize = getResponsiveFontSize(10, scaleFactor);     // 小调试信息：10px
    
    // 间距缩放（基于724px设计稿的原始像素大小）
    const largeSpacing = getResponsiveSpacing(24, scaleFactor);            // 大间距：24px
    const mediumSpacing = getResponsiveSpacing(16, scaleFactor);           // 中间距：16px
    const smallSpacing = getResponsiveSpacing(8, scaleFactor);             // 小间距：8px

    console.log(`🎮 Devvit Component: Viewport ${viewportWidth}px, Scale ${scaleFactor.toFixed(3)}`);

    return (
      <zstack width={'100%'} height={'100%'} alignment="center middle">
        <vstack width={'100%'} height={'100%'} alignment="center middle" gap={mediumSpacing}>
          {/* 主标题区域 - 完全响应式 */}
          <vstack alignment="center middle" gap={smallSpacing}>
            <text size={titleFontSize} weight="bold" color="white">
              🐱 Bubble Trouble 🐱
            </text>
            <text color="white" size={subtitleFontSize} alignment="center">
              🎮 Keep the cat comfortable! 🎮
            </text>
          </vstack>
          
          {/* 游戏说明区域 - 响应式间距 */}
          <vstack alignment="center middle" gap={smallSpacing}>
            <text color="white" size={bodyFontSize} alignment="center">
              Control temperature to maintain cat comfort
            </text>
            <text color="white" size={bodyFontSize} alignment="center">
              🔄 Watch out for control reversal interference!
            </text>
          </vstack>
          
          {/* 游戏元素预览区域 - 响应式布局 */}
          <vstack alignment="center middle" gap={mediumSpacing}>
            <hstack gap={largeSpacing} alignment="center middle">
              <vstack alignment="center middle" gap={smallSpacing}>
                <text color="white" size={bodyFontSize}>Sad Cat</text>
                <text size={emojiFontSize}>😿</text>
              </vstack>
              
              <vstack alignment="center middle" gap={smallSpacing}>
                <text color="white" size={bodyFontSize}>Controls</text>
                <hstack gap={smallSpacing} alignment="center middle">
                  <text size={controlFontSize}>➖</text>
                  <text size={controlFontSize}>🔧</text>
                  <text size={controlFontSize}>➕</text>
                </hstack>
              </vstack>
              
              <vstack alignment="center middle" gap={smallSpacing}>
                <text color="white" size={bodyFontSize}>Happy Cat</text>
                <text size={emojiFontSize}>😻</text>
              </vstack>
            </hstack>
            
            {/* 功能说明区域 */}
            <vstack alignment="center middle" gap={smallSpacing}>
              <text color="white" size={bodyFontSize} alignment="center">
                🌡️ Temperature Control • 😸 Cat Comfort • ⏰ Time Challenge
              </text>
              <text color="white" size={bodyFontSize} alignment="center">
                Click to start playing!
              </text>
            </vstack>
          </vstack>
          
          {/* 响应式提示信息 */}
          <vstack alignment="center middle" gap={smallSpacing}>
            <text color="gray" size={debugFontSize} alignment="center">
              Viewport: {viewportWidth}px • Scale: {scaleFactor.toFixed(2)}x
            </text>
            <text color="gray" size={smallDebugFontSize} alignment="center">
              Optimized for {BASE_WIDTH}px baseline design
            </text>
          </vstack>
        </vstack>
      </zstack>
    );
  } catch (error) {
    // 第一阶段：渲染错误捕获 - 关键指令
    console.error('🚨 Devvit render error caught:', error);
    
    return (
      <zstack width={'100%'} height={'100%'} alignment="center middle">
        <vstack alignment="center middle" gap="medium">
          <text size="large" weight="bold" color="red">
            ⚠️ 渲染错误
          </text>
          <text size="medium" color="white" alignment="center">
            An error occurred during render: {error?.toString() || 'Unknown error'}
          </text>
          <text size="small" color="white" alignment="center">
            Please refresh the page or contact support.
          </text>
          <text size="xsmall" color="gray" alignment="center">
            Error logged for debugging purposes.
          </text>
        </vstack>
      </zstack>
    );
  }
};

Devvit.addMenuItem({
  label: 'Bubble_Trouble: New Post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_, context) => {
    const { reddit, ui } = context;

    let post: Post | undefined;
    try {
      const subreddit = await reddit.getCurrentSubreddit();
      
      // 使用响应式预览组件
      post = await reddit.submitPost({
        title: 'Bubble Trouble - Keep the Cat Happy! 🐱',
        subredditName: subreddit.name,
        preview: <CatComfortGameDevvit />,
      });
      
      await postConfigNew({
        redis: context.redis,
        postId: post.id,
      });
      
      ui.showToast({ text: '🎉 Created Cat Comfort Game post!' });
      ui.navigateTo(post.url);
    } catch (error) {
      if (post) {
        try {
          await post.remove(false);
        } catch (removeError) {
          console.error('Error removing post after creation failure:', removeError);
        }
        try {
          await post.remove(false);
        } catch (removeError) {
          console.error('Error removing post after creation failure:', removeError);
        }
      }
      if (error instanceof Error) {
        ui.showToast({ text: `❌ Error creating post: ${error.message}` });
        console.error('Error creating post:', error);
      } else {
        ui.showToast({ text: '❌ Error creating post!' });
        console.error('Unknown error creating post:', error);
      }
    }
  },
});

// 注意：分享功能需要在实际的WebView帖子中实现
// 这里暂时保留原有的菜单项功能，分享功能将在WebView中通过postMessage实现

// 处理游戏结果分享请求
export async function handleShareGameResult(payload: any, context: any) {
  try {
    const { playerName, score, time, continentName, gamePostUrl } = payload;
    console.log('Processing share request for player:', playerName);
    
    // 获取当前subreddit
    const subreddit = await context.reddit.getCurrentSubreddit();
    const gameName = 'Cat Shower Game';
    
    // 使用新的分享文案格式
    const shareTitle = `玩家🐱 ${playerName} 在${gameName}中获得了 ${score}% 的成绩！`;
    
    const shareContent = `🎮 **游戏结果分享** 🎮

👤 **玩家**: ${playerName}
🌍 **地区**: ${continentName}
📊 **成绩**: ${score}%
⏱️ **用时**: ${time}

🏆 ${playerName} 在 ${gameName} 中表现出色！

你能超越这个成绩吗？快来挑战吧！ 🐾
${gamePostUrl || 'https://www.reddit.com/r/catshowergame'}
---
*通过 ${gameName} 自动分享*`;
    
    // 创建新的Reddit帖子
    const resultPost = await context.reddit.submitPost({
      subredditName: subreddit.name,
      title: shareTitle,
      text: shareContent
    });
    
    console.log('Share post created successfully:', resultPost.id);
    
    // 发送成功消息回WebView
    if (context.ui && context.ui.postMessage) {
      context.ui.postMessage({
        type: 'shareResultSuccess',
        payload: {
          url: resultPost.url,
          postId: resultPost.id
        }
      });
    }
    
    // 显示成功提示
    if (context.ui && context.ui.showToast) {
      context.ui.showToast({ text: '🎉 分享成功！帖子已创建' });
    }
    
    return resultPost;
    
  } catch (error) {
    console.error('Error creating share post:', error);
    
    // 发送错误消息回WebView
    if (context.ui && context.ui.postMessage) {
      context.ui.postMessage({
        type: 'shareResultError',
        payload: { 
          error: typeof error === 'object' && error && 'message' in error 
            ? (error as Error).message 
            : '分享失败，请稍后再试' 
        }
      });
    }
    
    if (context.ui && context.ui.showToast) {
      context.ui.showToast({ text: '❌ 分享失败，请稍后再试' });
    }
    
    throw error;
  }
}

// 辅助函数：处理游戏结果分享（简化版本，保持向后兼容）
export async function createSharePost(gameData: {
  playerName: string;
  score: number;
  time: string;
  continentName: string;
}, context: any) {
  return handleShareGameResult(gameData, context);
}

export default Devvit;