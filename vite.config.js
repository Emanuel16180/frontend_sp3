import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Acepta conexiones desde cualquier dominio (como bienestar.localhost)
    port: 5174, // Puerto fijo para consistencia
    hmr: {
      // Le dice al cliente de HMR que siempre se conecte a localhost
      host: 'localhost',
      protocol: 'ws',
    },
    allowedHosts: [
      'psicoadmin.xyz',
      'bienestar.psicoadmin.xyz',
      'mindcare.psicoadmin.xyz'
    ]
  },
})
