// ============================================
// LocalWork — Server Entry Point
// ============================================
import app from './app';
import { env } from './config/env';

const server = app.listen(env.port, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║       🟢  LocalWork API Server       ║');
  console.log('  ╠══════════════════════════════════════╣');
  console.log(`  ║  Puerto:     ${String(env.port).padEnd(23)} ║`);
  console.log(`  ║  Entorno:    ${env.nodeEnv.padEnd(23)} ║`);
  console.log(`  ║  URL:        http://localhost:${String(env.port).padEnd(8)} ║`);
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('\n🔴 Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});
