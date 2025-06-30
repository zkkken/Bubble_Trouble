/**
 * 游戏结算界面组件 - 全新UI设计
 * 基于新的卡片式设计，展示游戏结果和统计数据
 * 游戏结算界面组件 - 全新UI设计
 * 基于新的卡片式设计，展示游戏结果和统计数据
 * 
 * @author 开发者B - UI/UX 界面负责人
 */

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { LeaderboardRankingScreen } from './LeaderboardRankingScreen';
import { ImagePreviewModal } from './ImagePreviewModal';
import { SuccessToast } from './SuccessToast';
import { useResponsiveScale, useResponsiveSize } from '../hooks/useResponsiveScale';
import { 
  captureGameCompletionScreenshot, 
  downloadImage, 
  shareResultToClipboard
} from '../utils/shareUtils';

interface GameCompletionScreenProps {
  onPlayAgain: () => void;
  onBackToStart: () => void;
  gameStats: {
    enduranceDuration: number;
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
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // 响应式设计hooks
  const { cssVars } = useResponsiveScale();
  const { scale } = useResponsiveSize();
  
  // 洲ID到图片映射
  const getContinentImage = (continentId: string): string => {
    const continentImages: { [key: string]: string } = {
      'NA': '/namerica.png',
      'SA': '/samerica.png', 
      'EU': '/europe.png',
      'AS': '/asia.png',
      'AF': '/africa.png',
      'OC': '/oceania.png'
    };
    return continentImages[continentId] || '/asia.png';
  };

  // 洲ID到全名映射
  const getContinentName = (continentId: string): string => {
    const continentNames: { [key: string]: string } = {
      'NA': 'NORTH AMERICA',
      'SA': 'SOUTH AMERICA', 
      'EU': 'EUROPE',
      'AS': 'ASIA',
      'AF': 'AFRICA',
      'OC': 'OCEANIA'
    };
    return continentNames[continentId] || continentId;
  };

  // 根据洲ID获取对应背景图片
  // 随机获取背景图片 - 5个场景随机选择
  const getRandomBackground = (): string => {
    const backgrounds = [
      '/background-1.png', 
      '/background-2.png', 
      '/background-3.png', 
      '/background-4.png', 
      '/background-5.png'
    ];
    return backgrounds[Math.floor(Math.random() * backgrounds.length)] || '/background-1.png';
  };

  // 使用useState确保组件生命周期内背景保持一致
  const [selectedBackground] = useState(() => getRandomBackground());

  // 获取洲排名（实际从API获取）
  const [continentRank, setContinentRank] = React.useState<number>(1);
  const [playerRank, setPlayerRank] = React.useState<number>(1);
  const [playerRankPercentage, setPlayerRankPercentage] = React.useState<number>(50);

  // 获取实际排名数据
  React.useEffect(() => {
    const fetchRankingData = async () => {
      try {
        // 获取洲际排名
        const continentResponse = await fetch('/api/leaderboard/stats');
        const continentData = await continentResponse.json();
        
        console.log('🏆 GameCompletionScreen获取洲际数据:', continentData);
        
        if (continentData.status === 'success' && continentData.data) {
          // 按平均时间降序排序（时间长的排名靠前）
          const sortedContinents = [...continentData.data].sort((a: any, b: any) => {
            // 有玩家的洲际优先，然后按平均时间降序
            if (a.playerCount === 0 && b.playerCount === 0) return 0;
            if (a.playerCount === 0) return 1;
            if (b.playerCount === 0) return -1;
            return b.averageTime - a.averageTime;
          });
          
          console.log('🏆 排序后的洲际数据:', sortedContinents.map((c: any, index: number) => ({
            排名: index + 1,
            洲ID: c.continentId,
            洲名: c.continentName,
            玩家数: c.playerCount,
            平均时间: c.averageTime?.toFixed(1) || '0.0'
          })));
          
          const rank = sortedContinents.findIndex((c: any) => c.continentId === playerInfo.continentId) + 1;
          console.log(`🏆 玩家洲${playerInfo.continentId}的排名: ${rank}`);
          setContinentRank(rank);
        }

        // 获取玩家个人排名（提交本局成绩后的排名）
        const playerData = {
          playerName: playerInfo.playerName,
          continentId: playerInfo.continentId,
          catAvatarId: playerInfo.catAvatarId,
          enduranceDuration: gameStats.enduranceDuration
        };

        const submitResponse = await fetch('/api/leaderboard/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(playerData)
        });

        if (submitResponse.ok) {
          const submitResult = await submitResponse.json();
          if (submitResult.playerRank) {
            setPlayerRank(submitResult.playerRank);
            
            // 计算超过的玩家百分比
            const leaderboardResponse = await fetch(`/api/leaderboard/${playerInfo.continentId}?limit=1000`);
            const leaderboardData = await leaderboardResponse.json();
            
            if (leaderboardData.stats && leaderboardData.stats.playerCount > 0) {
              const totalPlayers = leaderboardData.stats.playerCount;
              const playersBeaten = totalPlayers - submitResult.playerRank;
              const percentage = Math.round((playersBeaten / totalPlayers) * 100);
              setPlayerRankPercentage(Math.max(0, percentage));
            }
          }
        }
      } catch (error) {
        console.error('获取排名数据失败:', error);
        // 使用默认值
      }
    };

    fetchRankingData();
  }, [playerInfo, gameStats.enduranceDuration]);
  
