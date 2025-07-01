/**
 * 游戏音频管理器
 * 统一管理背景音乐和音效的播放
 */

export type SoundType = 
  // 全局音效 (3个)
  | 'backgroundMusic'       // 全局背景音乐
  | 'buttonClick'           // 按钮点击音效
  | 'gameStartAction'       // 实际开始游戏音效
  
  // 操作音效 (3个)
  | 'tapSound'              // 点按龙头音效
  | 'catMeow'               // 选择猫咪音效
  | 'tutorialComplete'      // 引导结束音效
  
  // 界面音效 (2个)
  | 'gameCompletion'        // 结算页音效
  | 'leaderboard'           // 排行榜音效
  
  // 游戏机制音效 (12个)
  | 'giftDrop'              // 机制5-物品掉落音效
  | 'giftCaught'            // 机制5-获得正面物品(橡皮鸭、鱼)
  | 'giftMissed'            // 机制5-获得负面物品(梳子、水垢怪、闹钟)
  | 'difficultyUp'          // 难度提升音效
  | 'bubbleTime'            // 泡泡模式音效
  | 'electricStart'         // 漏电干扰音效
  | 'gameFailure'           // 游戏失败音效
  | 'controlsReversed'      // 操控反转音效
  | 'surpriseDrop'          // 惊喜掉落音效
  | 'coldWind'              // 冷风干扰音效

interface AudioFile {
  path: string;
  audio: HTMLAudioElement | null;
  isLoaded: boolean;
  isLoop: boolean;
  volume: number;
}

class AudioManager {
  private audioFiles: Map<SoundType, AudioFile> = new Map();
  private isMuted = false;
  private masterVolume = 0.7;
  private hasUserInteracted = false; // 用户是否已经有过交互
  private pendingAutoplayMusic = false; // 是否有待播放的背景音乐

  constructor() {
    this.initializeAudioFiles();
    this.setupUserInteractionListeners();
  }

  private initializeAudioFiles() {
    const audioConfig: Record<SoundType, { path: string; isLoop: boolean; volume: number }> = {
      // 全局音效
      backgroundMusic: { path: '/music/Pixel Purrfection (Remix).mp3', isLoop: true, volume: 0.4 },
      buttonClick: { path: '/music/(game-start-317318.mp3', isLoop: false, volume: 0.7 },
      
      // 操作音效
      gameStartAction: { path: '/music/mixkit-winning-a-coin-video-game-2069.wav', isLoop: false, volume: 0.8 },
      catMeow: { path: '/music/cat-meow-loud-225307.mp3', isLoop: false, volume: 0.8 },
      tapSound: { path: '/music/plopp-84863.mp3', isLoop: false, volume: 0.6 },
      
      // 界面音效
      tutorialComplete: { path: '/music/mixkit-wind-chimes-2014.wav', isLoop: false, volume: 0.6 },
      difficultyUp: { path: '/music/mixkit-boss-fight-arcade-232.wav', isLoop: false, volume: 0.7 },
      gameFailure: { path: '/music/mixkit-player-losing-or-failing-2042.wav', isLoop: false, volume: 0.8 },
      gameCompletion: { path: '/music/mixkit-final-level-bonus-2061.wav', isLoop: false, volume: 0.8 },
      leaderboard: { path: '/music/mixkit-game-level-completed-2059.wav', isLoop: false, volume: 0.8 },
      
      // 游戏机制音效
      electricStart: { path: '/music/electric-fence-buzzing-2967.wav', isLoop: false, volume: 0.7 },
      controlsReversed: { path: '/music/mixkit-clown-horn-at-circus-715.wav', isLoop: false, volume: 0.7 },
      bubbleTime: { path: '/music/cartoon-bubbles-pop-729.wav', isLoop: false, volume: 0.6 },
      giftDrop: { path: '/music/(game-start-317318.mp3', isLoop: false, volume: 0.6 },
      giftCaught: { path: '/music/mixkit-fairy-glitter-867.wav', isLoop: false, volume: 0.7 },
      giftMissed: { path: '/music/mixkit-game-show-wrong-answer-buzz-950.wav', isLoop: false, volume: 0.7 },
      surpriseDrop: { path: '/music/mixkit-final-level-bonus-2061.wav', isLoop: false, volume: 0.7 },
      coldWind: { path: '/music/mixkit-wind-blowing-papers-2652.wav', isLoop: false, volume: 0.7 }
    };

    Object.entries(audioConfig).forEach(([key, config]) => {
      this.audioFiles.set(key as SoundType, {
        path: config.path,
        audio: null,
        isLoaded: false,
        isLoop: config.isLoop,
        volume: config.volume
      });
    });
  }

