import React from "react";
import { Card, CardContent } from "./ui/card";
import { useResponsiveScale, useResponsiveSize } from '../hooks/useResponsiveScale';

interface Player {
  rank: number;
  name: string;
  time: string;
  hasBadge: boolean;
  badgeSrc?: string;
}

interface ContinentRankingScreenProps {
  continentId: string;
  continentName: string;
  continentImage: string;
  onBack: () => void;
}

export const ContinentRankingScreen: React.FC<ContinentRankingScreenProps> = ({
  continentId,
  continentName,
  continentImage,
  onBack
}) => {
  const [players, setPlayers] = React.useState<Player[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isDragging, setIsDragging] = React.useState(false);
  const [scrollBarTop, setScrollBarTop] = React.useState(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // 响应式设计hooks
  const { cssVars } = useResponsiveScale();
  const { scale } = useResponsiveSize();

  // 获取洲际排行榜数据
  React.useEffect(() => {
    const fetchContinentLeaderboard = async () => {
      try {
        const response = await fetch(`/api/leaderboard/${continentId}?limit=20`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // 详细日志输出
        console.log(`🏆 [${continentId}] ${continentName} 排行榜数据:`, data);
        
        if (data.stats) {
          const { playerCount, totalTime, averageTime } = data.stats;
          console.log(`📊 [${continentId}] 洲际统计:`, {
            洲名: continentName,
            总玩家数: playerCount,
            洲总用时: `${totalTime.toFixed(1)}秒`,
            平均用时: `${averageTime.toFixed(1)}秒`,
            显示条目: data.data?.length || 0
          });
        }
        
        const playersData = data.data || data;
        
        // Transform API data to match Player interface
        const transformedPlayers: Player[] = playersData.map((item: any, index: number) => ({
          rank: item.rank || (index + 1),
          name: item.playerName || item.name || 'Unknown',
          time: typeof item.enduranceDuration === 'number' 
            ? `${Math.floor(item.enduranceDuration / 60)}:${(item.enduranceDuration % 60).toFixed(0).padStart(2, '0')}`
            : item.time || '0:00',
          hasBadge: (item.rank || (index + 1)) <= 3,
          badgeSrc: (item.rank || (index + 1)) <= 3 ? `/rankingbadge--${item.rank || (index + 1)}.png` : undefined
        }));
        
        console.log('🔧 Transformed players data:', transformedPlayers.slice(0, 3));
        setPlayers(transformedPlayers);
        
        // 检查猫咪生成数量
        if (data.stats && data.stats.playerCount) {
          console.log(`🐱 [${continentId}] 猫咪检查: 应生成${data.stats.playerCount}只猫，实际排行榜显示${playersData.length}条记录`);
        }
      } catch (error) {
        console.error(`获取${continentName}排行榜时出错:`, error);
        // 出错时返回空数据
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContinentLeaderboard();
  }, [continentId, continentName]);

  // 滚动条相关函数
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const maxScrollTop = container.scrollHeight - container.clientHeight;
    const maxScrollBarTop = scale(433) - scale(124); // 响应式滚动条高度
    
    // 计算鼠标相对于容器顶部的位置
    const mouseY = e.clientY - containerRect.top;
    const newScrollBarTop = Math.max(0, Math.min(maxScrollBarTop, mouseY - scale(62))); // 62是滚动条高度的一半响应式
    
    // 根据滚动条位置计算内容滚动位置
    const scrollRatio = newScrollBarTop / maxScrollBarTop;
    const newScrollTop = scrollRatio * maxScrollTop;
    
    setScrollBarTop(newScrollBarTop);
    container.scrollTop = newScrollTop;
  }, [isDragging, scale]);

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  // 监听鼠标事件
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // 监听内容滚动，同步更新滚动条位置
  const handleScroll = () => {
    if (!scrollContainerRef.current || isDragging) return;
    
    const container = scrollContainerRef.current;
    const maxScrollTop = container.scrollHeight - container.clientHeight;
    const maxScrollBarTop = scale(433) - scale(124); // 响应式滚动条高度
    
    if (maxScrollTop > 0) {
      const scrollRatio = container.scrollTop / maxScrollTop;
      const newScrollBarTop = scrollRatio * maxScrollBarTop;
      setScrollBarTop(newScrollBarTop);
    }
  };

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
        {/* 游戏背景 - 来自GameCompletionScreen */}
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
              className="w-full h-full bg-[#d9d9d9] opacity-60"
              style={{
                border: `${scale(4)}px solid #3a3656`
              }}
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
            <div 
              className="absolute bg-[#f8cb56]"
              style={{
                width: `${scale(16)}px`,
                height: `${scale(40)}px`,
                border: `${scale(5)}px solid #3a3656`,
                left: `${scale(306)}px`,
                top: 0
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
            height: `${scale(637)}px`,
            top: `${scale(-53)}px`
          }}
        >
          {/* Overlay */}
          <div 
            className="absolute bg-[#545454] opacity-50"
            style={{
              width: `${scale(724)}px`,
              height: `${scale(584)}px`,
              top: `${scale(53)}px`,
              left: 0
            }}
          />

          {/* Card background */}
          <img
            className="absolute object-cover"
            style={{
              width: `${scale(394)}px`,
              height: `${scale(521)}px`,
              top: `${scale(90)}px`,
              left: `${scale(165)}px`
            }}
            alt="Card bg"
            src="/card-bg-1.png"
          />

          {/* Leaderboard card - centered relative to card background */}
          <Card 
            className="absolute border-none bg-transparent shadow-none"
            style={{
              width: `${scale(333)}px`,
              height: `${scale(433)}px`,
              top: `${scale(155)}px`,
              left: `${scale(196)}px`
            }}
          >
            <CardContent className="p-0">
              {/* 自定义滑动条 */}
              <div 
                className="absolute z-10 cursor-pointer hover:bg-[#7dd8f0] transition-colors"
                style={{
                  width: `${scale(9)}px`,
                  height: `${scale(124)}px`,
                  background: '#8CE4FD',
                  left: `${scale(335)}px`,
                  top: `${scrollBarTop}px`,
                  flexShrink: 0,
                  borderRadius: `${scale(4)}px`
                }}
                onMouseDown={handleMouseDown}
              />
              <div 
                ref={scrollContainerRef}
                className="flex flex-col items-start overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                style={{
                  width: `${scale(333)}px`,
                  height: `${scale(433)}px`,
                  gap: `${scale(12)}px`,
                  maxHeight: `${scale(433)}px`,
                  paddingRight: `${scale(8)}px`
                }}
                onScroll={handleScroll}
              >
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div 
                      className="text-black font-bold"
                      style={{
                        fontSize: `${scale(18)}px`
                      }}
                    >
                      加载{continentName}排行榜中...
                    </div>
                  </div>
                ) : (
                  players.map((player, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 flex flex-row items-start"
                      style={{ 
                        width: `${scale(333)}px`,
                        height: `${scale(50)}px`,
                        gap: `${scale(55)}px`
                      }}
                    >
                      {/* Frame 86 - 左侧区域 (徽章 + 名字) */}
                      <div 
                        className="flex flex-row items-start"
                        style={{
                          width: `${scale(174)}px`,
                          height: `${scale(50)}px`,
                          gap: `${scale(4)}px`
                        }}
                      >
                        {/* RankingBadge - 50x50px */}
                        <div 
                          className="flex-shrink-0"
                          style={{
                            width: `${scale(50)}px`,
                            height: `${scale(50)}px`
                          }}
                        >
                          {player.hasBadge ? (
                            <img
                              className="w-full h-full object-cover"
                              alt={`Rank ${player.rank} badge`}
                              src={player.badgeSrc}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div
                                className="silkscreen-bold text-black text-center tracking-[0] leading-[38px] whitespace-nowrap"
                                style={{ 
                                  fontSize: '1.25rem',
                                  WebkitTextStroke: `${scale(2.2)}px #000`
                                }}
                              >
                                {player.rank}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* 玩家名字区域，位置(54,6) */}
                        <div 
                          className="w-full h-[38px] flex items-center mt-[6px]"
                        >
                          <div 
                            className="[font-family:'Pixelify_Sans',Helvetica] font-bold text-black tracking-[0] leading-[38px] whitespace-nowrap overflow-hidden text-ellipsis w-full"
                            style={{ fontSize: '1.5rem' }}
                          >
                            {player.name.slice(0, 15)}
                          </div>
                        </div>
                      </div>

                      {/* 时间文本 - 90x38px区域，位置(243,6) */}
                      <div 
                        className="w-[90px] h-[38px] flex items-center justify-center mt-[6px]"
                      >
                        <div
                          className={`text-center whitespace-nowrap tracking-[0] leading-[38px] silkscreen-bold`}
                          style={index < 3 ? {
                            color: '#F1BA08',
                            textAlign: 'center',
                            WebkitTextStroke: `${scale(2.7)}px #000`,
                            fontSize: '1.5rem',
                            lineHeight: '38px'
                          } : {
                            fontSize: '1.25rem',
                            lineHeight: '38px',
                            color: '#000',
                            WebkitTextStroke: `${scale(2.2)}px #000`
                          }}
                        >
                          {player.time}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Title banner - centered horizontally with card background */}
          <div className="w-[363px] h-[206px] left-[180.5px] absolute top-0">
            <div className="relative w-[361px] h-[153px] top-[53px] -left-1">
              <img
                className="w-[309px] h-[153px] left-[26px] object-cover absolute top-0"
                alt="Banner succ"
                src="/banner-succ.png"
              />

              <img
                className="absolute w-[150px] h-auto top-[30px] left-[105px] object-contain"
                alt={continentName}
                src={continentImage}
              />
            </div>
          </div>

          {/* Back button */}
          <button
            className="absolute w-[50px] h-[47px] top-[101px] left-[110px] cursor-pointer hover:scale-105 transition-transform z-30"
            onClick={onBack}
            aria-label="Go back"
          >
            <img
              className="w-full h-full object-cover"
              alt="Icon back"
              src="/icon-back.png"
            />
          </button>
        </div>
      </div>
    </div>
  );
};