  // 格式化时间显示
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 根据玩家数生成猫咪动画（最少6个最多20个）- 优化防堆叠逻辑
  const generateRandomCats = (playerCount: number = 10) => {
    const catCount = Math.max(6, Math.min(20, playerCount));
    const cats: Array<{src: string; size: number; top: number; left: number; flipped: boolean}> = [];
    const catImages = ['/Cat_1.png', '/Cat_2.png', '/Cat_3.png', '/Cat_4.png', '/Cat_5.png', '/Cat_6.png', '/Cat_7.png'];
    
    // 猫咪框架尺寸（自适应缩放）
    const frameWidth = scale(336);
    const frameHeight = scale(228);
    
    // 主猫咪位置（在框架顶部中央，避免被遮挡）
    const mainCatCenterX = frameWidth / 2; 
    const mainCatCenterY = scale(60); // 顶部位置
    const mainCatRadius = scale(80); // 主猫咪保护区域半径
    
    // 检查两个圆形区域是否重叠
    const isOverlapping = (x1: number, y1: number, size1: number, x2: number, y2: number, size2: number): boolean => {
      const distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
      const minDistance = (size1 + size2) / 2 + scale(15); // 额外15px间距防止紧贴
      return distance < minDistance;
    };
    
    for (let i = 0; i < catCount; i++) {
      let attempts = 0;
      let validPosition = false;
      let catData;
      
      while (!validPosition && attempts < 100) { // 增加尝试次数
        // 在框架内随机分布，但避开主猫咪区域
        const size = Math.random() * scale(35) + scale(25); // 25-60px随机大小，略小避免拥挤
        const x = Math.random() * (frameWidth - size);
        const y = Math.random() * (frameHeight - size);
        
        const catCenterX = x + size / 2;
        const catCenterY = y + size / 2;
        
        // 检查是否与主猫咪区域重叠
        const distanceToMain = Math.sqrt(
          Math.pow(catCenterX - mainCatCenterX, 2) + 
          Math.pow(catCenterY - mainCatCenterY, 2)
        );
        
        if (distanceToMain > mainCatRadius) {
          // 检查是否与已有猫咪重叠
          let overlapsWithExisting = false;
          for (const existingCat of cats) {
            const existingCenterX = existingCat.left + existingCat.size / 2;
            const existingCenterY = existingCat.top + existingCat.size / 2;
            
            if (isOverlapping(catCenterX, catCenterY, size, existingCenterX, existingCenterY, existingCat.size)) {
              overlapsWithExisting = true;
              break;
            }
          }
          
          if (!overlapsWithExisting) {
            validPosition = true;
            catData = {
              src: catImages[Math.floor(Math.random() * catImages.length)] || '/Cat_1.png',
              size,
              top: y,
              left: x,
              flipped: Math.random() > 0.5 // 随机左右翻转
            };
          }
        }
        attempts++;
      }
      
      if (catData) {
        cats.push(catData);
      }
    }
    
    console.log(`✅ 成功生成 ${cats.length}/${catCount} 只不重叠的猫咪`);
    return cats;
  };

  const cats = generateRandomCats(15); // 默认使用15只猫咪，可以根据实际玩家数据调整

  // 处理分享功能
  const handleShare = async () => {
    try {
      const gameData = {
        playerName: playerInfo.playerName,
        time: formatTime(gameStats.enduranceDuration),
      };
      
      const success = await shareResultToClipboard(gameData);
      if (success) {
        setSuccessMessage('分享文本已复制到剪贴板！');
        setShowSuccessToast(true);
      } else {
        setSuccessMessage('复制失败，请手动复制分享内容');
        setShowSuccessToast(true);
      }
    } catch (error) {
      console.error('分享失败:', error);
      setSuccessMessage('分享失败，请稍后再试');
      setShowSuccessToast(true);
    }
  };

