import { Devvit, Post, Context } from '@devvit/public-api';
import '../server/index';
import { defineConfig } from '@devvit/server';
import { postConfigNew } from '../server/core/post';

defineConfig({
  name: '[Bolt] Cat Comfort Game',
  entry: 'index.html',
  height: 'tall',
  menu: { enable: false },
});

// 响应式辅助函数
const getResponsiveFontSize = (baseSizeInPx: number, scaleFactor: number): 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge' => {
  const targetSize = baseSizeInPx * scaleFactor;
  
  if (targetSize >= 24) return 'xxlarge';
  if (targetSize >= 18) return 'xlarge';
  if (targetSize >= 16) return 'large';
  if (targetSize >= 14) return 'medium';
  if (targetSize >= 12) return 'small';
  return 'xsmall';
};

const getResponsiveSpacing = (baseSizeInPx: number, scaleFactor: number): 'xsmall' | 'small' | 'medium' | 'large' => {
  const targetSize = baseSizeInPx * scaleFactor;
  
  if (targetSize >= 32) return 'large';
  if (targetSize >= 16) return 'medium';
  if (targetSize >= 8) return 'small';
  return 'xsmall';
};

export const Preview: Devvit.BlockComponent<{ text?: string }> = ({ text = 'Loading...' }, context) => {
  const scaleFactor = context.uiEnvironment.viewport.width / 724;
  
  return (
    <zstack width={'100%'} height={'100%'} alignment="center middle">
      <vstack width={'100%'} height={'100%'} alignment="center middle">
        <image
          url="loading.gif"
          description="Loading..."
          height={140 * scaleFactor}
          width={140 * scaleFactor}
          imageHeight={240 * scaleFactor}
          imageWidth={240 * scaleFactor}
        />
        <spacer size={getResponsiveSpacing(8, scaleFactor)} />
        <text 
          maxWidth={`80%`} 
          size={getResponsiveFontSize(16, scaleFactor)} 
          weight="bold" 
          alignment="center middle" 
          wrap
        >
          {text}
        </text>
      </vstack>
    </zstack>
  );
};

// 响应式游戏预览组件
export const CatComfortGameDevvit: Devvit.BlockComponent = (_, context) => {
  const scaleFactor = context.uiEnvironment.viewport.width / 724;
  
  return (
    <zstack width={'100%'} height={'100%'} alignment="center middle">
      <vstack width={'100%'} height={'100%'} alignment="center middle" gap={getResponsiveSpacing(16, scaleFactor)}>
        {/* 主标题 */}
        <text size={getResponsiveFontSize(32, scaleFactor)} weight="bold" color="white">
          🐱 Cat Comfort Game 🐱
        </text>
        <spacer size={getResponsiveSpacing(16, scaleFactor)} />
        
        {/* 游戏描述 */}
        <text color="white" alignment="center" size={getResponsiveFontSize(16, scaleFactor)}>
          🎮 Keep the cat comfortable! 🎮
        </text>
        <spacer size={getResponsiveSpacing(8, scaleFactor)} />
        <text color="white" size={getResponsiveFontSize(14, scaleFactor)} alignment="center">
          Control temperature to maintain cat comfort
        </text>
        <spacer size={getResponsiveSpacing(8, scaleFactor)} />
        <text color="white" size={getResponsiveFontSize(14, scaleFactor)} alignment="center">
          🔄 Watch out for control reversal interference!
        </text>
        <spacer size={getResponsiveSpacing(16, scaleFactor)} />
        
        {/* 游戏元素预览 */}
        <hstack gap={getResponsiveSpacing(32, scaleFactor)} alignment="center">
          <vstack alignment="center" gap={getResponsiveSpacing(8, scaleFactor)}>
            <text color="white" size={getResponsiveFontSize(12, scaleFactor)}>Sad Cat</text>
            <text size={getResponsiveFontSize(24, scaleFactor)}>😿</text>
          </vstack>
          
          <vstack alignment="center" gap={getResponsiveSpacing(8, scaleFactor)}>
            <text color="white" size={getResponsiveFontSize(12, scaleFactor)}>Controls</text>
            <hstack gap={getResponsiveSpacing(8, scaleFactor)}>
              <text size={getResponsiveFontSize(18, scaleFactor)}>➖</text>
              <text size={getResponsiveFontSize(18, scaleFactor)}>🔧</text>
              <text size={getResponsiveFontSize(18, scaleFactor)}>➕</text>
            </hstack>
          </vstack>
          
          <vstack alignment="center" gap={getResponsiveSpacing(8, scaleFactor)}>
            <text color="white" size={getResponsiveFontSize(12, scaleFactor)}>Happy Cat</text>
            <text size={getResponsiveFontSize(24, scaleFactor)}>😻</text>
          </vstack>
        </hstack>
        
        <spacer size={getResponsiveSpacing(16, scaleFactor)} />
        
        {/* 游戏特性说明 */}
        <vstack alignment="center" gap={getResponsiveSpacing(4, scaleFactor)}>
          <text color="white" size={getResponsiveFontSize(12, scaleFactor)} alignment="center">
            🌡️ Temperature Control • 😸 Cat Comfort • ⏰ Time Challenge
          </text>
          <spacer size={getResponsiveSpacing(8, scaleFactor)} />
          <text color="white" size={getResponsiveFontSize(12, scaleFactor)} alignment="center">
            Click to start playing!
          </text>
        </vstack>
      </vstack>
    </zstack>
  );
};

