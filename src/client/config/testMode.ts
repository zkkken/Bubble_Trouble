/**
 * 测试模式配置
 * Test Mode Configuration - 完全独立运行，避开 Devvit 设置
 */

export const TEST_MODE = {
  // 强制启用测试模式的条件
  enabled: (() => {
    // 检查是否在开发环境
    const isDev = import.meta.env?.DEV;
    
    // 检查URL参数
    const hasTestParam = typeof window !== 'undefined' && 
      window.location.search.includes('test=true');
    
    // 检查是否在本地开发环境（避开 Devvit 检查）
    const isLocalDev = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1' ||
       window.location.hostname.includes('bolt') ||
       window.location.port === '7474');
    
    // 检查是否通过测试命令启动
    const isTestCommand = typeof window !== 'undefined' &&
      (window.location.pathname.includes('test') || 
       document.title.includes('Test Mode'));
    
    return isDev || hasTestParam || isLocalDev || isTestCommand;
  })(),
  
  // 测试模式下的配置
  config: {
    // 完全跳过后端API调用
    skipBackendCalls: true,
    
    // 使用本地存储模拟数据持久化
    useLocalStorage: true,
    
    // 显示调试信息
    showDebugInfo: true,
    
    // 跳过 Devvit 认证检查
    skipDevvitAuth: true,
    
    // 跳过应用初始化检查
    skipAppInit: true,
    
    // 独立运行模式
    standaloneMode: true,
    
    // Bolt Preview 专用配置
    boltPreviewMode: typeof window !== 'undefined' && 
      (window.location.hostname.includes('bolt') || 
       window.location.port === '7474' ||
       window.location.hostname === 'localhost'),
  }
};

/**
 * 检查是否在测试模式下运行
 */
export const isTestMode = (): boolean => {
  return TEST_MODE.enabled;
};

/**
 * 检查是否在 Bolt Preview 中运行
 */
export const isBoltPreview = (): boolean => {
  return TEST_MODE.config.boltPreviewMode;
};

/**
 * 检查是否在独立模式下运行
 */
export const isStandaloneMode = (): boolean => {
  return TEST_MODE.config.standaloneMode && isTestMode();
};

/**
 * 获取测试模式配置
 */
export const getTestConfig = () => {
  return TEST_MODE.config;
};

/**
 * 在测试模式下显示调试信息
 */
export const debugLog = (message: string, data?: any) => {
  if (isTestMode() && TEST_MODE.config.showDebugInfo) {
    const prefix = isBoltPreview() ? '[BOLT PREVIEW]' : '[TEST MODE]';
    console.log(`${prefix} ${message}`, data || '');
  }
};

/**
 * 初始化测试模式
 */
export const initTestMode = () => {
  if (isTestMode()) {
    const mode = isBoltPreview() ? 'Bolt Preview' : 'Standalone Test Mode';
    console.log(`🧪 Cat Comfort Game - ${mode} Enabled`);
    console.log('🚀 BYPASSING ALL DEVVIT SETUP REQUIREMENTS:');
    console.log('  ✅ No authentication needed');
    console.log('  ✅ No app initialization required');
    console.log('  ✅ No subreddit configuration needed');
    console.log('');
    console.log('📝 Test Mode Features:');
    console.log('  • Complete game functionality');
    console.log('  • Local storage for game state');
    console.log('  • No backend API calls');
    console.log('  • Debug logging enabled');
    console.log('  • All game mechanics work locally');
    console.log('  • Perfect for UI/UX testing');
    console.log('');
    console.log('🎮 Ready to test all game features immediately!');
    
    if (isBoltPreview()) {
      console.log('🚀 Running in Bolt Preview - All features available!');
      console.log('💡 No setup required - just start playing!');
    }
    
    // 设置全局标识，避免任何 Devvit 相关检查
    if (typeof window !== 'undefined') {
      (window as any).__TEST_MODE__ = true;
      (window as any).__SKIP_DEVVIT__ = true;
      (window as any).__STANDALONE_GAME__ = true;
    }
  }
};

/**
 * 检查是否应该跳过 Devvit 相关功能
 */
export const shouldSkipDevvit = (): boolean => {
  return isTestMode() && TEST_MODE.config.skipDevvitAuth;
};