  // 处理下载功能
  const handleDownload = async () => {
    try {
      const imageData = await captureGameCompletionScreenshot();
      const filename = `cat-shower-${playerInfo.playerName}-${Date.now()}.png`;
      downloadImage(imageData, filename);
      
      // 显示图片预览
      setPreviewImageUrl(imageData);
      setShowImagePreview(true);
    } catch (error) {
      console.error('下载失败:', error);
      setSuccessMessage('截图生成失败，请稍后再试');
      setShowSuccessToast(true);
    }
  };

  // 如果显示排名界面，返回排名组件
  if (showRanking) {
    return <LeaderboardRankingScreen onBack={() => setShowRanking(false)} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="bg-[#2f2f2f] overflow-hidden relative game-completion-screen"
        data-testid="game-completion-screen"
        style={{
          width: `${scale(724)}px`,
          height: `${scale(584)}px`,
          ...cssVars
        }}
      >
        {/* 简化的游戏主界面背景 - 根据玩家选择的洲 */}
        <div className="absolute inset-0">
          {/* 背景图像 - 随机选择场景 */}
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{
              backgroundImage: `url(${selectedBackground})`
            }}
          />

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

              {/* 猫咪框架容器 - 所有猫咪都在这个框内 */}
              <div 
                className="absolute overflow-hidden"
                style={{
                  width: `${scale(336)}px`,
                  height: `${scale(228)}px`,
                  top: `${scale(72)}px`,
                  left: `${scale(30)}px`,
                }}
              >
                {/* 主猫咪和玩家姓名标签组合 - z-index确保不被遮挡 */}
                <div 
                  className="absolute flex flex-col items-center animate-float z-10"
                  style={{ 
                    top: `${scale(20)}px`,
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
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
                          top: `${scale(37)}px` // 根据fontSize:15->top:37的比例计算
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
                    src={`/Cat_${playerInfo.catAvatarId}.png`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/Cat_1.png";
                    }}
                  />
                </div>

                {/* 其他猫咪动画 - 在主猫咪下方 */}
                {cats.map((cat, index) => (
                  <img
                    key={`cat-${index}`}
                    className={`absolute object-cover ${cat.flipped ? 'scale-x-[-1]' : ''}`}
                    style={{
                      width: `${cat.size}px`,
                      height: `${cat.size}px`,
                      top: `${cat.top}px`,
                      left: `${cat.left}px`,
                      zIndex: 5 // 确保在主猫咪下方
                    }}
                    alt="Cat"
                    src={cat.src}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/Cat_1.png";
                    }}
                  />
                ))}
              </div>

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
                    #{continentRank}
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
                    fontSize: `${scale(18)}px`
                  }}
                >
                  <span className="text-black">
                    Scrubbed for {formatTime(gameStats.enduranceDuration)}, out-soaked {playerRankPercentage}% of players!
                  </span>
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
                  onClick={onBackToStart}
                  title="重新开始游戏 - 返回主界面"
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
                {/* 分享按钮 */}
                <Button
                  variant="ghost"
                  className="p-0 rounded-md"
                  style={{
                    width: `${scale(56)}px`,
                    height: `${scale(56)}px`
                  }}
                  onClick={handleShare}
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

              {/* 洲际图片 */}
              <div 
                className="absolute flex items-center justify-center"
                style={{
                  width: `${scale(200)}px`,
                  height: `${scale(25)}px`,
                  top: `${scale(29)}px`,
                  left: `${scale(79)}px`,
                }}
              >
                              <img
                className="absolute object-contain"
                style={{
                  width: `${scale(150)}px`,
                  height: 'auto',
                  top: `${scale(0)}px`,
                  left: `${scale(21)}px`
                }}
                alt={`Continent ${playerInfo.continentId}`}
                src={getContinentImage(playerInfo.continentId)}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/asia.png';
                }}
              />
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
            onClick={handleDownload}
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

      {/* 图片预览模态框 */}
      <ImagePreviewModal
        isOpen={showImagePreview}
        imageUrl={previewImageUrl}
        onClose={() => setShowImagePreview(false)}
      />

      {/* 成功提示 */}
      <SuccessToast
        isOpen={showSuccessToast}
        message={successMessage}
        onClose={() => setShowSuccessToast(false)}
      />
    </div>
  );
};