/**
 * 洲际排行榜界面组件
 * 显示各大洲的排名，基于玩家人数进行排序
 * 支持动态生成猫咪、可拖拽滚动条、与GameCompletionScreen相同的背景样式
 */

import React, { useState, useEffect, useRef } from "react";
import { ContinentRankingScreen } from "./ContinentRankingScreen";
import { useResponsiveScale, useResponsiveSize } from '../hooks/useResponsiveScale';

interface LeaderboardRankingScreenProps {
  onBack: () => void;
}

interface ContinentStats {
  continentId: string;
  continentName: string;
  playerCount: number;
  totalDuration: number;
  averageTime: number;
  flag: string;
}

interface CatData {
  id: string;
  src: string;
  x: number;
  y: number;
  size: number;
  flipped: boolean;
}

interface ContinentRanking {
  name: string;
  continentId: string;
  rank: number;
  playerCount: number;
  rankImage: string;
  cats: CatData[];
}

// 获取玩家信息的函数
const getPlayerInfo = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('catComfortGame_playerInfo');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('📱 获取玩家信息:', parsed);
        return {
          playerName: parsed.playerName || 'Player',
          continentId: parsed.continentId || 'AS',
          catAvatarId: parsed.catAvatarId || '1',
          selectedCat: parsed.selectedCat || '/Cat_1.png'
        };
      } catch (error) {
        console.error('解析玩家信息失败:', error);
      }
    }
  }
  // 默认玩家信息
  console.log('📱 使用默认玩家信息');
  return {
    playerName: 'Player',
    continentId: 'AS',
    catAvatarId: '1',
    selectedCat: '/Cat_1.png'
  };
};

