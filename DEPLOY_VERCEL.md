# Despliegue en Vercel (Frontend - Create React App)

Pasos y recomendaciones:

- Build Command: `npm run build`
- Output Directory: `build`
- Variables de entorno (Project > Settings > Environment Variables):
  - `REACT_APP_API_URL` = URL pública del backend + `/api`, p.ej. `https://mi-backend.onrender.com/api`

- Notas:
  - Durante desarrollo se usa `proxy` en `package.json`, pero en producción Vercel sirve la carpeta `build`.
  - Asegúrate de configurar `REACT_APP_API_URL` **antes** de desplegar para que el build incluya la URL correcta.
  - Si tienes problemas de CORS, verifica que en el backend `FRONTEND_URL` coincide con la URL que Vercel muestra para tu proyecto.

