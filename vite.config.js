import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },

  server: {
    proxy: {
      '/api/v1': {
        target: 'https://todo-list.edu-playground.ru',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🚀 [VITE PROXY] Получил запрос от клиента:')
            console.log('   Метод:', req.method)
            console.log('   URL:', req.url)
            const headers = req.headers

            if (headers.authorization) {
              console.log('   🔑 Передаю Authorization заголовок')
              console.log(
                '   🔑 Первые 30 символов:',
                headers.authorization.substring(0, 30) + '...'
              )
              proxyReq.setHeader('Authorization', headers.authorization)
            } else {
              console.log('   ⚠️ Клиент не отправил Authorization заголовок')
            }

            if (headers['content-type']) {
              proxyReq.setHeader('Content-Type', headers['content-type'])
            }

            if (headers.accept) {
              proxyReq.setHeader('Accept', headers.accept)
            }

            proxyReq.setHeader('Host', 'todo-list.edu-playground.ru')

            console.log('   📤 Отправляю запрос на:', options.target + req.url)
          })

          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('📨 [VITE PROXY] Получил ответ от сервера:')
            console.log('   Статус:', proxyRes.statusCode)
            console.log('   URL:', req.url)

            proxyRes.headers['Access-Control-Allow-Origin'] = '*'
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            proxyRes.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, Accept'
            proxyRes.headers['Access-Control-Allow-Credentials'] = 'true'

            console.log('   📋 Заголовки ответа от сервера:', {
              'content-type': proxyRes.headers['content-type'],
              authorization: proxyRes.headers['authorization'] ? 'ЕСТЬ' : 'НЕТ'
            })
          })

          proxy.on('error', (err, req, res) => {
            console.error('💥 [VITE PROXY] Ошибка прокси:', err.message)
            res.writeHead(500, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            })
            res.end(
              JSON.stringify({
                error: 'Proxy error',
                message: err.message,
                details: 'Прокси не смог передать запрос'
              })
            )
          })
        }
      }
    },

    cors: {
      origin: '*',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    }
  }
})