export const LeaderboardRankingScreen: React.FC<LeaderboardRankingScreenProps> = ({ onBack }) => {
  const [continentStats, setContinentStats] = useState<ContinentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [rankings, setRankings] = useState<ContinentRanking[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedContinent, setSelectedContinent] = useState<{
    continentId: string;
    continentName: string;
    continentImage: string;
  } | null>(null);
  const playerInfo = getPlayerInfo();

  // 响应式设计hooks
  const { cssVars } = useResponsiveScale();
  const { scale } = useResponsiveSize();

  // 处理点击州卡片进入洲内排行榜
  const handleContinentClick = (continentId: string) => {
    const continentName = continentNames[continentId] || 'UNKNOWN';
    const continentImage = continentImages[continentId] || '/asia.png';
    
    setSelectedContinent({
      continentId,
      continentName,
      continentImage
    });
  };

  // 处理从洲内排行榜返回
  const handleBackFromContinent = () => {
    setSelectedContinent(null);
  };

  // 可用的猫咪图片 - 修复图片路径
  const catImages = ["/Cat_1.png", "/Cat_2.png", "/Cat_3.png", "/Cat_4.png", "/Cat_5.png", "/Cat_6.png", "/Cat_7.png"];

  // 洲际名称映射
  const continentNames: { [key: string]: string } = {
    'OC': 'OCEANIA',
    'AS': 'ASIA',
    'EU': 'EUROPE',
    'NA': 'NORTH AMERICA',
    'SA': 'SOUTH AMERICA',
    'AF': 'AFRICA'
  };

  // 洲际图片映射
  const continentImages: { [key: string]: string } = {
    'OC': '/oceania.png',
    'AS': '/asia.png',
    'EU': '/europe.png',
    'NA': '/namerica.png',
    'SA': '/samerica.png',
    'AF': '/africa.png'
  };



  // 根据玩家人数为洲际生成随机猫咪 - 每个人对应一只猫，最多20只
  const generateCatsForContinent = (playerCount: number, continentId: string): CatData[] => {
    const cats: CatData[] = [];
    const usedPositions: Array<{ x: number; y: number; size: number }> = [];
    const playerContinentId = playerInfo.continentId; // 从玩家信息中获取洲ID

    console.log(`🐱 [${continentId}] 开始生成猫咪 - 玩家数: ${playerCount}, 是否玩家洲: ${continentId === playerContinentId}`);

    // 如果是玩家所在的洲，人数要减1（因为玩家本身不算在自动生成的猫咪中）
    let actualPlayerCount = playerCount;
    if (continentId === playerContinentId) {
      actualPlayerCount = Math.max(0, playerCount - 1);
      console.log(`🏠 [${continentId}] 玩家所在洲，显示人数减1: ${playerCount} -> ${actualPlayerCount}`);
    }

    // 严格按照玩家数量生成猫咪，没有玩家就不生成
    if (actualPlayerCount === 0) {
      console.log(`🚫 [${continentId}] 实际玩家数为0，不生成任何猫咪`);
      return cats;
    }

    // 每个玩家对应一只猫，最多20只
    let numCats = Math.min(actualPlayerCount, 20);
    
    console.log(`🐱 [${continentId}] 计算猫咪数量: ${actualPlayerCount}位实际玩家 -> ${numCats}只猫咪`);

    const isPositionValid = (x: number, y: number, size: number): boolean => {
      // 检查边界（在卡片区域内，考虑猫咪框架）
      if (x < 0 || x + size > scale(313) || y < 0 || y + size > scale(143)) return false;
      
      // 检查与现有猫咪的碰撞
      for (const pos of usedPositions) {
        const distance = Math.sqrt(
          Math.pow(x + size/2 - (pos.x + pos.size/2), 2) + 
          Math.pow(y + size/2 - (pos.y + pos.size/2), 2)
        );
        if (distance < (size + pos.size) / 2 + scale(10)) return false; // 响应式间距
      }
      return true;
    };

    // 如果是玩家所在的洲，需要为主猫咪预留位置
    if (continentId === playerContinentId) {
      // 在中心预留主猫咪的位置
      const mainCatX = scale(313) / 2 - scale(60); // 中心位置
      const mainCatY = scale(143) / 2 - scale(60);
      usedPositions.push({ x: mainCatX, y: mainCatY, size: scale(120) }); // 主猫咪区域
      console.log(`🐱 [${continentId}] 为玩家主猫咪预留位置 (${mainCatX}, ${mainCatY})`);
    }

    // 生成猫咪
    let attempts = 0;
    while (cats.length < numCats && attempts < 100) {
      const size = Math.floor(Math.random() * scale(40)) + scale(25); // 25-65px随机大小
      const x = Math.floor(Math.random() * (scale(313) - size));
      const y = Math.floor(Math.random() * (scale(143) - size));

      if (isPositionValid(x, y, size)) {
        cats.push({
          id: `cat-${cats.length}`,
          src: catImages[Math.floor(Math.random() * catImages.length)] || "/Cat_1.png",
          x,
          y,
          size,
          flipped: Math.random() > 0.5 // 随机左右翻转
        });
        usedPositions.push({ x, y, size });
        console.log(`🐱 [${continentId}] 生成猫咪 ${cats.length}/${numCats} - 位置(${x}, ${y}), 大小${size}`);
      }
      attempts++;
    }

    console.log(`🐱 [${continentId}] 猫咪生成完成: ${cats.length}/${numCats} (尝试${attempts}次)`);
    return cats;
  };

  // 获取洲际统计数据并生成排名
  useEffect(() => {
    const fetchContinentStats = async () => {
      try {
        const response = await fetch('/api/leaderboard/stats');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        if (data.status === 'success') {
          setContinentStats(data.data);
          
          console.log('📊 API返回的原始洲际数据:', data.data.map((stat: ContinentStats) => ({
            洲ID: stat.continentId,
            洲名: stat.continentName,
            玩家数: stat.playerCount,
            总时长: stat.totalDuration?.toFixed(1) || '0.0',
            平均时间: stat.averageTime?.toFixed(1) || '0.0'
          })));
          
          // 按平均耐久时间排序洲际（降序 - 时间长的排名靠前）
          // 没有玩家的洲际平均时间为0，会排在最后
          const sortedStats = [...data.data].sort((a, b) => {
            // 有玩家的洲际优先，然后按平均时间降序
            if (a.playerCount === 0 && b.playerCount === 0) return 0;
            if (a.playerCount === 0) return 1;
            if (b.playerCount === 0) return -1;
            return b.averageTime - a.averageTime;
          });
          
          console.log('📊 排序后的洲际数据:', sortedStats.map((stat, index) => ({
            排名: index + 1,
            洲ID: stat.continentId,
            洲名: stat.continentName,
            玩家数: stat.playerCount,
            平均时间: stat.averageTime?.toFixed(1) || '0.0'
          })));
          
          const generatedRankings: ContinentRanking[] = sortedStats.map((stat, index) => {
            const cats = generateCatsForContinent(stat.playerCount, stat.continentId);
            
            const ranking = {
              name: continentNames[stat.continentId] || stat.continentName?.toUpperCase() || 'UNKNOWN',
              continentId: stat.continentId,
              rank: index + 1,
              playerCount: stat.playerCount,
              rankImage: index < 3 ? `/rankingbadge--${index + 1}.png` : "/rankingbadge-normal-2.png",
              cats
            };
            
            // 检查猫咪生成数量
            console.log(`🐱 [${stat.continentId}] ${ranking.name}: 玩家数${stat.playerCount}, 平均时间${stat.averageTime?.toFixed(1) || '0.0'}s, 生成猫咪${cats.length}只`);
            
            return ranking;
          });

          // 输出完整排名数据
          console.log('🌍 最终洲际排名:', generatedRankings.map(r => ({
            排名: r.rank,
            洲名: r.name,
            洲ID: r.continentId,
            玩家总数: r.playerCount,
            生成猫咪数: r.cats.length,
            徽章: r.rankImage
          })));

          setRankings(generatedRankings);
        } else {
          console.error('获取洲际统计失败:', data.message);
        }
      } catch (error) {
        console.error('获取洲际统计时出错:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContinentStats();
  }, []);

  // 处理滚动条拖拽
  const handleScrollbarMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    
    const scrollContainer = scrollContainerRef.current;
    const scrollbarTrack = scale(124); // 响应式滚动条轨道高度
    const containerHeight = scrollContainer.clientHeight;
    const contentHeight = scrollContainer.scrollHeight;
    
    if (contentHeight <= containerHeight) return;
    
    const rect = scrollContainer.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const scrollRatio = Math.max(0, Math.min(1, (relativeY - scale(289)) / scrollbarTrack));
    const newScrollTop = scrollRatio * (contentHeight - containerHeight);
    
    scrollContainer.scrollTop = newScrollTop;
    setScrollPosition(scrollRatio);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 处理滚动更新
  const handleScroll = () => {
    if (!scrollContainerRef.current || isDragging) return;
    
    const scrollContainer = scrollContainerRef.current;
    const containerHeight = scrollContainer.clientHeight;
    const contentHeight = scrollContainer.scrollHeight;
    
    if (contentHeight <= containerHeight) {
      setScrollPosition(0);
      return;
    }
    
    const scrollRatio = scrollContainer.scrollTop / (contentHeight - containerHeight);
    setScrollPosition(scrollRatio);
  };

  // 添加全局鼠标事件监听器
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // 如果选择了洲际，显示洲内排行榜
  if (selectedContinent) {
    return (
      <ContinentRankingScreen
        continentId={selectedContinent.continentId}
        continentName={selectedContinent.continentName}
        continentImage={selectedContinent.continentImage}
        onBack={handleBackFromContinent}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="bg-[#2f2f2f] relative"
        style={{
          width: `${scale(724)}px`,
          height: `${scale(584)}px`,
          ...cssVars
        }}
      >
        {/* GameCompletionScreen样式的背景 */}
        <div className="absolute inset-0">
          {/* 背景图片 */}
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
              className="w-full h-full bg-[#d9d9d9] opacity-60"
              style={{
                border: `${scale(4)}px solid #3a3656`
              }}
            >
              <div className="h-full bg-[#5ff367] w-[75%]" />
            </div>
          </div>

          {/* 温度进度条 */}
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
              className="absolute bg-[#d9d9d9]"
              style={{
                top: `${scale(9)}px`,
                width: `${scale(628)}px`,
                height: `${scale(24)}px`,
                border: `${scale(4)}px solid #3a3656`
              }}
            >
              <div className="absolute top-0 h-full bg-[#ff9500] opacity-60 left-[40%] w-[20%]" />
              <div className="h-full bg-[#728cff] w-[50%]" />
            </div>
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

        {/* 半透明覆盖层 */}
        <div className="absolute inset-0 bg-[#545454] opacity-50" />

        {/* 返回按钮 */}
        <button
          className="absolute cursor-pointer hover:scale-105 transition-transform z-30"
          style={{
            width: `${scale(50)}px`,
            height: `${scale(47)}px`,
            top: `${scale(48)}px`,
            left: `${scale(110)}px`
          }}
          onClick={onBack}
        >
          <img
            className="w-full h-full object-cover"
            alt="返回按钮"
            src="/icon-back.png"
          />
        </button>

        {/* 滚动条 */}
        <div 
          className="absolute bg-[#F0BC08] rounded cursor-pointer z-20"
          style={{ 
            width: `${scale(9)}px`,
            top: `${scale(289)}px`,
            left: '50%',
            marginLeft: `${scale(217)}px`, // 响应式内容区域一半宽度 + 间距
            height: `${scale(124)}px`,
            transform: `translateY(${scrollPosition * (scale(124) - scale(20))}px)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease'
          }}
          onMouseDown={handleScrollbarMouseDown}
        />

        {/* 主内容容器 - 可滚动区域 居中 */}
        <div 
          ref={scrollContainerRef}
          className="absolute overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          style={{
            top: `${scale(0)}px`,
            left: '50%',
            marginLeft: `${scale(-207)}px`, // 负的内容区域一半宽度进行居中
            width: `${scale(414)}px`,
            height: `100%`
          }}
          onScroll={handleScroll}
        >
          <div 
            className="relative w-full" 
            style={{ 
              height: `${rankings.length * scale(249) + (rankings.length - 1) * scale(32)}px` 
            }}
          >
            {/* 加载状态 */}
            {loading && (
              <div className="flex items-center justify-center h-full">
                <div 
                  className="text-white font-bold"
                  style={{
                    fontSize: `${scale(20)}px`
                  }}
                >
                  Loading continent rankings...
                </div>
              </div>
            )}

            {/* 遍历排名创建卡片 */}
            {!loading && rankings.map((ranking, index) => (
              <div
                key={`ranking-${ranking.continentId}`}
                className="absolute cursor-pointer hover:scale-[1.02] transition-transform duration-200"
                style={{ 
                  width: `${scale(414)}px`,
                  height: `${scale(249)}px`,
                  top: `${index * (scale(249) + scale(32))}px` 
                }}
                onClick={() => handleContinentClick(ranking.continentId)}
              >
                {/* 横幅区域 - 按Figma设计 Frame 84 */}
                <div 
                  className="absolute z-10"
                  style={{
                    width: `${scale(309)}px`,
                    height: `${scale(94)}px`,
                    top: `${scale(-3)}px`,
                    left: `${scale(63)}px`
                  }}
                >
                  {/* Banner_Succ - 横幅背景图片 */}
                  <img
                    className="absolute top-0 left-0 object-cover"
                    style={{
                      width: `${scale(309)}px`,
                      height: `${scale(94)}px`
                    }}
                    alt="横幅背景"
                    src="/banner-succ-5.png"
                  />
                  
                  {/* Frame 71 - 垂直布局容器 */}
                  <div 
                    className="absolute flex flex-col"
                    style={{
                      width: `${scale(165)}px`,
                      height: `${scale(51)}px`,
                      top: `${scale(14)}px`,
                      left: `${scale(72)}px`
                    }}
                  >
                    {/* Region_Image - 地区图片 */}
                    <div 
                      className="relative flex items-center justify-center"
                      style={{
                        width: `${scale(154)}px`,
                        height: `${scale(38)}px`,
                        left: `${scale(5.5)}px`
                      }}
                    >
                      <img
                        className="max-w-full max-h-full object-contain"
                        alt={ranking.name}
                        src={continentImages[ranking.continentId] || '/asia.png'}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/asia.png';
                        }}
                      />
                    </div>
                    
                    {/* PassedCat_Text - 玩家数量 */}
                    <div 
                      className="relative text-center text-[#161616] font-bold silkscreen-bold"
                      style={{
                        width: `${scale(165)}px`,
                        height: `${scale(27)}px`,
                        left: 0,
                        fontSize: `${scale(10)}px`,
                      }}
                    >
                      {ranking.playerCount} meow clears!
                    </div>
                  </div>
                </div>

                {/* 卡片背景框架 */}
                <div 
                  className="absolute"
                  style={{
                    width: `${scale(414)}px`,
                    height: `${scale(217)}px`,
                    top: `${scale(32)}px`,
                    left: 0
                  }}
                >
                  {/* 卡片背景 */}
                  <img
                    className="absolute object-cover"
                    style={{
                      width: `${scale(394)}px`,
                      height: `${scale(217)}px`,
                      top: 0,
                      left: `${scale(20)}px`
                    }}
                    alt={`${ranking.name}卡片背景`}
                    src="/card-bg-s-5.png"
                  />

                  {/* 排名徽章 */}
                  <img
                    className="absolute object-cover"
                    style={{
                      width: `${scale(50)}px`,
                      height: `${scale(50)}px`,
                      top: `${scale(87)}px`,
                      left: 0
                    }}
                    alt={`第${ranking.rank}名`}
                    src={ranking.rankImage}
                  />
                  
                  {/* 显示第4名以后的排名数字 */}
                  {ranking.rank > 3 && (
                    <div 
                      className="absolute flex items-center justify-center text-white font-bold silkscreen-bold"
                      style={{
                        width: `${scale(50)}px`,
                        height: `${scale(50)}px`,
                        top: `${scale(87)}px`,
                        left: 0,
                        fontSize: `${scale(18)}px`,
                        WebkitTextStroke: `${scale(2)}px #000`
                      }}
                    >
                      {ranking.rank}
                    </div>
                  )}
                </div>

                {/* 猫咪框架 - 定位在卡片内 */}
                <div 
                  className="absolute"
                  style={{
                    width: `${scale(313)}px`,
                    height: `${scale(143)}px`,
                    top: `${scale(84)}px`,
                    left: `${scale(40)}px`
                  }}
                >
                  {/* 生成的猫咪 */}
                  {ranking.cats.map((cat, catIndex) => (
                    <img
                      key={`${ranking.continentId}-${cat.id}-${catIndex}`}
                      className="absolute object-cover"
                      style={{
                        top: `${cat.y}px`,
                        left: `${cat.x}px`,
                        width: `${cat.size}px`,
                        height: `${cat.size}px`,
                        transform: cat.flipped ? 'scaleX(-1)' : 'none'
                      }}
                      alt={`猫咪${cat.id}`}
                      src={cat.src}
                    />
                  ))}

                  {/* 只在玩家所在的洲显示主猫咪和名牌 */}
                  {ranking.continentId === playerInfo.continentId && (
                    /* 玩家主猫咪和名牌（类似GameCompletionScreen） */
                    <div 
                      className="absolute"
                      style={{
                        width: `${scale(106)}px`,
                        height: `${scale(130)}px`,
                        top: 0,
                        left: 0
                      }}
                    >
                      {/* 玩家名牌 */}
                      <div 
                        className="absolute"
                        style={{
                          width: `${scale(103)}px`,
                          height: `${scale(66)}px`,
                          top: 0,
                          left: 0
                        }}
                      >
                        <div 
                          className="w-full h-full bg-[url(/nametag.png)] bg-contain bg-center bg-no-repeat"
                        />
                        
                        {/* 玩家名字文字 */}
                        <div 
                          className="absolute left-0 right-0 font-bold text-black tracking-[0] leading-[normal] whitespace-nowrap text-center"
                          style={{
                            fontFamily: 'Pixelify Sans', 
                            fontSize: `${scale(Math.max(8, 20 - playerInfo.playerName.length * 1.5))}px`,
                            top: `${scale(26 - (Math.max(8, 20 - playerInfo.playerName.length * 1.5) - 16) * 0.2)}px` // 根据字体大小调整居中位置
                          }}
                        >
                          {playerInfo.playerName.slice(0, 8)}
                        </div>
                      </div>
                      
                      {/* 玩家主猫咪 */}
                      <img
                        className="absolute object-cover"
                        style={{
                          width: `${scale(97)}px`,
                          height: `${scale(97)}px`,
                          top: `${scale(33)}px`,
                          left: `${scale(9)}px`
                        }}
                        alt="玩家的猫咪"
                        src={`/Cat_${playerInfo.catAvatarId || '1'}.png`}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/Cat_1.png";
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};