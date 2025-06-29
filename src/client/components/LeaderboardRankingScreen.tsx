/**
 * 洲际排行榜界面组件
 * 显示各大洲的排名，基于玩家人数进行排序
 * 支持动态生成猫咪、可拖拽滚动条、与GameCompletionScreen相同的背景样式
 */

import React, { useState, useEffect, useRef } from "react";
import { ContinentRankingScreen } from "./ContinentRankingScreen";

interface LeaderboardRankingScreenProps {
  onBack: () => void;
}

interface ContinentStats {
  continentId: string;
  continentName: string;
  playerCount: number;
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
      return JSON.parse(stored);
    }
  }
  // 默认玩家信息
  return {
    playerName: 'Player',
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

  // 获取玩家所在的洲际ID（基于地理位置或默认）
  const getPlayerContinent = (): string => {
    // 可以根据玩家IP或设置来确定，这里使用随机或默认
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('catComfortGame_playerContinent');
      if (stored) {
        return stored;
      }
      
      // 设置玩家在大洋洲（排名最后），这样容易看到效果
      localStorage.setItem('catComfortGame_playerContinent', 'OC');
      return 'OC';
    }
    // 默认返回亚洲
    return 'AS';
  };

  // 根据玩家人数为洲际生成随机猫咪
  const generateCatsForContinent = (playerCount: number, continentId: string): CatData[] => {
    const numCats = Math.min(Math.max(3, Math.floor(playerCount / 10)), 15); // 根据玩家人数生成3-15只猫咪
    const cats: CatData[] = [];
    const usedPositions: Array<{ x: number; y: number; size: number }> = [];
    const playerContinent = getPlayerContinent();

    // 如果是玩家所在的洲，为玩家主猫咪和名牌预留空间
    if (continentId === playerContinent) {
      usedPositions.push({ x: 0, y: 0, size: 106 }); // 主猫咪区域 106x130
    }

    const isPositionValid = (x: number, y: number, size: number): boolean => {
      // 检查边界（在卡片区域内，考虑猫咪框架）
      if (x < 0 || x + size > 313 || y < 0 || y + size > 143) return false;
      
      // 检查与现有猫咪的碰撞
      for (const pos of usedPositions) {
        const distance = Math.sqrt(
          Math.pow(x + size/2 - (pos.x + pos.size/2), 2) + 
          Math.pow(y + size/2 - (pos.y + pos.size/2), 2)
        );
        if (distance < (size + pos.size) / 2 + 10) return false; // 10px间距
      }
      return true;
    };

    let attempts = 0;
    while (cats.length < numCats - 1 && attempts < 100) {
      const size = Math.floor(Math.random() * 21) + 40; // 调整为40-60px
      const x = Math.floor(Math.random() * (313 - size));
      const y = Math.floor(Math.random() * (143 - size));

      if (isPositionValid(x, y, size)) {
        cats.push({
          id: `cat-${cats.length}`,
          src: catImages[Math.floor(Math.random() * catImages.length)] || "/Cat_1.png",
          x,
          y,
          size,
          flipped: Math.random() > 0.5
        });
        usedPositions.push({ x, y, size });
      }
      attempts++;
    }

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
          
          // 按玩家人数排序洲际（降序）并生成排名
          const sortedStats = [...data.data].sort((a, b) => b.playerCount - a.playerCount);
          const generatedRankings: ContinentRanking[] = sortedStats.map((stat, index) => ({
            name: continentNames[stat.continentId] || stat.continentName?.toUpperCase() || 'UNKNOWN',
            continentId: stat.continentId,
            rank: index + 1,
            playerCount: stat.playerCount,
            rankImage: index < 3 ? `/rankingbadge--${index + 1}.png` : "/rankingbadge-normal-2.png",
            cats: generateCatsForContinent(stat.playerCount, stat.continentId)
          }));

          setRankings(generatedRankings); // 只显示有数据的洲际
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
    const scrollbarTrack = 124; // 滚动条轨道高度
    const containerHeight = scrollContainer.clientHeight;
    const contentHeight = scrollContainer.scrollHeight;
    
    if (contentHeight <= containerHeight) return;
    
    const rect = scrollContainer.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const scrollRatio = Math.max(0, Math.min(1, (relativeY - 289) / scrollbarTrack));
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
    <div className="leaderboard-container">
      <div className="leaderboard-main">
        {/* GameCompletionScreen样式的背景 */}
        <div className="absolute inset-0">
          {/* 背景图片 */}
          <div className="absolute inset-0 bg-[url(/background.png)] bg-cover bg-center" />
          
          {/* 舒适度进度条 */}
          <div className="absolute left-[48px] top-[108px] w-[628px] h-[24px]">
            <div className="w-full h-full bg-[#d9d9d9] border-4 border-[#3a3656] opacity-60">
              <div className="h-full bg-[#5ff367] w-[75%]" />
            </div>
          </div>

          {/* 温度进度条 */}
          <div className="absolute left-[48px] top-[136px] w-[628px] h-[78px] opacity-60">
            <div className="absolute top-[9px] w-[628px] h-[24px] bg-[#d9d9d9] border-4 border-[#3a3656]">
              <div className="absolute top-0 h-full bg-[#ff9500] opacity-60 left-[40%] w-[20%]" />
              <div className="h-full bg-[#728cff] w-[50%]" />
            </div>
          </div>
          {/* 控制按钮 */}
          <div className="absolute left-[84px] top-[460px] w-[56px] h-[56px] opacity-60">
            <img className="w-full h-full object-cover" src="/button-temp-minus.png" />
          </div>
          <div className="absolute left-[584px] top-[460px] w-[56px] h-[56px] opacity-60">
            <img className="w-full h-full object-cover" src="/button-temp-plus.png" />
          </div>
        </div>

        {/* 半透明覆盖层 */}
        <div className="absolute inset-0 bg-[#545454] opacity-50" />

        {/* 返回按钮 */}
        <button
          className="absolute w-[50px] h-[47px] top-[48px] left-[110px] cursor-pointer hover:scale-105 transition-transform z-30"
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
          className="absolute w-[9px] top-[289px] bg-[#F0BC08] rounded cursor-pointer z-20"
          style={{ 
            left: '50%',
            marginLeft: '217px', // 内容区域一半宽度(207px) + 间距(10px)
            height: '124px',
            transform: `translateY(${scrollPosition * (124 - 20)}px)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease'
          }}
          onMouseDown={handleScrollbarMouseDown}
        />

        {/* 主内容容器 - 可滚动区域 居中 */}
        <div 
          ref={scrollContainerRef}
          className="scrollable-content"
          onScroll={handleScroll}
        >
          <div className="relative w-full" style={{ height: `${rankings.length * 249 + (rankings.length - 1) * 32}px` }}>
            {/* 加载状态 */}
            {loading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-white text-xl">Loading continent rankings...</div>
              </div>
            )}

            {/* 遍历排名创建卡片 */}
            {!loading && rankings.map((ranking, index) => (
              <div
                key={`ranking-${ranking.continentId}`}
                className="absolute w-[414px] h-[249px] cursor-pointer hover:scale-[1.02] transition-transform duration-200"
                style={{ top: `${index * (249 + 32)}px` }}
                onClick={() => handleContinentClick(ranking.continentId)}
              >
                {/* 横幅区域 - 按Figma设计 Frame 84 */}
                <div className="absolute w-[309px] h-[94px] top-[-3px] left-[63px] z-10">
                  {/* Banner_Succ - 横幅背景图片 */}
                  <img
                    className="absolute w-[309px] h-[94px] top-0 left-0 object-cover"
                    alt="横幅背景"
                    src="/banner-succ-5.png"
                  />
                  
                  {/* Frame 71 - 垂直布局容器 */}
                  <div className="absolute w-[165px] h-[51px] top-[14px] left-[72px] flex flex-col">
                    {/* Region_Image - 地区图片 */}
                    <div className="w-[154px] h-[38px] relative left-[5.5px] flex items-center justify-center">
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
                      className="w-[165px] h-[27px] relative left-0 text-center text-[#161616] font-bold"
                      style={{
                        fontSize: '10px',
                        fontFamily: 'Silkscreen, monospace'
                      }}
                    >
                      {ranking.playerCount} meow clears!
                    </div>
                  </div>
                </div>

                {/* 卡片背景框架 */}
                <div className="absolute w-[414px] h-[217px] top-[32px] left-0">
                  {/* 卡片背景 */}
                  <img
                    className="absolute w-[394px] h-[217px] top-0 left-[20px] object-cover"
                    alt={`${ranking.name}卡片背景`}
                    src="/card-bg-s-5.png"
                  />

                  {/* 排名徽章 */}
                  <img
                    className="absolute w-[50px] h-[50px] top-[87px] left-0 object-cover"
                    alt={`第${ranking.rank}名`}
                    src={ranking.rankImage}
                  />
                  
                  {/* 显示第4名以后的排名数字 */}
                  {ranking.rank > 3 && (
                    <div 
                      className="absolute w-[50px] h-[50px] top-[87px] left-0 flex items-center justify-center text-white font-bold"
                      style={{
                        fontSize: '18px',
                        fontFamily: 'Silkscreen, monospace'
                      }}
                    >
                      {ranking.rank}
                    </div>
                  )}
                </div>

                {/* 猫咪框架 - 定位在卡片内 */}
                <div className="absolute w-[313px] h-[143px] top-[84px] left-[40px]">
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
                  {ranking.continentId === getPlayerContinent() && (
                    /* 玩家主猫咪和名牌（类似GameCompletionScreen） */
                    <div className="absolute w-[106px] h-[130px] top-0 left-0">
                      {/* 玩家名牌 */}
                      <div className="absolute w-[103px] h-[66px] top-0 left-0">
                        <img
                          className="w-full h-full object-cover"
                          alt="玩家名牌背景"
                          src="/nametag.png"
                        />
                        
                        {/* 玩家名字文字 */}
                        <div 
                          className="absolute left-0 right-0 font-bold text-black tracking-[0] leading-[normal] whitespace-nowrap text-center"
                          style={{
                            fontFamily: 'lores-12', 
                            fontSize: `${Math.max(8, 20 - playerInfo.playerName.length * 1.5)}px`,
                            top: `${26 - (Math.max(8, 20 - playerInfo.playerName.length * 1.5) - 16) * 0.2}px` // 根据字体大小调整居中位置
                          }}
                        >
                          {playerInfo.playerName.slice(0, 8)}
                        </div>
                      </div>
                      
                      {/* 玩家主猫咪 */}
                      <img
                        className="absolute w-[97px] h-[97px] top-[33px] left-[9px] object-cover"
                        alt="玩家的猫咪"
                        src={playerInfo.selectedCat}
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