  /**
   * 设置用户交互监听器
   * 用于处理自动播放失败的情况
   */
  private setupUserInteractionListeners(): void {
    if (typeof window === 'undefined') return;

    const handleFirstInteraction = () => {
      this.hasUserInteracted = true;
      
      // 如果有待播放的背景音乐，立即播放
      if (this.pendingAutoplayMusic && !this.isMuted) {
        console.log('🎵 用户首次交互，尝试播放背景音乐');
        this.playSound('backgroundMusic').catch(error => {
          console.warn('用户交互后背景音乐播放仍然失败:', error);
        });
        this.pendingAutoplayMusic = false;
      }
      
      // 移除监听器，因为只需要处理首次交互
      this.removeUserInteractionListeners();
    };

    // 监听多种用户交互事件
    const events = ['click', 'touchstart', 'keydown', 'mousedown'];
    events.forEach(event => {
      document.addEventListener(event, handleFirstInteraction, { once: true, passive: true });
    });

    // 存储清理函数
    this.removeUserInteractionListeners = () => {
      events.forEach(event => {
        document.removeEventListener(event, handleFirstInteraction);
      });
    };
  }

  /**
   * 移除用户交互监听器的清理函数
   */
  private removeUserInteractionListeners: () => void = () => {};

  /**
   * 预加载音频文件
   */
  async preloadAudio(soundEffect: SoundType): Promise<void> {
    const audioFile = this.audioFiles.get(soundEffect);
    if (!audioFile || audioFile.isLoaded) return;

    return new Promise((resolve, reject) => {
      const audio = new Audio(audioFile.path);
      audio.loop = audioFile.isLoop;
      audio.volume = audioFile.volume * this.masterVolume;
      
      const onLoad = () => {
        audioFile.audio = audio;
        audioFile.isLoaded = true;
        audio.removeEventListener('canplaythrough', onLoad);
        audio.removeEventListener('error', onError);
        resolve();
      };

      const onError = () => {
        console.warn(`Failed to load audio: ${audioFile.path}`);
        audio.removeEventListener('canplaythrough', onLoad);
        audio.removeEventListener('error', onError);
        resolve(); // 即使失败也resolve，避免阻塞
      };

      audio.addEventListener('canplaythrough', onLoad);
      audio.addEventListener('error', onError);
      audio.load();
    });
  }

  /**
   * 预加载所有音频文件
   */
  async preloadAllAudio(): Promise<void> {
    const promises = Array.from(this.audioFiles.keys()).map(key => 
      this.preloadAudio(key)
    );
    await Promise.all(promises);
  }

  /**
   * 播放音效
   */
  async playSound(soundEffect: SoundType): Promise<void> {
    if (this.isMuted) return;

    const audioFile = this.audioFiles.get(soundEffect);
    if (!audioFile) return;

    // 如果音频未加载，先加载
    if (!audioFile.isLoaded) {
      await this.preloadAudio(soundEffect);
    }

    const { audio } = audioFile;
    if (!audio) return;

    try {
      // 重置音频到开始位置（除了循环音乐）
      if (!audioFile.isLoop) {
        audio.currentTime = 0;
      }
      
      await audio.play();
      
      // 如果成功播放，标记用户已经有交互（或者浏览器允许自动播放）
      if (!this.hasUserInteracted) {
        this.hasUserInteracted = true;
        this.removeUserInteractionListeners();
      }
    } catch (error) {
      // 处理自动播放失败的情况
      if (error instanceof Error && error.name === 'NotAllowedError') {
        console.warn(`🔇 自动播放被阻止: ${soundEffect}, 等待用户交互`);
        
        // 如果是背景音乐，标记为待播放
        if (soundEffect === 'backgroundMusic') {
          this.pendingAutoplayMusic = true;
          console.log('🎵 背景音乐将在用户首次交互后播放');
        }
      } else {
        console.warn(`Failed to play audio: ${soundEffect}`, error);
      }
    }
  }

