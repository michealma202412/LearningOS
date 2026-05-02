import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  // 检查证书文件是否存在
  const certPath = path.resolve(__dirname, 'ssl');
  const certExists = fs.existsSync(path.join(certPath, 'localhost+4.pem'));

  const config: any = {
    plugins: [react()],
    base: '/', // Capacitor 使用根路径
    server: {
      host: true,
      port: 5173
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
          },
        },
      },
    },
  };

  // 只在开发模式且证书存在时启用 HTTPS
  if (command === 'serve' && certExists) {
    config.server.https = {
      key: fs.readFileSync(path.join(certPath, 'localhost+4-key.pem')),
      cert: fs.readFileSync(path.join(certPath, 'localhost+4.pem'))
    };
    console.log('✅ HTTPS 已启用 - Safari 可以正常访问麦克风');
  } else {
    console.log('⚠️  使用 HTTP（Safari 可能无法访问麦克风）');
    console.log('💡 提示: 如需在 Safari 中使用录音功能，请配置 HTTPS');
  }

  return config;
});
