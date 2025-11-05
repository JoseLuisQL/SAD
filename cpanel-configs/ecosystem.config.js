/**
 * Configuración de PM2 para aplicaciones SAD
 * Uso: pm2 start ecosystem.config.js
 * 
 * IMPORTANTE: Actualizar las rutas y puertos según tu configuración de cPanel
 */

module.exports = {
  apps: [
    // Backend API
    {
      name: 'sad-backend',
      script: './backend/dist/server.js',
      cwd: '/home/USUARIO/apps/sad',
      instances: 1,
      exec_mode: 'fork',
      
      // Variables de entorno
      env: {
        NODE_ENV: 'production',
        PORT: 49152, // ACTUALIZAR con puerto asignado por cPanel
      },
      
      // Logs
      error_file: './logs/backend/error.log',
      out_file: './logs/backend/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Reinicio automático
      max_memory_restart: '512M',
      min_uptime: '10s',
      max_restarts: 10,
      autorestart: true,
      
      // Watch (solo en desarrollo)
      watch: false,
      
      // Tiempo de espera antes de forzar cierre
      kill_timeout: 5000,
      
      // Tiempo de espera antes de considerar app iniciada
      listen_timeout: 10000,
    },
    
    // Frontend Next.js
    {
      name: 'sad-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/home/USUARIO/apps/sad/frontend',
      instances: 1,
      exec_mode: 'fork',
      
      // Variables de entorno
      env: {
        NODE_ENV: 'production',
        PORT: 49153, // ACTUALIZAR con puerto asignado por cPanel
      },
      
      // Logs
      error_file: '/home/USUARIO/apps/sad/logs/frontend/error.log',
      out_file: '/home/USUARIO/apps/sad/logs/frontend/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Reinicio automático
      max_memory_restart: '512M',
      min_uptime: '10s',
      max_restarts: 10,
      autorestart: true,
      
      // Watch
      watch: false,
      
      // Tiempos de espera
      kill_timeout: 5000,
      listen_timeout: 10000,
    },
  ],
  
  // Configuración de despliegue (opcional)
  deploy: {
    production: {
      user: 'USUARIO',
      host: 'archivos.risvirgendecocharcas.gob.pe',
      ref: 'origin/main',
      repo: 'git@github.com:USUARIO/sad.git',
      path: '/home/USUARIO/apps/sad',
      'post-deploy': 'npm ci && npm run build:prod && pm2 reload ecosystem.config.js --env production',
    },
  },
};