  /**
   * 停止音效
   */
  stopSound(soundEffect: SoundType): void {
    const audioFile = this.audioFiles.get(soundEffect);
    if (!audioFile?.audio) return;

    audioFile.audio.pause();
    audioFile.audio.currentTime = 0;
  }

  /**
   * 停止所有音效
   */
  stopAllSounds(): void {
    this.audioFiles.forEach((audioFile) => {
      if (audioFile.audio) {
        audioFile.audio.pause();
        audioFile.audio.currentTime = 0;
      }
    });
  }

  /**
   * 设置静音状态
   */
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    
    if (muted) {
      this.stopAllSounds();
      this.pendingAutoplayMusic = false; // 清除待播放标记
    } else {
      // 如果取消静音，尝试播放背景音乐
      if (this.hasUserInteracted) {
        // 用户已有交互，直接播放
        this.startBackgroundMusic();
      } else {
        // 用户还没有交互，标记为待播放
        this.pendingAutoplayMusic = true;
        console.log('🎵 取消静音，背景音乐将在用户交互后播放');
      }
    }
  }

  /**
   * 获取静音状态
   */
  isMutedState(): boolean {
    return this.isMuted;
  }

  /**
   * 设置主音量
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    
    // 更新所有音频的音量
    this.audioFiles.forEach((audioFile) => {
      if (audioFile.audio) {
        audioFile.audio.volume = audioFile.volume * this.masterVolume;
      }
    });
  }

  /**
   * 开始播放背景音乐
   */
  async startBackgroundMusic(): Promise<void> {
    if (this.isMuted) {
      console.log('🔇 音乐已静音，跳过背景音乐播放');
      return;
    }

    // 先停止当前播放的背景音乐
    this.stopBackgroundMusic();
    
    try {
      console.log('🎵 开始播放背景音乐: Pixel Purrfection (Remix)');
      await this.playSound('backgroundMusic');
      
      // 确保音乐循环播放
      const audioFile = this.audioFiles.get('backgroundMusic');
      if (audioFile?.audio) {
        audioFile.audio.loop = true;
        audioFile.audio.volume = audioFile.volume * this.masterVolume;
        
        // 添加音乐结束监听器，以防循环失败
        audioFile.audio.addEventListener('ended', () => {
          console.log('🔁 背景音乐结束，重新播放');
          if (!this.isMuted) {
            this.startBackgroundMusic().catch(error => {
              console.warn('🚫 背景音乐重新播放失败:', error);
            });
          }
        });
        
        console.log('✅ 背景音乐循环播放已设置');
      }
    } catch (error) {
      console.warn('🚫 背景音乐播放失败:', error);
    }
  }

  /**
   * 停止背景音乐
   */
  stopBackgroundMusic(): void {
    this.stopSound('backgroundMusic');
  }

  /**
   * 检查背景音乐是否正在播放
   */
  isBackgroundMusicPlaying(): boolean {
    const bgMusic = this.audioFiles.get('backgroundMusic');
    return bgMusic?.audio ? !bgMusic.audio.paused : false;
  }

  /**
   * 检查是否有待播放的背景音乐
   */
  hasPendingAutoplayMusic(): boolean {
    return this.pendingAutoplayMusic;
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.removeUserInteractionListeners();
    this.stopAllSounds();
  }
}

// 创建全局音频管理器实例
export const audioManager = new AudioManager();

// 页面加载时预加载音频
if (typeof window !== 'undefined') {
  // 延迟预加载，避免阻塞页面渲染
  setTimeout(() => {
    audioManager.preloadAllAudio().catch(console.warn);
  }, 1000);
} 