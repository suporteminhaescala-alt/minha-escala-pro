import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: {
    outDir: 'dist'
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/ramcjxqpsiyqeatuunig\.supabase\.co\/.*/i,
            handler: 'NetworkOnly',
            options: {
              cacheName: 'supabase-bypass'
            }
          }
        ]
      }
    })
  ]
});
