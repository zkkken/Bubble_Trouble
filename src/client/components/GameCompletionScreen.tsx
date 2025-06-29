/**
 * 游戏结算界面组件 - 全新UI设计
 * 基于新的卡片式设计，展示游戏结果和统计数据
 * 
 * @author 开发者B - UI/UX 界面负责人
 */

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { LeaderboardRankingScreen } from './LeaderboardRankingScreen';
import { useResponsiveScale, useResponsiveSize } from '../hooks/useResponsiveScale';

interface GameCompletionScreenProps {
  onPlayAgain: () => void;
  onBackToStart: () => void;
  gameStats: {
    roundsCompleted: number;
    totalTime: number;
    finalComfort: number;
  };
  playerInfo: {
    playerName: string;
    continentId: string;
    catAvatarId: string;
  };
}

export const GameCompletionScreen: React.FC<GameCompletionScreenProps> = ({
  onPlayAgain,
  onBackToStart,
  gameStats,
  playerInfo,
}) => {
  const [showRanking, setShowRanking] = useState(false);
  
  // 响应式设计hooks
  const { cssVars } = useResponsiveScale();
  const { scale } = useResponsiveSize();
  // 格式化时间显示
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 获取洲际名称
  const getContinentName = (continentId: string): string => {
    const continentNames: { [key: string]: string } = {
      'AS': 'Asia',
      'EU': 'Europe', 
      'NA': 'North America',
      'SA': 'South America',
      'AF': 'Africa',
      'OC': 'Oceania'
    };
    return continentNames[continentId] || continentId;
  };

  // 计算表现百分比（基于时间和轮数）
  const getPerformancePercentage = (): number => {
    // 简单的性能计算：基于完成轮数和时间
    const baseScore = gameStats.roundsCompleted * 20;
    const timeBonus = Math.max(0, 60 - gameStats.totalTime) * 2;
    return Math.min(99, Math.max(1, baseScore + timeBonus));
  };

  // 动态生成猫咪数据
  const generateCats = () => {
    // 模拟排行榜人数（在实际应用中，这应该来自真实的排行榜数据）
    const leaderboardCount = Math.floor(Math.random() * 100) + 10; // 10-110人
    const catCount = Math.max(8, Math.min(20, Math.floor(leaderboardCount / 5))); // 最少8个，最多20个
    
    const catImages = ["/Cat_1.png", "/Cat_2.png", "/Cat_3.png", "/Cat_5.png", "/Cat_6.png", "/Cat_7.png", "/Cat_4.png"];
    
    // 主猫咪和玩家姓名标签组合位置（居中）
    const centerX = 394 / 2; // 卡片宽度的一半
    const mainCatAndNameTagArea = {
      left: centerX - 105/2, // 以姓名标签宽度为准居中
      top: 48,
      width: 120, // 以主猫咪宽度为准
      height: 66 + 120, // 姓名标签高度 + 主猫咪高度
    };
    
    // 为了兼容现有逻辑，保留mainCat对象但标记为已处理
    const mainCat = {
      src: "/Cat_1.png",
      size: 120,
      top: 114,
      left: centerX - 60, // 居中
      isMain: true,
    };
    
    // 生成其他猫咪
    const otherCats: Array<{
      src: string;
      size: number;
      top: number;
      left: number;
      isMain: boolean;
      flipped: boolean;
    }> = [];
    const usedPositions: Array<{
      left: number;
      top: number;
      right: number;
      bottom: number;
    }> = [];
    
    // 主猫咪现在在组合区域中，不需要单独添加
    
    // 添加主猫咪和姓名标签组合区域到已使用位置
    usedPositions.push({
      left: mainCatAndNameTagArea.left - 5,
      top: mainCatAndNameTagArea.top - 5,
      right: mainCatAndNameTagArea.left + mainCatAndNameTagArea.width + 5,
      bottom: mainCatAndNameTagArea.top + mainCatAndNameTagArea.height + 5,
    });
    
    // 检查位置是否冲突
    const isPositionValid = (left: number, top: number, size: number) => {
      for (const usedPos of usedPositions) {
        if (
          left < usedPos.right &&
          left + size > usedPos.left &&
          top < usedPos.bottom &&
          top + size > usedPos.top
        ) {
          return false;
        }
      }
      return left >= 16 && left + size <= 378 && top >= 114 && top + size <= 280; // 卡片边界限制
    };
    
    // 生成其他猫咪
    let attempts = 0;
    while (otherCats.length < catCount - 1 && attempts < 100) {
      // 70%概率生成50-100px的猫咪，30%概率生成45-49px的猫咪
      const size = Math.random() > 0.3 
        ? Math.floor(Math.random() * 51) + 50  // 50-100px
        : Math.floor(Math.random() * 5) + 45; // 45-49px
      const left = Math.floor(Math.random() * (394 - size - 32)) + 16; // 卡片内随机位置
      const top = Math.floor(Math.random() * (280 - size - 114)) + 114; // 避开上方区域
      
      if (isPositionValid(left, top, size)) {
        otherCats.push({
          src: catImages[Math.floor(Math.random() * catImages.length)] || "/Cat_1.png",
          size,
          top,
          left,
          isMain: false,
          flipped: Math.random() > 0.5, // 随机决定是否翻转
        });
        
        // 添加到已使用位置
        usedPositions.push({
          left: left - 2,
          top: top - 2,
          right: left + size + 2,
          bottom: top + size + 2,
        });
      }
      attempts++;
    }
    
    return otherCats; // 只返回其他猫咪，主猫咪单独渲染
  };

  const cats = generateCats();

  // 如果显示排名界面，返回排名组件
  if (showRanking) {
    return <LeaderboardRankingScreen onBack={() => setShowRanking(false)} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="bg-[#2f2f2f] overflow-hidden relative"
        style={{
          width: `${scale(724)}px`,
          height: `${scale(584)}px`,
          ...cssVars
        }}
      >
        {/* 简化的游戏主界面背景 */}
        <div className="absolute inset-0">
          {/* 背景图像 */}
          <div className="absolute inset-0 bg-[url(/background.png)] bg-cover bg-center" />

          {/* 舒适度进度条 */}
          <div 
            className="absolute"
            style={{
              left: `${scale(48)}px`,
              top: `${scale(108)}px`,
              width: `${scale(628)}px`,
              height: `${scale(24)}px`
            }}
          >
            <div 
              className="w-full h-full bg-[#d9d9d9] border-[#3a3656] opacity-60"
              style={{ borderWidth: `${scale(4)}px` }}
            >
              <div className="h-full bg-[#5ff367] w-[75%]" />
            </div>
          </div>

          {/* 温度进度条系统 */}
          <div 
            className="absolute opacity-60"
            style={{
              left: `${scale(48)}px`,
              top: `${scale(136)}px`,
              width: `${scale(628)}px`,
              height: `${scale(78)}px`
            }}
          >
            <div 
              className="absolute bg-[#d9d9d9] border-[#3a3656]"
              style={{
                top: `${scale(9)}px`,
                width: `${scale(628)}px`,
                height: `${scale(24)}px`,
                borderWidth: `${scale(4)}px`
              }}
            >
              <div className="absolute top-0 h-full bg-[#ff9500] opacity-60 left-[40%] w-[20%]" />
              <div className="h-full bg-[#728cff] w-[50%]" />
            </div>
            <div 
              className="absolute bg-[#f8cb56] border-[#3a3656]"
              style={{
                width: `${scale(16)}px`,
                height: `${scale(40)}px`,
                borderWidth: `${scale(5)}px`,
                left: `${scale(306)}px`,
                top: '0'
              }}
            />
          </div>

          {/* 控制按钮 */}
          <div 
            className="absolute opacity-60"
            style={{
              left: `${scale(84)}px`,
              top: `${scale(460)}px`,
              width: `${scale(56)}px`,
              height: `${scale(56)}px`
            }}
          >
            <img className="w-full h-full object-cover" src="/button-temp-minus.png" />
          </div>
          <div 
            className="absolute opacity-60"
            style={{
              left: `${scale(584)}px`,
              top: `${scale(460)}px`,
              width: `${scale(56)}px`,
              height: `${scale(56)}px`
            }}
          >
            <img className="w-full h-full object-cover" src="/button-temp-plus.png" />
          </div>
        </div>

        <div 
          className="relative"
          style={{
            height: `${scale(639)}px`,
            top: `${scale(-53)}px`
          }}
        >

          {/* 半透明遮罩 */}
          <div 
            className="absolute bg-[#545454] opacity-50"
            style={{
              width: `${scale(724)}px`,
              height: `${scale(584)}px`,
              top: `${scale(53)}px`,
              left: '0'
            }}
          />

          {/* 主游戏卡片 */}
          <Card 
            className="absolute border-0 overflow-visible"
            style={{
              width: `${scale(394)}px`,
              height: `${scale(521)}px`,
              top: `${scale(90)}px`,
              left: `${scale(165)}px`
            }}
          >
            <CardContent className="p-0">
              <img
                className="w-full h-full object-cover"
                alt="Card background"
                src="/card-bg-1.png"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.background = '#f0f0f0';
                }}
              />

              {/* 主猫咪和玩家姓名标签组合 */}
              <div 
                className="absolute flex flex-col items-center left-1/2 transform -translate-x-1/2 animate-float"
                style={{ top: `${scale(48)}px` }}
              >
                {/* 玩家姓名标签 */}
                <div 
                  className="mb-0"
                  style={{
                    width: `${scale(105)}px`,
                    height: `${scale(66)}px`
                  }}
                >
                  <div 
                    className="relative bg-[url(/nametag.png)] bg-contain bg-center bg-no-repeat"
                    style={{
                      width: `${scale(103)}px`,
                      height: `${scale(66)}px`
                    }}
                  >
                    <div 
                      className="absolute left-0 right-0 font-bold text-black tracking-[0] leading-[normal] whitespace-nowrap text-center" 
                      style={{ 
                        fontFamily: 'Pixelify Sans', 
                        fontSize: `${scale(Math.max(12, 30 - playerInfo.playerName.length * 2))}px`,
                        top: `${scale(26 - (Math.max(12, 30 - playerInfo.playerName.length * 2) - 20) * 0.2)}px` // 根据字体大小调整居中位置
                      }}
                    >
                      {playerInfo.playerName.slice(0, 8)}
                    </div>
                  </div>
                </div>
                
                {/* 主猫咪 */}
                <img
                  className="object-cover"
                  style={{
                    width: `${scale(120)}px`,
                    height: `${scale(120)}px`,
                  }}
                  alt="Main Cat"
                  src="/Cat_1.png"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/Cat_1.png";
                  }}
                />
              </div>

              {/* 其他猫咪动画 */}
              {cats.map((cat, index) => (
                <img
                  key={`cat-${index}`}
                  className={`absolute object-cover ${cat.flipped ? 'scale-x-[-1]' : ''}`}
                  style={{
                    width: `${scale(cat.size)}px`,
                    height: `${scale(cat.size)}px`,
                    top: `${scale(cat.top)}px`,
                    left: `${scale(cat.left)}px`,
                  }}
                  alt="Cat"
                  src={cat.src}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/Cat_1.png";
                  }}
                />
              ))}

              {/* 排名状态卡片 */}
              <div 
                className="absolute bg-[#e6f9ff]"
                style={{
                  width: `${scale(350)}px`,
                  height: `${scale(63)}px`,
                  top: `${scale(316)}px`,
                  left: `${scale(16)}px`,
                  borderRadius: `${scale(15)}px`
                }}
              >
                <div 
                  className="leading-[normal] absolute font-normal text-transparent tracking-[0]" 
                  style={{ 
                    fontFamily: 'Pixelify Sans',
                    fontWeight: 400,
                    fontStyle: 'normal',
                    lineHeight: 'normal',
                    height: `${scale(34)}px`,
                    top: `${scale(11)}px`,
                    width: `${scale(291)}px`,
                    left: `${scale(59)}px`,
                    fontSize: `${scale(24)}px`
                  }}
                >
                  <span className="text-black">{getContinentName(playerInfo.continentId)} is </span>
                  <span 
                    className="text-[#fab817] font-bold"
                    style={{ fontSize: `${scale(28)}px` }}
                  >
                    #1
                  </span>
                </div>

                <img
                  className="absolute object-cover"
                  style={{
                    width: `${scale(36)}px`,
                    height: `${scale(36)}px`,
                    top: `${scale(12)}px`,
                    left: `${scale(14)}px`
                  }}
                  alt="Ranking badge"
                  src="/rankingbadge--1.png"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>

              {/* 成绩状态卡片 */}
              <div 
                className="absolute bg-[#e6f9ff]"
                style={{
                  width: `${scale(350)}px`,
                  height: `${scale(72)}px`,
                  top: `${scale(391)}px`,
                  left: `${scale(16)}px`,
                  borderRadius: `${scale(15)}px`
                }}
              >
                <div 
                  className="absolute font-normal text-transparent tracking-[0]" 
                  style={{ 
                    fontFamily: 'Pixelify Sans',
                    fontWeight: 400,
                    fontStyle: 'normal',
                    lineHeight: 'normal',
                    top: `${scale(9)}px`,
                    width: `${scale(291)}px`,
                    left: `${scale(59)}px`,
                    fontSize: `${scale(24)}px`
                  }}
                >
                  <span className="text-black">
                    Scrubbed for {formatTime(gameStats.totalTime)}, out-soaked{" "}
                  </span>
                  <span 
                    className="text-[#ffc106] font-bold"
                    style={{ fontSize: `${scale(28)}px` }}
                  >
                    {getPerformancePercentage()}%
                  </span>
                  <span className="text-black"> of players!</span>
                </div>

                <img
                  className="absolute object-cover"
                  style={{
                    width: `${scale(36)}px`,
                    height: `${scale(36)}px`,
                    top: `${scale(15)}px`,
                    left: `${scale(14)}px`
                  }}
                  alt="Victory hand"
                  src="/icon-victoryhand.png"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>

              {/* 操作按钮 */}
              <div 
                className="absolute flex justify-center w-full"
                style={{ 
                  gap: `${scale(16)}px`,
                  bottom: `${scale(-10)}px`
                }}
              >
                <Button
                  variant="ghost"
                  className="p-0 rounded-md"
                  style={{
                    width: `${scale(56)}px`,
                    height: `${scale(56)}px`
                  }}
                  onClick={onPlayAgain}
                >
                  <img
                    className="w-full h-full object-cover"
                    alt="Restart"
                    src="/icon-restart.png"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.alt = "🔄";
                    }}
                  />
                </Button>

                <Button
                  variant="ghost"
                  className="p-0 rounded-md"
                  style={{
                    width: `${scale(56)}px`,
                    height: `${scale(56)}px`
                  }}
                  onClick={() => {
                    // 分享功能
                    if (navigator.share) {
                      navigator.share({
                        title: 'Cat Comfort Game',
                        text: `I scored ${getPerformancePercentage()}% in Cat Comfort Game!`,
                        url: window.location.href
                      });
                    }
                  }}
                >
                  <img
                    className="w-full h-full object-cover"
                    alt="Share"
                    src="/icon-share.png"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.alt = "📤";
                    }}
                  />
                </Button>

                <Button
                  variant="ghost"
                  className="p-0 rounded-md"
                  style={{
                    width: `${scale(59)}px`,
                    height: `${scale(59)}px`
                  }}
                  onClick={() => setShowRanking(true)}
                >
                  <img
                    className="w-full h-full object-cover"
                    alt="Ranking"
                    src="/icon-ranking.png"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.alt = "🏆";
                    }}
                  />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 标题横幅 */}
          <div 
            className="absolute top-0"
            style={{
              width: `${scale(363)}px`,
              height: `${scale(206)}px`,
              left: `${scale(180.5)}px`
            }}
          >
            <div 
              className="relative"
              style={{
                width: `${scale(361)}px`,
                height: `${scale(153)}px`,
                top: `${scale(53)}px`,
                left: `${scale(-4)}px`
              }}
            >
              <img
                className="object-cover absolute top-0"
                style={{
                  width: `${scale(309)}px`,
                  height: `${scale(153)}px`,
                  left: `${scale(26)}px`
                }}
                alt="Banner"
                src="/banner-succ.png"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />

              {/* 洲际文字 */}
              <div 
                className="absolute flex items-center justify-center silkscreen-text"
                style={{
                  width: `${scale(120)}px`,
                  height: `${scale(25)}px`,
                  top: `${scale(29)}px`,
                  left: `${scale(119)}px`,
                  color: '#F0BC08',
                  fontSize: `${scale(24)}px`,
                }}
              >
                {getContinentName(playerInfo.continentId)}
              </div>
            </div>
          </div>

          {/* 下载按钮 */}
          <Button
            variant="ghost"
            className="absolute p-0 rounded-md"
            style={{
              width: `${scale(56)}px`,
              height: `${scale(56)}px`,
              top: `${scale(108)}px`,
              left: `${scale(570)}px`
            }}
            onClick={() => {
              // 下载功能（可以保存截图或成绩）
              window.print();
            }}
          >
            <img
              className="w-full h-full object-cover"
              alt="Download"
              src="/icon-download.png"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.alt = "💾";
              }}
            />
          </Button>
        </div>
      </div>
    </div>
  );
};