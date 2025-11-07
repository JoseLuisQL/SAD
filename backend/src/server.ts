import app from './app';
import dotenv from 'dotenv';
import os from 'os';

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost');

const getLocalIP = (): string => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

const server = app.listen(PORT, HOST, () => {
  const localIP = getLocalIP();
  console.log('===========================================');
  console.log('  SISTEMA INTEGRADO DE ARCHIVOS DIGITALES');
  console.log('  DISA CHINCHEROS');
  console.log('===========================================');
  console.log(`✓ Servidor corriendo en puerto ${PORT}`);
  console.log(`✓ Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ Host: ${HOST}`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`✓ URL Local: http://localhost:${PORT}`);
    console.log(`✓ URL Red: http://${localIP}:${PORT}`);
    console.log(`✓ Health Check: http://${localIP}:${PORT}/api/health`);
  } else {
    console.log(`✓ URL: http://localhost:${PORT}`);
    console.log(`✓ Health Check: http://localhost:${PORT}/api/health`);
  }
  console.log('===========================================');
});

// Manejo de errores del servidor
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Error: El puerto ${PORT} ya está en uso`);
  } else {
    console.error('❌ Error del servidor:', error);
  }
  process.exit(1);
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido. Cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT recibido. Cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado correctamente');
    process.exit(0);
  });
});

export default server;
