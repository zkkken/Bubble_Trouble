import { Devvit, Post } from '@devvit/public-api';
import '../server/index';
import { defineConfig } from '@devvit/server';
import { postConfigNew } from '../server/core/post';

defineConfig({
  name: '[Bolt] Cat Comfort Game',
  entry: 'index.html',
  height: 'tall',
  menu: { enable: false },
});

export const Preview: Devvit.BlockComponent<{ text?: string }> = ({ text = 'Loading...' }) => {
  return (
    <zstack width={'100%'} height={'100%'} alignment="center middle">
      <vstack width={'100%'} height={'100%'} alignment="center middle">
        <image
          url="loading.gif"
          description="Loading..."
          height={'140px'}
          width={'140px'}
          imageHeight={'240px'}
          imageWidth={'240px'}
        />
        <spacer size="small" />
        <text maxWidth={`80%`} size="large" weight="bold" alignment="center middle" wrap>
          {text}
        </text>
      </vstack>
    </zstack>
  );
};

// 🎯 修复：简化的游戏预览组件，不使用 assetURL
export const CatComfortGameDevvit: Devvit.BlockComponent = () => {
  return (
    <zstack width={'100%'} height={'100%'} alignment="center middle">
      <vstack width={'100%'} height={'100%'} alignment="center middle">
        <text size="xxlarge" weight="bold" color="white">
          🐱 Cat Comfort Game 🐱
        </text>
        <spacer size="medium" />
        
        <text color="white" alignment="center">
          🎮 Keep the cat comfortable! 🎮
        </text>
        <spacer size="small" />
        <text color="white" size="small" alignment="center">
          Control temperature to maintain cat comfort
        </text>
        <spacer size="small" />
        <text color="white" size="small" alignment="center">
          🔄 Watch out for control reversal interference!
        </text>
        <spacer size="medium" />
        
        {/* 游戏元素预览 */}
        <hstack gap="large" alignment="center">
          <vstack alignment="center">
            <text color="white" size="small">Sad Cat</text>
            <text size="xxlarge">😿</text>
          </vstack>
          
          <vstack alignment="center">
            <text color="white" size="small">Controls</text>
            <hstack gap="small">
              <text size="large">➖</text>
              <text size="large">🔧</text>
              <text size="large">➕</text>
            </hstack>
          </vstack>
          
          <vstack alignment="center">
            <text color="white" size="small">Happy Cat</text>
            <text size="xxlarge">😻</text>
          </vstack>
        </hstack>
        
        <spacer size="medium" />
        <text color="white" size="small" alignment="center">
          🌡️ Temperature Control • 😸 Cat Comfort • ⏰ Time Challenge
        </text>
        <spacer size="small" />
        <text color="white" size="small" alignment="center">
          Click to start playing!
        </text>
      </vstack>
    </zstack>
  );
};

Devvit.addMenuItem({
  label: '[Bolt Cat Comfort Game]: New Post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (event, context) => {
    const { reddit, ui } = context;

    let post: Post | undefined;
    try {
      const subreddit = await reddit.getCurrentSubreddit();
      
      // 🎯 修复：直接使用简化的预览组件，不涉及 assetURL
      post = await reddit.submitPost({
        title: 'Cat Comfort Game - Keep the Cat Happy! 🐱',
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
        await post.remove(false);
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

export default Devvit;