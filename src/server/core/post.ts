/**
 * Post management system for Bubble_Trouble
 * - Handles initialization and configuration of new game posts
 * - Manages post-specific Redis data
 * 
 * @author Assistant
 */

import { Context } from '@devvit/public-api';
import { RedisClient } from '@devvit/redis';

// ==================== Redis 键名常量 ====================
const getPostConfigKey = (postId: string) => `post_config:${postId}`;
const getPostStatsKey = (postId: string) => `post_stats:${postId}`;

// ==================== 数据结构定义 ====================

export interface PostConfig {
  postId: string;
  createdAt: number;
  gameType: string;
  isActive: boolean;
}

export interface PostStats {
  totalPlays: number;
  uniquePlayers: number;
  lastPlayedAt: number;
}

// ==================== 核心功能 ====================

/**
 * 初始化新创建的游戏帖子配置
 * - 设置帖子的基本配置信息
 * - 初始化统计数据
 * - 标记帖子为活跃状态
 */
export async function postConfigNew({
  redis,
  postId,
}: {
  redis: Context['redis'] | RedisClient;
  postId: string;
}): Promise<void> {
  if (!postId) {
    throw new Error('Post ID is required for post configuration.');
  }

  const configKey = getPostConfigKey(postId);
  const statsKey = getPostStatsKey(postId);

  // 1. 设置帖子配置
  const postConfig: PostConfig = {
    postId,
    createdAt: Date.now(),
    gameType: 'cat_comfort_game',
    isActive: true,
  };

  await redis.hset(configKey, {
    postId,
    createdAt: postConfig.createdAt.toString(),
    gameType: postConfig.gameType,
    isActive: postConfig.isActive.toString(),
  });

  // 2. 初始化统计数据
  const initialStats: PostStats = {
    totalPlays: 0,
    uniquePlayers: 0,
    lastPlayedAt: 0,
  };

  await redis.hset(statsKey, {
    totalPlays: initialStats.totalPlays.toString(),
    uniquePlayers: initialStats.uniquePlayers.toString(),
    lastPlayedAt: initialStats.lastPlayedAt.toString(),
  });

  console.log(`✅ Post configuration initialized for post: ${postId}`);
}

/**
 * 获取帖子配置信息
 */
export async function getPostConfig({
  redis,
  postId,
}: {
  redis: Context['redis'] | RedisClient;
  postId: string;
}): Promise<PostConfig | null> {
  const configKey = getPostConfigKey(postId);
  const configData = await redis.hgetall(configKey);

  if (!configData || Object.keys(configData).length === 0 || !configData.postId) {
    return null;
  }

  return {
    postId: configData.postId,
    createdAt: parseInt(configData.createdAt || '0'),
    gameType: configData.gameType || 'cat_comfort_game',
    isActive: (configData.isActive || 'false') === 'true',
  };
}

/**
 * 更新帖子统计数据
 */
export async function updatePostStats({
  redis,
  postId,
  playerId,
}: {
  redis: Context['redis'] | RedisClient;
  postId: string;
  playerId: string;
}): Promise<void> {
  const statsKey = getPostStatsKey(postId);
  const playerHashKey = `post_players:${postId}`;

  // 增加总游戏次数
  await redis.hincrby(statsKey, 'totalPlays', 1);

  // 检查是否是新玩家 (使用 hget 检查是否存在)
  const existingPlayer = await redis.hget(playerHashKey, playerId);
  if (!existingPlayer) {
    // 新玩家，记录并增加计数
    await redis.hset(playerHashKey, { [playerId]: Date.now().toString() });
    await redis.hincrby(statsKey, 'uniquePlayers', 1);
  }

  // 更新最后游戏时间
  await redis.hset(statsKey, { lastPlayedAt: Date.now().toString() });
}

/**
 * 获取帖子统计数据
 */
export async function getPostStats({
  redis,
  postId,
}: {
  redis: Context['redis'] | RedisClient;
  postId: string;
}): Promise<PostStats | null> {
  const statsKey = getPostStatsKey(postId);
  const statsData = await redis.hgetall(statsKey);

  if (!statsData || Object.keys(statsData).length === 0) {
    return null;
  }

  return {
    totalPlays: parseInt(statsData.totalPlays || '0') || 0,
    uniquePlayers: parseInt(statsData.uniquePlayers || '0') || 0,
    lastPlayedAt: parseInt(statsData.lastPlayedAt || '0') || 0,
  };
}

/**
 * 禁用帖子 (标记为非活跃状态)
 */
export async function deactivatePost({
  redis,
  postId,
}: {
  redis: Context['redis'] | RedisClient;
  postId: string;
}): Promise<void> {
  const configKey = getPostConfigKey(postId);
  await redis.hset(configKey, { isActive: 'false' });
  console.log(`🔒 Post deactivated: ${postId}`);
} 