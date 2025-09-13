/**
 * 游戏演示运行脚本
 * 
 * 使用 Node.js 直接运行游戏演示，无需编译
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 启动游戏逻辑演示...\n');

try {
  // 使用 tsx 运行 TypeScript 文件
  const demoPath = path.join(__dirname, '../src/shared/demo/gameDemo.ts');
  execSync(`npx tsx ${demoPath}`, { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
} catch (error) {
  console.error('❌ 演示运行失败:', error.message);
  process.exit(1);
}