// 响应式游戏界面组件
export const ResponsiveGameInterface: Devvit.BlockComponent = (_, context) => {
  const scaleFactor = context.uiEnvironment.viewport.width / 724;
  
  return (
    <zstack width={'100%'} height={'100%'}>
      {/* 背景 */}
      <image
        url="background.png"
        description="Game Background"
        width={724 * scaleFactor}
        height={584 * scaleFactor}
        imageWidth={724 * scaleFactor}
        imageHeight={584 * scaleFactor}
        resizeMode="cover"
      />
      
      {/* 游戏UI层 */}
      <vstack width={'100%'} height={'100%'} alignment="top start" padding={getResponsiveSpacing(16, scaleFactor)}>
        {/* 顶部状态栏 */}
        <hstack width={'100%'} alignment="space-between">
          {/* 计时器 */}
          <hstack alignment="center middle" gap={getResponsiveSpacing(8, scaleFactor)}>
            <text size={getResponsiveFontSize(24, scaleFactor)} weight="bold" color="white">
              ⏰
            </text>
            <text size={getResponsiveFontSize(28, scaleFactor)} weight="bold" color="white">
              02:30
            </text>
          </hstack>
          
          {/* 音乐按钮 */}
          <image
            url="Button_Music_On.png"
            description="Music Toggle"
            width={80 * scaleFactor}
            height={36 * scaleFactor}
            imageWidth={80 * scaleFactor}
            imageHeight={36 * scaleFactor}
          />
        </hstack>
        
        <spacer size={getResponsiveSpacing(24, scaleFactor)} />
        
        {/* 状态指示器 */}
        <hstack width={'100%'} alignment="space-between">
          <image
            url="avatar-bad.png"
            description="Sad Cat"
            width={28 * scaleFactor}
            height={28 * scaleFactor}
            imageWidth={28 * scaleFactor}
            imageHeight={28 * scaleFactor}
          />
          <image
            url="avatar-yellowsmiley.png"
            description="Happy Cat"
            width={28 * scaleFactor}
            height={28 * scaleFactor}
            imageWidth={28 * scaleFactor}
            imageHeight={28 * scaleFactor}
          />
        </hstack>
        
        <spacer size={getResponsiveSpacing(16, scaleFactor)} />
        
        {/* 舒适度进度条 */}
        <vstack width={'100%'} gap={getResponsiveSpacing(4, scaleFactor)}>
          <hstack width={'100%'} height={24 * scaleFactor} backgroundColor="#d9d9d9" cornerRadius="small">
            <hstack width="75%" height={'100%'} backgroundColor="#5ff367" />
          </hstack>
        </vstack>
        
        <spacer size={getResponsiveSpacing(8, scaleFactor)} />
        
        {/* 温度进度条系统 */}
        <vstack width={'100%'} gap={getResponsiveSpacing(8, scaleFactor)}>
          <hstack width={'100%'} height={24 * scaleFactor} backgroundColor="#d9d9d9" cornerRadius="small">
            {/* 容忍带 */}
            <hstack width="20%" height={'100%'} backgroundColor="#ff9500" />
            {/* 当前温度 */}
            <hstack width="50%" height={'100%'} backgroundColor="#728cff" />
          </hstack>
          
          {/* 目标温度显示 */}
          <hstack width={'100%'} alignment="center middle">
            <text size={getResponsiveFontSize(18, scaleFactor)} weight="bold" color="#F0BC08">
              25°C
            </text>
          </hstack>
        </vstack>
        
        <spacer size={getResponsiveSpacing(32, scaleFactor)} />
        
        {/* 中央猫咪 */}
        <hstack width={'100%'} alignment="center middle">
          <image
            url="Cat_1.png"
            description="Cat in shower"
            width={120 * scaleFactor}
            height={120 * scaleFactor}
            imageWidth={120 * scaleFactor}
            imageHeight={120 * scaleFactor}
          />
        </hstack>
        
        <spacer size={getResponsiveSpacing(32, scaleFactor)} />
        
        {/* 控制按钮 */}
        <hstack width={'100%'} alignment="space-between">
          {/* 减温按钮 */}
          <image
            url="button-temp-minus.png"
            description="Decrease Temperature"
            width={56 * scaleFactor}
            height={56 * scaleFactor}
            imageWidth={56 * scaleFactor}
            imageHeight={56 * scaleFactor}
          />
          
          {/* 中央交互按钮 */}
          <image
            url="button-center-interaction.png"
            description="Center Interaction"
            width={80 * scaleFactor}
            height={80 * scaleFactor}
            imageWidth={80 * scaleFactor}
            imageHeight={80 * scaleFactor}
          />
          
          {/* 加温按钮 */}
          <image
            url="button-temp-plus.png"
            description="Increase Temperature"
            width={56 * scaleFactor}
            height={56 * scaleFactor}
            imageWidth={56 * scaleFactor}
            imageHeight={56 * scaleFactor}
          />
        </hstack>
      </vstack>
    </zstack>
  );
};

