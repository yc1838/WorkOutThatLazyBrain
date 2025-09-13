import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // 测试环境配置
    environment: 'node',
    
    // 测试文件匹配模式
    include: ['src/**/*.{test,spec}.{js,ts}'],
    
    // 排除的文件
    exclude: ['node_modules', 'dist', '.git'],
    
    // 显示测试覆盖率
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'src/**/*.d.ts',
        'src/**/*.test.ts',
        'src/**/*.spec.ts'
      ]
    },
    
    // 全局设置
    globals: true
  },
  
  // 路径解析配置
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
});
