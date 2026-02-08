# Despliegue en Render (Backend)

Recomendaciones para desplegar el backend en Render:

- Build Command: (no build necesario) dejar en blanco o `npm install`.
- Start Command: `npm start` (usa `node server.js`).
- Environment (env) variables necesarias:
  - `DATABASE_URL` = URL de conexión completa de Supabase (connection string). Ej: `postgres://user:pass@host:5432/dbname`
  - `JWT_SECRET` = secreto para firmar JWTs
  - `JWT_EXPIRES_IN` = opcional, p.ej. `7d`
  - `FRONTEND_URL` = URL pública del frontend (p.e. `https://mi-app.vercel.app`)
  - `NODE_ENV` = `production`
  - `PORT` = opcional (Render provee su propio puerto via env)

- Nota importante sobre SSL y Supabase: cuando uses `DATABASE_URL` con Supabase, el código ya establece `ssl: { rejectUnauthorized: false }` para el `pg.Pool`.

- Recomendaciones para evitar errores comunes:
  - Asegúrate de que `DATABASE_URL` sea la connection string (no solo host/usuario).
  - Configura `JWT_SECRET` en Render antes de desplegar para evitar errores de autenticación.
  - Habilita `NODE_ENV=production`.
  - Si usas CORS, configura `FRONTEND_URL` con la URL exacta que usará Vercel.

- Health check: la app expone `/health` que devuelve el estado de la DB. Úsalo para verificar la app y la conexión a la DB.