// 响应式启动界面
export const ResponsiveLaunchScreen: Devvit.BlockComponent = (_, context) => {
  const scaleFactor = context.uiEnvironment.viewport.width / 724;
  
  return (
    <zstack width={'100%'} height={'100%'}>
      {/* 背景 */}
      <image
        url="Bg_Main.png"
        description="Launch Background"
        width={724 * scaleFactor}
        height={584 * scaleFactor}
        imageWidth={724 * scaleFactor}
        imageHeight={584 * scaleFactor}
        resizeMode="cover"
      />
      
      {/* 内容层 */}
      <vstack width={'100%'} height={'100%'} alignment="center middle" gap={getResponsiveSpacing(16, scaleFactor)}>
        {/* 游戏标题 */}
        <image
          url="Title_BubbleTrouble.png"
          description="Game Title"
          width={259 * scaleFactor}
          height={259 * scaleFactor}
          imageWidth={259 * scaleFactor}
          imageHeight={259 * scaleFactor}
        />
        
        {/* 副标题 */}
        <image
          url="Are_You_Ready_For_A_Wash.png"
          description="Are you ready for a wash?"
          width={300 * scaleFactor}
          height={60 * scaleFactor}
          imageWidth={300 * scaleFactor}
          imageHeight={60 * scaleFactor}
        />
        
        <spacer size={getResponsiveSpacing(32, scaleFactor)} />
        
        {/* 开始按钮 */}
        <image
          url="Button_Start.png"
          description="Start Game"
          width={155 * scaleFactor}
          height={72 * scaleFactor}
          imageWidth={155 * scaleFactor}
          imageHeight={72 * scaleFactor}
        />
        
        <spacer size={getResponsiveSpacing(64, scaleFactor)} />
        
        {/* 底部控制按钮 */}
        <hstack gap={getResponsiveSpacing(40, scaleFactor)} alignment="center middle">
          <image
            url="Button_Music_On.png"
            description="Music Toggle"
            width={124 * scaleFactor}
            height={53 * scaleFactor}
            imageWidth={124 * scaleFactor}
            imageHeight={53 * scaleFactor}
          />
          <image
            url="Button_Help.png"
            description="Help"
            width={120 * scaleFactor}
            height={53 * scaleFactor}
            imageWidth={120 * scaleFactor}
            imageHeight={53 * scaleFactor}
          />
        </hstack>
      </vstack>
    </zstack>
  );
};

