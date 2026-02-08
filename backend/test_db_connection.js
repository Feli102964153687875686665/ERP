const db = require('./src/config/database');

(async () => {
  const ok = await db.testConnection();
  if (ok) {
    console.log('CONEXIÓN OK');
    process.exit(0);
  } else {
    console.error('CONEXIÓN FALLIDA');
    process.exit(1);
  }
})();
