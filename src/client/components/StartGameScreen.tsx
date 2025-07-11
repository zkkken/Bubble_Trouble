/**
 * 开始游戏界面组件
 * 基于 project 设计稿的精确像素级实现
 * 支持拖拽猫咪选择大洲和拖拽方式选择猫咪
 * 基于 project 设计稿的精确像素级实现
 * 支持拖拽猫咪选择大洲和拖拽方式选择猫咪
 * 
 * @author 开发者B - UI/UX 界面负责人
 */

import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { useResponsiveScale, useResponsiveSize } from '../hooks/useResponsiveScale';
import { audioManager } from '../services/audioManager';

interface StartGameScreenProps {
  onStartGame: (playerInfo: {
    playerName: string;
    continentId: string;
    catAvatarId: string;
  }) => void;
  onBackToLaunch?: () => void;
}

interface DragState {
  isDragging: boolean;
  draggedCat: any;
  offsetX: number;
  offsetY: number;
}

export const StartGameScreen: React.FC<StartGameScreenProps> = ({ onStartGame, onBackToLaunch }) => {
  const [inputText, setInputText] = useState("");
  const [continentId, setContinentId] = useState('');
  const [selectedCat, setSelectedCat] = useState<any>(null);
  const [hoveredContinentId, setHoveredContinentId] = useState(''); // 悬停的大洲
  const [showError, setShowError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedCat: null,
    offsetX: 0,
    offsetY: 0,
  });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // 响应式设计hooks
  const { cssVars } = useResponsiveScale();
  const { scale } = useResponsiveSize();

  const containerRef = useRef<HTMLDivElement>(null);
  // 使用 ref 来避免闭包问题
  const dragStateRef = useRef<DragState>({
    isDragging: false,
    draggedCat: null,
    offsetX: 0,
    offsetY: 0,
  });

  // 可爱的猫咪相关名字
  const catNames = [
    "Whiskers", "Mittens", "Shadow", "Luna", "Simba", "Nala", "Felix", "Garfield",
    "Tigger", "Smokey", "Patches", "Oreo", "Snowball", "Ginger", "Coco", "Pepper",
    "Muffin", "Cookie", "Pumpkin", "Honey", "Caramel", "Mocha", "Latte", "Espresso",
    "Buttercup", "Daisy", "Rose", "Lily", "Violet", "Jasmine", "Sage", "Basil",
    "Pickles", "Peanut", "Jellybean", "Marshmallow", "Cupcake", "Biscuit", "Waffle", "Pancake",
    "Ziggy", "Zorro", "Bandit", "Scout", "Hunter", "Ranger", "Storm", "Thunder",
    "Angel", "Princess", "Duchess", "Queen", "King", "Prince", "Duke", "Earl",
    "Fluffy", "Fuzzy", "Snuggles", "Cuddles", "Bubbles", "Giggles", "Wiggles", "Nibbles"
];

  // 六大洲列表及其在地图上的精确位置 (相对于地图容器) - 基础位置，将根据缩放调整
const getContinentsWithScale = (scale: (size: number) => number) => [
    { code: 'NA', name: 'North America', flag: 'NA', top: scale(68), left: scale(55) },
    { code: 'SA', name: 'South America', flag: 'SA', top: scale(165), left: scale(108) },
    { code: 'EU', name: 'Europe', flag: 'EU', top: scale(70), left: scale(210) },
    { code: 'AF', name: 'Africa', flag: 'AF', top: scale(130), left: scale(190) },
    { code: 'AS', name: 'Asia', flag: 'AS', top: scale(90), left: scale(290) },
    { code: 'OC', name: 'Oceania', flag: 'OC', top: scale(180), left: scale(310) },
];