// 响应式游戏选择界面
export const ResponsiveGameSelectionScreen: Devvit.BlockComponent = (_, context) => {
  const scaleFactor = context.uiEnvironment.viewport.width / 724;
  
  return (
    <zstack width={'100%'} height={'100%'}>
      {/* 背景 */}
      <image
        url="Bg_Main.png"
        description="Selection Background"
        width={724 * scaleFactor}
        height={584 * scaleFactor}
        imageWidth={724 * scaleFactor}
        imageHeight={584 * scaleFactor}
        resizeMode="cover"
      />
      
      {/* 主卡片容器 */}
      <vstack width={'100%'} height={'100%'} alignment="center middle">
        <vstack 
          width={607 * scaleFactor} 
          height={489 * scaleFactor}
          backgroundColor="#b7efff"
          cornerRadius="large"
          padding={getResponsiveSpacing(20, scaleFactor)}
          gap={getResponsiveSpacing(16, scaleFactor)}
          alignment="center middle"
        >
          {/* 标题 */}
          <image
            url="Title_ChooseYouCat.png"
            description="Choose Your Cat"
            width={412 * scaleFactor}
            height={60 * scaleFactor}
            imageWidth={412 * scaleFactor}
            imageHeight={60 * scaleFactor}
          />
          
          {/* 玩家名字输入区域 */}
          <hstack 
            width={531 * scaleFactor} 
            height={59 * scaleFactor}
            backgroundColor="#f9f2e6"
            cornerRadius="large"
            padding={getResponsiveSpacing(16, scaleFactor)}
            alignment="center middle"
          >
            <text size={getResponsiveFontSize(24, scaleFactor)} color="gray">
              Type your name here
            </text>
            <spacer grow />
            <image
              url="Button_Random.png"
              description="Random Name"
              width={49 * scaleFactor}
              height={49 * scaleFactor}
              imageWidth={49 * scaleFactor}
              imageHeight={49 * scaleFactor}
            />
          </hstack>
          
          {/* 地图区域 */}
          <image
            url="map.png"
            description="World Map"
            width={364 * scaleFactor}
            height={222 * scaleFactor}
            imageWidth={364 * scaleFactor}
            imageHeight={222 * scaleFactor}
          />
          
          {/* 猫咪选择区域 */}
          <hstack gap={getResponsiveSpacing(13, scaleFactor)} alignment="center middle">
            <image
              url="Map_Cat_1.png"
              description="Cat 1"
              width={48 * scaleFactor}
              height={48 * scaleFactor}
              imageWidth={48 * scaleFactor}
              imageHeight={48 * scaleFactor}
            />
            <image
              url="Map_Cat_2.png"
              description="Cat 2"
              width={48 * scaleFactor}
              height={48 * scaleFactor}
              imageWidth={48 * scaleFactor}
              imageHeight={48 * scaleFactor}
            />
            <image
              url="Map_Cat_3.png"
              description="Cat 3"
              width={49 * scaleFactor}
              height={49 * scaleFactor}
              imageWidth={49 * scaleFactor}
              imageHeight={49 * scaleFactor}
            />
            <image
              url="Map_Cat_4.png"
              description="Cat 4"
              width={45 * scaleFactor}
              height={55 * scaleFactor}
              imageWidth={45 * scaleFactor}
              imageHeight={55 * scaleFactor}
            />
            <image
              url="Map_Cat_5.png"
              description="Cat 5"
              width={49 * scaleFactor}
              height={49 * scaleFactor}
              imageWidth={49 * scaleFactor}
              imageHeight={49 * scaleFactor}
            />
            <image
              url="Cat_5.png"
              description="Cat 6"
              width={49 * scaleFactor}
              height={49 * scaleFactor}
              imageWidth={49 * scaleFactor}
              imageHeight={49 * scaleFactor}
            />
          </hstack>
        </vstack>
        
        {/* 底部按钮 */}
        <spacer size={getResponsiveSpacing(32, scaleFactor)} />
        <hstack gap={getResponsiveSpacing(50, scaleFactor)} alignment="center middle">
          <image
            url="Close button.png"
            description="Close"
            width={110 * scaleFactor}
            height={51 * scaleFactor}
            imageWidth={110 * scaleFactor}
            imageHeight={51 * scaleFactor}
          />
          <image
            url="Button_Start.png"
            description="Start Game"
            width={110 * scaleFactor}
            height={51 * scaleFactor}
            imageWidth={110 * scaleFactor}
            imageHeight={51 * scaleFactor}
          />
        </hstack>
      </vstack>
    </zstack>
  );
};

