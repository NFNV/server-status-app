import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const DEV_PROXY_PATH = '/__status_api'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const rawBaseUrl = env.VITE_STATUS_API_BASE_URL || 'http://127.0.0.1:8080'
  const target = normalizeBaseUrl(rawBaseUrl)
  const proxy = isAbsoluteUrl(target)
    ? {
        [DEV_PROXY_PATH]: {
          target,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(new RegExp(`^${DEV_PROXY_PATH}`), ''),
        },
      }
    : undefined

  return {
    plugins: [react()],
    server: proxy ? { proxy } : undefined,
  }
})

function normalizeBaseUrl(url) {
  return url.replace(/\/+$/, '')
}

function isAbsoluteUrl(url) {
  return /^https?:\/\//i.test(url)
}
