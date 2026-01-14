import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // No proxy needed - frontend connects directly to the VM backend API
  // The backend URL is configured via VITE_STATUS_API_BASE_URL environment variable
})