// 响应式游戏完成界面
export const ResponsiveGameCompletionScreen: Devvit.BlockComponent = (_, context) => {
  const scaleFactor = context.uiEnvironment.viewport.width / 724;
  
  return (
    <zstack width={'100%'} height={'100%'}>
      {/* 游戏背景（半透明） */}
      <image
        url="background.png"
        description="Game Background"
        width={724 * scaleFactor}
        height={584 * scaleFactor}
        imageWidth={724 * scaleFactor}
        imageHeight={584 * scaleFactor}
        resizeMode="cover"
      />
      
      {/* 半透明遮罩 */}
      <hstack width={'100%'} height={'100%'} backgroundColor="rgba(84, 84, 84, 0.5)" />
      
      {/* 主卡片 */}
      <vstack width={'100%'} height={'100%'} alignment="center middle">
        <vstack 
          width={394 * scaleFactor} 
          height={521 * scaleFactor}
          alignment="center middle"
          gap={getResponsiveSpacing(16, scaleFactor)}
        >
          {/* 卡片背景 */}
          <image
            url="card-bg-1.png"
            description="Card Background"
            width={394 * scaleFactor}
            height={521 * scaleFactor}
            imageWidth={394 * scaleFactor}
            imageHeight={521 * scaleFactor}
          />
          
          {/* 玩家名牌和猫咪 */}
          <vstack alignment="center middle" gap={getResponsiveSpacing(8, scaleFactor)}>
            <image
              url="nametag.png"
              description="Name Tag"
              width={105 * scaleFactor}
              height={66 * scaleFactor}
              imageWidth={105 * scaleFactor}
              imageHeight={66 * scaleFactor}
            />
            <image
              url="Cat_1.png"
              description="Player Cat"
              width={120 * scaleFactor}
              height={120 * scaleFactor}
              imageWidth={120 * scaleFactor}
              imageHeight={120 * scaleFactor}
            />
          </vstack>
          
          {/* 成绩卡片 */}
          <vstack gap={getResponsiveSpacing(8, scaleFactor)} alignment="center middle">
            {/* 排名状态 */}
            <hstack 
              width={350 * scaleFactor} 
              height={63 * scaleFactor}
              backgroundColor="#e6f9ff"
              cornerRadius="medium"
              padding={getResponsiveSpacing(12, scaleFactor)}
              alignment="center middle"
              gap={getResponsiveSpacing(12, scaleFactor)}
            >
              <image
                url="rankingbadge--1.png"
                description="Ranking Badge"
                width={36 * scaleFactor}
                height={36 * scaleFactor}
                imageWidth={36 * scaleFactor}
                imageHeight={36 * scaleFactor}
              />
              <text size={getResponsiveFontSize(24, scaleFactor)} color="black">
                Asia is #1
              </text>
            </hstack>
            
            {/* 成绩状态 */}
            <hstack 
              width={350 * scaleFactor} 
              height={72 * scaleFactor}
              backgroundColor="#e6f9ff"
              cornerRadius="medium"
              padding={getResponsiveSpacing(12, scaleFactor)}
              alignment="center middle"
              gap={getResponsiveSpacing(12, scaleFactor)}
            >
              <image
                url="icon-victoryhand.png"
                description="Victory Hand"
                width={36 * scaleFactor}
                height={36 * scaleFactor}
                imageWidth={36 * scaleFactor}
                imageHeight={36 * scaleFactor}
              />
              <vstack alignment="start">
                <text size={getResponsiveFontSize(24, scaleFactor)} color="black">
                  Scrubbed for 2:30
                </text>
                <text size={getResponsiveFontSize(28, scaleFactor)} color="#ffc106" weight="bold">
                  out-soaked 85% of players!
                </text>
              </vstack>
            </hstack>
          </vstack>
          
          {/* 操作按钮 */}
          <hstack gap={getResponsiveSpacing(16, scaleFactor)} alignment="center middle">
            <image
              url="icon-restart.png"
              description="Restart"
              width={56 * scaleFactor}
              height={56 * scaleFactor}
              imageWidth={56 * scaleFactor}
              imageHeight={56 * scaleFactor}
            />
            <image
              url="icon-share.png"
              description="Share"
              width={56 * scaleFactor}
              height={56 * scaleFactor}
              imageWidth={56 * scaleFactor}
              imageHeight={56 * scaleFactor}
            />
            <image
              url="icon-ranking.png"
              description="Ranking"
              width={59 * scaleFactor}
              height={59 * scaleFactor}
              imageWidth={59 * scaleFactor}
              imageHeight={59 * scaleFactor}
            />
          </hstack>
        </vstack>
        
        {/* 标题横幅 */}
        <vstack alignment="center middle">
          <image
            url="banner-succ.png"
            description="Success Banner"
            width={309 * scaleFactor}
            height={153 * scaleFactor}
            imageWidth={309 * scaleFactor}
            imageHeight={153 * scaleFactor}
          />
        </vstack>
        
        {/* 下载按钮 */}
        <image
          url="icon-download.png"
          description="Download"
          width={56 * scaleFactor}
          height={56 * scaleFactor}
          imageWidth={56 * scaleFactor}
          imageHeight={56 * scaleFactor}
        />
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
      
      // 使用响应式预览组件
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

export default Devvit;