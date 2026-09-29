import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { authApiPlugin } from './server/auth-api.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), authApiPlugin()],
})
