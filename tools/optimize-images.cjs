#!/usr/bin/env node

/**
 * 图片优化自动化脚本
 * 自动压缩项目中的图片文件，提升载入性能
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 配置
const CONFIG = {
  inputDir: path.join(__dirname, '../src/client/public'),
  outputDir: path.join(__dirname, '../src/client/public/optimized'),
  
  // 压缩质量设置
  quality: {
    webp: 85,
    png: 90,
    jpeg: 85
  },
  
  // 大文件阈值（100KB）
  largeFileThreshold: 100 * 1024,
  
  // 需要压缩的文件类型
  supportedFormats: ['.png', '.jpg', '.jpeg'],
  
  // 高优先级文件（需要额外压缩）
  highPriorityFiles: [
    'instructions-title.png',
    'title-bubbletrouble.png',
    'background-5.png',
    'bg-tutorial.png',
    'background-2.png',
    'background-4.png',
    'background-1.png',
    'bg-main.png'
  ]
};

class ImageOptimizer {
  constructor() {
    this.stats = {
      processed: 0,
      originalSize: 0,
      optimizedSize: 0,
      errors: []
    };
  }

  async init() {
    console.log('🖼️  图片优化工具启动...\n');
    
    // 确保输出目录存在
    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
      console.log(`📁 创建输出目录: ${CONFIG.outputDir}`);
    }

    await this.processDirectory(CONFIG.inputDir);
    this.printSummary();
  }

  async processDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // 跳过子目录
        continue;
      }
      
      if (this.shouldOptimize(file, stat.size)) {
        await this.optimizeImage(filePath, file, stat.size);
      }
    }
  }

  shouldOptimize(filename, fileSize) {
    const ext = path.extname(filename).toLowerCase();
    
    // 检查文件格式
    if (!CONFIG.supportedFormats.includes(ext)) {
      return false;
    }
    
    // 高优先级文件总是压缩
    if (CONFIG.highPriorityFiles.includes(filename)) {
      return true;
    }
    
    // 大文件需要压缩
    return fileSize > CONFIG.largeFileThreshold;
  }

  async optimizeImage(inputPath, filename, originalSize) {
    const outputPath = path.join(CONFIG.outputDir, filename);
    const webpPath = path.join(CONFIG.outputDir, filename.replace(/\.[^.]+$/, '.webp'));
    
    try {
      console.log(`🔄 处理: ${filename} (${this.formatSize(originalSize)})`);
      
      const image = sharp(inputPath);
      const metadata = await image.metadata();
      
      // 生成优化后的PNG/JPEG
      if (filename.endsWith('.png')) {
        await image
          .png({ quality: CONFIG.quality.png, compressionLevel: 9 })
          .toFile(outputPath);
      } else {
        await image
          .jpeg({ quality: CONFIG.quality.jpeg, progressive: true })
          .toFile(outputPath);
      }
      
      // 生成WebP版本
      await image
        .webp({ quality: CONFIG.quality.webp })
        .toFile(webpPath);
      
      // 统计压缩效果
      const optimizedSize = fs.statSync(outputPath).size;
      const webpSize = fs.statSync(webpPath).size;
      
      this.stats.processed++;
      this.stats.originalSize += originalSize;
      this.stats.optimizedSize += Math.min(optimizedSize, webpSize);
      
      const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
      const webpSavings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);
      
      console.log(`  ✅ PNG: ${this.formatSize(optimizedSize)} (-${savings}%)`);
      console.log(`  ✅ WebP: ${this.formatSize(webpSize)} (-${webpSavings}%)`);
      
    } catch (error) {
      console.error(`  ❌ 处理失败: ${error.message}`);
      this.stats.errors.push({ filename, error: error.message });
    }
    
    console.log('');
  }

  formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  printSummary() {
    console.log('📊 优化完成统计:');
    console.log('─'.repeat(50));
    console.log(`处理文件数: ${this.stats.processed}`);
    console.log(`原始总大小: ${this.formatSize(this.stats.originalSize)}`);
    console.log(`优化后大小: ${this.formatSize(this.stats.optimizedSize)}`);
    
    const totalSavings = this.stats.originalSize - this.stats.optimizedSize;
    const savingsPercent = ((totalSavings / this.stats.originalSize) * 100).toFixed(1);
    
    console.log(`节省空间: ${this.formatSize(totalSavings)} (${savingsPercent}%)`);
    
    if (this.stats.errors.length > 0) {
      console.log(`\n❌ 错误数量: ${this.stats.errors.length}`);
      this.stats.errors.forEach(({ filename, error }) => {
        console.log(`  - ${filename}: ${error}`);
      });
    }
    
    console.log('\n🎉 图片优化完成！');
    console.log('💡 提示：');
    console.log('  1. 检查 optimized/ 目录中的优化图片');
    console.log('  2. 对比原图和优化图的视觉效果');
    console.log('  3. 满意后替换原图片文件');
    console.log('  4. 考虑配置服务器支持WebP格式');
  }
}

// 检查依赖
function checkDependencies() {
  try {
    require('sharp');
    return true;
  } catch (error) {
    console.error('❌ 缺少依赖: sharp');
    console.log('📦 请运行: npm install sharp');
    return false;
  }
}

// 主函数
async function main() {
  if (!checkDependencies()) {
    process.exit(1);
  }
  
  const optimizer = new ImageOptimizer();
  await optimizer.init();
}

// 运行脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = ImageOptimizer; 