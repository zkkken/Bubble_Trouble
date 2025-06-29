import React from "react";
import { Card, CardContent } from "./ui/card";

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

  // 获取洲际排行榜数据
  React.useEffect(() => {
    const fetchContinentLeaderboard = async () => {
      try {
        const response = await fetch(`/api/leaderboard/continent/${continentId}?limit=20`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        setPlayers(data.players || data);
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
    const maxScrollBarTop = 433 - 124; // 容器高度 - 滚动条高度
    
    // 计算鼠标相对于容器顶部的位置
    const mouseY = e.clientY - containerRect.top;
    const newScrollBarTop = Math.max(0, Math.min(maxScrollBarTop, mouseY - 62)); // 62是滚动条高度的一半
    
    // 根据滚动条位置计算内容滚动位置
    const scrollRatio = newScrollBarTop / maxScrollBarTop;
    const newScrollTop = scrollRatio * maxScrollTop;
    
    setScrollBarTop(newScrollBarTop);
    container.scrollTop = newScrollTop;
  }, [isDragging]);

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
    const maxScrollBarTop = 433 - 124; // 容器高度 - 滚动条高度
    
    if (maxScrollTop > 0) {
      const scrollRatio = container.scrollTop / maxScrollTop;
      const newScrollBarTop = scrollRatio * maxScrollBarTop;
      setScrollBarTop(newScrollBarTop);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="w-[724px] h-[584px] bg-[#2f2f2f] relative">
        {/* 游戏背景 - 来自GameCompletionScreen */}
        <div className="absolute inset-0">
          {/* 背景图像 */}
          <div className="absolute inset-0 bg-[url(/background.png)] bg-cover bg-center" />

          {/* 舒适度进度条 */}
          <div className="absolute left-[48px] top-[108px] w-[628px] h-[24px]">
            <div className="w-full h-full bg-[#d9d9d9] border-4 border-[#3a3656] opacity-60">
              <div className="h-full bg-[#5ff367] w-[75%]" />
            </div>
          </div>

          {/* 温度进度条系统 */}
          <div className="absolute left-[48px] top-[136px] w-[628px] h-[78px] opacity-60">
            <div className="absolute top-[9px] w-[628px] h-[24px] bg-[#d9d9d9] border-4 border-[#3a3656]">
              <div className="absolute top-0 h-full bg-[#ff9500] opacity-60 left-[40%] w-[20%]" />
              <div className="h-full bg-[#728cff] w-[50%]" />
            </div>
            <div className="absolute w-[16px] h-[40px] bg-[#f8cb56] border-[#3a3656] border-[5px] left-[306px] top-0" />
          </div>

          {/* 控制按钮 */}
          <div className="absolute left-[84px] top-[460px] w-[56px] h-[56px] opacity-60">
            <img className="w-full h-full object-cover" src="/button-temp-minus.png" />
          </div>
          <div className="absolute left-[584px] top-[460px] w-[56px] h-[56px] opacity-60">
            <img className="w-full h-full object-cover" src="/button-temp-plus.png" />
          </div>
        </div>

        <div className="relative h-[637px] top-[-53px]">
          {/* Overlay */}
          <div className="absolute w-[724px] h-[584px] top-[53px] left-0 bg-[#545454] opacity-50" />

          {/* Card background */}
          <img
            className="absolute w-[394px] h-[521px] top-[90px] left-[165px] object-cover"
            alt="Card bg"
            src="/card-bg-1.png"
          />

          {/* Leaderboard card - centered relative to card background */}
          <Card className="absolute w-[333px] h-[433px] top-[155px] left-[196px] border-none bg-transparent shadow-none">
            <CardContent className="p-0">
              {/* 自定义滑动条 */}
              <div 
                className="absolute z-10 cursor-pointer hover:bg-[#7dd8f0] transition-colors"
                style={{
                  width: '9px',
                  height: '124px',
                  background: '#8CE4FD',
                  left: '335px',
                  top: `${scrollBarTop}px`,
                  flexShrink: 0,
                  borderRadius: '4px'
                }}
                onMouseDown={handleMouseDown}
              />
              <div 
                ref={scrollContainerRef}
                className="flex flex-col w-[333px] h-[433px] items-start gap-3 relative overflow-y-auto max-h-[433px] pr-2 overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                onScroll={handleScroll}
              >
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-black text-lg font-bold">
                      加载{continentName}排行榜中...
                    </div>
                  </div>
                ) : (
                  players.map((player, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-[333px] h-[50px] flex flex-row items-start"
                      style={{ gap: '55px' }}
                    >
                      {/* Frame 86 - 左侧区域 (徽章 + 名字) */}
                      <div 
                        className="w-[174px] h-[50px] flex flex-row items-start"
                        style={{ gap: '4px' }}
                      >
                        {/* RankingBadge - 50x50px */}
                        <div className="w-[50px] h-[50px] flex-shrink-0">
                          {player.hasBadge ? (
                            <img
                              className="w-full h-full object-cover"
                              alt={`Rank ${player.rank} badge`}
                              src={player.badgeSrc}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div
                                className="[font-family:'Silkscreen',Helvetica] font-normal text-black text-center tracking-[0] leading-[38px] whitespace-nowrap"
                                style={{ fontSize: '1.25rem' }}
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
                          className="text-center whitespace-nowrap tracking-[0] leading-[38px]"
                          style={index < 3 ? {
                            color: '#F1BA08',
                            textAlign: 'center',
                            WebkitTextStrokeWidth: '2px',
                            WebkitTextStrokeColor: '#000',
                            fontFamily: 'Silkscreen',
                            fontSize: '1.5rem',
                            fontStyle: 'normal',
                            fontWeight: 700,
                            lineHeight: '38px'
                          } : {
                            fontFamily: 'Silkscreen',
                            fontSize: '1.25rem',
                            fontStyle: 'normal',
                            fontWeight: 'normal',
                            lineHeight: '38px',
                            color: '#000'
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