const CONTINENTS = getContinentsWithScale((size: number) => size);

  // 猫咪头像选择数据 - 修复图片路径，使用正确的文件名
  const cats = [
    { id: 1, src: "/Cat_1.png", alt: "Cat", width: "w-[49px]", height: "h-[49px]" },
    { id: 2, src: "/Cat_2.png", alt: "Cat", width: "w-[49px]", height: "h-[49px]" },
    { id: 3, src: "/Cat_3.png", alt: "Cat", width: "w-[49px]", height: "h-[49px]" },
    { id: 4, src: "/Cat_4.png", alt: "Cat", width: "w-[45px]", height: "h-[55px]" },
    { id: 5, src: "/Cat_5.png", alt: "Cat", width: "w-[49px]", height: "h-[49px]" },
    { id: 6, src: "/Cat_6.png", alt: "Cat", width: "w-[49px]", height: "h-[49px]" },
    { id: 7, src: "/Cat_7.png", alt: "Cat", width: "w-[49px]", height: "h-[49px]" },
  ];

  // 生成随机猫咪名字
  // 生成随机猫咪名字
  const generateRandomName = () => {
    const randomIndex = Math.floor(Math.random() * catNames.length);
    const selectedName = catNames[randomIndex];
    if (selectedName) {
      setInputText(selectedName);
    }
    setShowError(false);
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (e.target.value.trim()) {
      setShowError(false);
    }
  };

  // 计算两点间距离
  const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  // 检查是否靠近大洲位置 (相对于地图区域的坐标) - 使用响应式缩放
  const checkContinentProximity = (x: number, y: number) => {
    const threshold = scale(50); // 吸附距离阈值
    const scaledContinents = getContinentsWithScale(scale);
    for (const continent of scaledContinents) {
      const distance = getDistance(x, y, continent.left, continent.top);
      if (distance <= threshold) {
        return continent;
      }
    }
    return null;
  };

  // 处理鼠标按下开始拖拽 - 支持从猫咪选择区域或地图上开始
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, cat: any, fromMap = false) => {
    e.preventDefault();
    const element = e.currentTarget as HTMLDivElement;
    element.style.cursor = 'grabbing';
    
    // 播放猫咪选择音效（只在音乐开启时且选择了新猫咪时播放）
    if (!audioManager.isMutedState() && (!selectedCat || selectedCat.id !== cat.id)) {
      audioManager.playSound('catMeow');
    }
    
    // 如果选择了新的猫咪，重置大洲选择
    if (!fromMap && selectedCat?.id !== cat.id) {
      setContinentId('');
      setHoveredContinentId('');
    }
    
    // 无论是否已经选中，都设置为当前猫咪并开始拖拽
    setSelectedCat(cat);

    // 立即设置鼠标位置和开始拖拽状态
    const offsetX = 25; // 猫咪图片的一半宽度
    const offsetY = 25; // 猫咪图片的一半高度
    
    const newDragState = {
      isDragging: true,
      draggedCat: cat,
      offsetX,
      offsetY,
    };
    
    setDragState(newDragState);
    dragStateRef.current = newDragState; // 同步更新 ref
    setMousePosition({ x: e.clientX, y: e.clientY });

    // 如果是从地图上开始拖拽，清除该位置的猫咪
    if (fromMap) {
      setContinentId('');
    }

    // 添加全局鼠标和触摸事件监听
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchmove', handleGlobalMouseMove as any, { passive: false });
    document.addEventListener('touchend', handleGlobalMouseUp as any);
  };

  // 全局鼠标/触摸移动处理
  const handleGlobalMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!dragStateRef.current.isDragging) return; // 使用 ref 检查状态
    
    // 处理触摸和鼠标事件
    const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY;
    
    if (clientX === undefined || clientY === undefined) return;
    
    setMousePosition({ x: clientX, y: clientY });

    // 检查是否悬停在地图区域内的大洲上
    const mapContainer = containerRef.current?.querySelector('.map-container') as HTMLElement;
    if (mapContainer) {
      const mapRect = mapContainer.getBoundingClientRect();
      const x = clientX - mapRect.left;
      const y = clientY - mapRect.top;

      // 检查是否在地图范围内 - 使用响应式尺寸
      const mapWidth = scale(364);
      const mapHeight = scale(222);
      if (x >= 0 && x <= mapWidth && y >= 0 && y <= mapHeight) {
        const nearestContinent = checkContinentProximity(x, y);
        setHoveredContinentId(nearestContinent?.code || '');
      } else {
        setHoveredContinentId('');
      }
    }
  };

  // 全局鼠标/触摸释放处理
  const handleGlobalMouseUp = (e: MouseEvent | TouchEvent) => {
    if (!dragStateRef.current.isDragging) return; // 使用 ref 检查状态

    // 恢复鼠标样式
    const elements = document.querySelectorAll('.cat-card');
    elements.forEach(el => {
      (el as HTMLElement).style.cursor = 'grab';
    });

    // 处理触摸和鼠标事件
    const clientX = 'touches' in e ? e.changedTouches[0]?.clientX : e.clientX;
    const clientY = 'touches' in e ? e.changedTouches[0]?.clientY : e.clientY;
    
    if (clientX !== undefined && clientY !== undefined) {
      // 检查是否释放在地图区域内
      const mapContainer = containerRef.current?.querySelector('.map-container') as HTMLElement;
      if (mapContainer) {
        const mapRect = mapContainer.getBoundingClientRect();
        const x = clientX - mapRect.left;
        const y = clientY - mapRect.top;

        // 检查是否在地图范围内 - 使用响应式尺寸
        const mapWidth = scale(364);
        const mapHeight = scale(222);
        if (x >= 0 && x <= mapWidth && y >= 0 && y <= mapHeight) {
          const nearestContinent = checkContinentProximity(x, y);
          if (nearestContinent) {
            setContinentId(nearestContinent.code);
            console.log(`Selected continent: ${nearestContinent.name} at position (${x}, ${y})`);
          }
        }
      }
    }

    // 清理拖拽状态
    const newDragState = {
      isDragging: false,
      draggedCat: null,
      offsetX: 0,
      offsetY: 0,
    };
    setDragState(newDragState);
    dragStateRef.current = newDragState; // 同步更新 ref
    setHoveredContinentId('');

    // 移除全局事件监听 - 包括触摸事件
    document.removeEventListener('mousemove', handleGlobalMouseMove);
    document.removeEventListener('mouseup', handleGlobalMouseUp);
    document.removeEventListener('touchmove', handleGlobalMouseMove as any);
    document.removeEventListener('touchend', handleGlobalMouseUp as any);
  };

  // 处理开始按钮点击
  const handleStartClick = () => {
    if (!inputText.trim()) {
      setShowError(true);
      setIsShaking(true);
      
      setTimeout(() => {
        setIsShaking(false);
      }, 500);
      
      return;
    }

    if (!selectedCat) {
      setShowError(true);
      setIsShaking(true);
      
      setTimeout(() => {
        setIsShaking(false);
      }, 500);
      
      return;
    }
    
    // 调用回调函数开始游戏
    onStartGame({
      playerName: inputText.trim(),
      continentId: continentId || 'AS', // 默认亚洲
      catAvatarId: selectedCat.id.toString(),
    });
  };

  // 处理关闭按钮点击
  const handleCloseClick = () => {
    console.log("Close button clicked!");
    if (onBackToLaunch) {
      onBackToLaunch();
    }
  };



  // 获取选中大洲的信息
  const selectedContinent = CONTINENTS.find(c => c.code === continentId);

  // 获取响应式的大洲位置
  const scaledContinents = getContinentsWithScale(scale);

  return (
    <div 
      ref={containerRef} 
      className="bg-[#2f2f2f] mx-auto relative"
      style={{
        width: `${scale(724)}px`,
        height: `${scale(584)}px`,
        ...cssVars
      }}
    >
      <div 
        className="relative bg-[url('/Bg_Main.png')] bg-cover bg-center bg-no-repeat"
        style={{
          height: `${scale(584)}px`
        }}
      >
        <Card 
          className="flex flex-col items-center justify-center py-5 px-5 absolute bg-[#b7efff] border-solid border-white flex-shrink-0"
          style={{
            width: `${scale(607)}px`,
            height: `${scale(489)}px`,
            gap: `${scale(10)}px`,
            paddingTop: `${scale(43)}px`,
            paddingBottom: `${scale(43)}px`,
            top: `${scale(53)}px`,
            left: `${scale(52)}px`,
            borderRadius: `${scale(71.667)}px`,
            borderWidth: `${scale(4.095)}px`
          }}
        >
          <CardContent 
            className="flex flex-col items-center justify-center p-0"
            style={{
              width: `${scale(545)}px`,
              gap: `${scale(16)}px`
            }}
          >

            {/* 玩家名字输入框 */}
            <div 
              className={`relative bg-[#f9f2e6] border-solid transition-all duration-200 ${
                showError ? 'border-[#FA2E2E] animate-shake' : 'border-white'
              } ${isShaking ? 'animate-shake' : ''}`}
              style={{
                width: `${scale(531)}px`,
                height: `${scale(59)}px`,
                borderRadius: `${scale(24.81)}px`,
                borderWidth: `${scale(2.84)}px`
              }}
            >
              <Input
                className="h-full w-full bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-center placeholder:text-center font-vt323 !text-2xl placeholder:font-vt323 placeholder:!text-2xl"
                placeholder="Type your name here"
                value={inputText}
                onChange={handleInputChange}
              />
              <Button
                className="absolute p-0 bg-transparent hover:bg-transparent shadow-none hover:scale-105 transition-transform duration-200"
                type="button"
                style={{
                  width: `${scale(49)}px`,
                  height: `${scale(49)}px`,
                  top: `${scale(1)}px`,
                  right: `${scale(31)}px`
                }}
                onClick={generateRandomName}
              >
                <img
                  className="w-full h-full object-cover"
                  alt="Button random"
                  src="/Button_Random.png"
                />
              </Button>
        </div>

            {/* 地图区域 */}
            <div 
              className="relative map-container"
              style={{
                width: `${scale(364)}px`,
                height: `${scale(222)}px`
              }}
            >
              <img
                className="relative pointer-events-none"
                alt="Map"
                src="/map.png"
                style={{
                  width: `${scale(364)}px`,
                  height: `${scale(222)}px`
                }}
              />
              
              {/* 大洲目标区域 */}
              {scaledContinents.map((continent) => {
                const isSelected = continentId === continent.code;
                const isHovered = hoveredContinentId === continent.code && dragState.isDragging;
                
                return (
                  <div
                    key={continent.code}
                    className={`absolute rounded-full transition-all duration-300 ${
                      isSelected
                        ? 'border-[#f0bc08] bg-[#f0bc08] bg-opacity-40 scale-125'
                        : isHovered
                        ? 'border-[#f0bc08] bg-[#f0bc08] bg-opacity-20 scale-110'
                        : 'border-white bg-white bg-opacity-30'
                    }`}
                    style={{
                      width: `${scale(48)}px`,
                      height: `${scale(48)}px`,
                      borderWidth: `${scale(2)}px`,
                      top: `${continent.top}px`,
                      left: `${continent.left}px`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <span 
                        className={`font-bold ${isSelected ? 'text-white' : isHovered ? 'text-white' : 'text-[#f0bc08]'}`}
                        style={{ fontSize: `${scale(20)}px` }}
                      >
                        {continent.flag}
                      </span>
                    </div>
        </div>
                );
              })}

              {/* 在地图上显示已选中的猫咪 */}
              {selectedContinent && selectedCat && !dragState.isDragging && (
                <div
                  className="absolute cursor-grab"
                  style={{
                    top: `${selectedContinent.top - scale(15)}px`, // 稍微偏上一点
                    left: `${selectedContinent.left + scale(25)}px`, // 在大洲点右边
                    transform: 'translate(-50%, -50%)',
                  }}
                  onMouseDown={(e) => handleMouseDown(e, selectedCat, true)}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    const touch = e.touches[0];
                    if (touch) {
                      const mouseEvent = {
                        currentTarget: e.currentTarget,
                        clientX: touch.clientX,
                        clientY: touch.clientY,
                        preventDefault: () => e.preventDefault()
                      } as any;
                      handleMouseDown(mouseEvent, selectedCat, true);
                    }
                  }}
                >
                  <img
                    className="object-cover drop-shadow-lg"
                    alt={selectedCat.alt}
                    src={selectedCat.src}
                    style={{
                      width: `${scale(32)}px`,
                      height: `${scale(32)}px`
                    }}
                    draggable={false}
                  />
                </div>
              )}
        </div>

            {/* 猫咪选择区域 - 拖拽源 */}
            <div 
              className="flex items-center relative self-stretch w-full flex-[0_0_auto]"
              style={{ gap: `${scale(13)}px` }}
            >
              {cats.map((cat, index) => (
                <Card
                  key={cat.id}
                  className={`cat-card flex ${index === 2 || index === 3 ? "flex-col" : ""} items-center justify-center relative bg-[#f9f3e6] cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-105 select-none ${
                    selectedCat?.id === cat.id ? 'border-[#f0bc08] shadow-lg' : 'border-white'
                  } ${dragState.isDragging && dragState.draggedCat?.id === cat.id ? 'opacity-30' : ''}`}
                  style={{
                    width: `${scale(80)}px`,
                    height: `${scale(80)}px`,
                    gap: `${scale(10)}px`,
                    padding: `${scale(4)}px`,
                    borderRadius: `${scale(16)}px`,
                    borderWidth: `${scale(2)}px`
                  }}
                  onMouseDown={(e) => handleMouseDown(e, cat)}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    const touch = e.touches[0];
                    if (touch) {
                      // 创建模拟的鼠标事件
                      const mouseEvent = {
                        currentTarget: e.currentTarget,
                        clientX: touch.clientX,
                        clientY: touch.clientY,
                        preventDefault: () => e.preventDefault()
                      } as any;
                      handleMouseDown(mouseEvent, cat);
                    }
                  }}
                  onMouseUp={(e) => {
                    const element = e.currentTarget as HTMLDivElement;
                    element.style.cursor = 'grab';
                  }}
                >
                  <img
                    className={`relative ${cat.width} ${cat.height} object-contain pointer-events-none`}
                    alt={cat.alt}
                    src={cat.src}
                    draggable={false}
                  />
                  
                  {/* 选中指示器 */}
                  {selectedCat?.id === cat.id && (
                    <div 
                      className="absolute bg-[#f0bc08] rounded-full border-white flex items-center justify-center z-20"
                      style={{
                        top: `${scale(-8)}px`,
                        right: `${scale(-8)}px`,
                        width: `${scale(24)}px`,
                        height: `${scale(24)}px`,
                        borderWidth: `${scale(2)}px`
                      }}
                    >
                      <span 
                        className="text-white font-bold"
                        style={{ fontSize: `${scale(12)}px` }}
                      >
                        ✓
                      </span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 关闭按钮 - 响应式位置 */}
        <Button 
          className="absolute p-0 bg-transparent hover:bg-transparent cursor-pointer transition-all duration-200 hover:scale-105 hover:brightness-110 active:scale-95 focus:outline-none rounded-lg shadow-none"
          style={{
            width: `${scale(110)}px`,
            height: `${scale(51)}px`,
            top: `${scale(520)}px`,
            left: `${scale(223)}px`
          }}
          onClick={handleCloseClick}
        >
          <img
            className="w-full h-full pointer-events-none"
            alt="Close button"
            src="/Close_button.png"
          />
        </Button>

        {/* 开始按钮 - 响应式位置 */}
        <Button 
          className="absolute p-0 bg-transparent hover:bg-transparent cursor-pointer transition-all duration-200 hover:scale-105 hover:brightness-110 active:scale-95 focus:outline-none rounded-lg shadow-none"
          style={{
            width: `${scale(110)}px`,
            height: `${scale(51)}px`,
            top: `${scale(520)}px`,
            left: `${scale(383)}px`
          }}
          onClick={handleStartClick}
        >
          <img
            className="w-full h-full pointer-events-none"
            alt="Start button"
            src="/Button_Start.png"
          />
        </Button>

        {/* 标题图片 - 响应式位置 */}
        <div 
          className="absolute"
          style={{
            width: `${scale(412)}px`,
            top: `${scale(12)}px`,
            left: `${scale(135)}px`
          }}
        >
          <img
            className="w-full h-auto object-contain"
            alt="Drag your cat onto the map"
            src="/Title_ChooseYouCat.png"
            onError={(e) => {
              // 如果图片加载失败，显示文字标题作为备用
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const textElement = target.nextElementSibling as HTMLElement;
              if (textElement) {
                textElement.style.display = 'block';
              }
            }}
          />
          {/* 备用文字标题 */}
          <h1 
            className="hidden text-[#f0bc08] font-normal text-center tracking-[0] silkscreen-bold"
            style={{ 
              WebkitTextStroke: `${scale(4.2)}px #000000`,
              fontSize: `${scale(38)}px`,
              lineHeight: `${scale(30)}px`
            }}
          >
            DRAG YOUR CAT ONTO THE MAP
          </h1>
        </div>
      </div>

      {/* 全局拖拽中的猫咪 */}
      {dragState.isDragging && dragState.draggedCat && (
        <div
          className="fixed pointer-events-none z-[9999] will-change-transform"
          style={{
            top: `${mousePosition.y - dragState.offsetY}px`,
            left: `${mousePosition.x - dragState.offsetX}px`,
          }}
        >
          <img
            className="object-cover opacity-80 pointer-events-none"
            alt={dragState.draggedCat.alt}
            src={dragState.draggedCat.src}
            style={{
              width: `${scale(48)}px`,
              height: `${scale(48)}px`
            }}
            draggable={false}
          />
        </div>
      )}
    </div>
  );
};