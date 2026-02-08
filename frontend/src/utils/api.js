import axios from 'axios';

// Usar variable de entorno en producción (REACT_APP_API_URL).
// Ej: REACT_APP_API_URL=https://mi-backend.onrender.com/api
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  maxRedirects: 5,
  maxContentLength: 1048576,
  maxBodyLength: 1048576
});

// Interceptor para agregar token a todas las solicitudes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Limpiar headers previos
      if (config.headers.Authorization) {
        delete config.headers.Authorization;
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  login: (email, password) =>
    api.post('/usuarios/auth/login', { email, password }),
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  },

  getUser: () => JSON.parse(localStorage.getItem('usuario')),
  getToken: () => localStorage.getItem('token')
};

// Servicios de clientes
export const clientesService = {
  obtenerTodos: () => api.get('/clientes'),
  obtenerPorId: (id) => api.get(`/clientes/${id}`),
  crear: (data) => api.post('/clientes', data),
  actualizar: (id, data) => api.put(`/clientes/${id}`, data),
  eliminar: (id) => api.delete(`/clientes/${id}`)
};

// Servicios de solicitudes
export const solicitudesService = {
  obtenerTodos: () => api.get('/solicitudes'),
  obtenerPorId: (id) => api.get(`/solicitudes/${id}`),
  crear: (data) => api.post('/solicitudes', data),
  actualizar: (id, data) => api.put(`/solicitudes/${id}`, data),
  eliminar: (id) => api.delete(`/solicitudes/${id}`)
};

// Servicios de órdenes
export const ordenesService = {
  obtenerTodos: () => api.get('/ordenes'),
  obtenerPorId: (id) => api.get(`/ordenes/${id}`),
  crear: (data) => api.post('/ordenes', data),
  actualizar: (id, data) => api.put(`/ordenes/${id}`, data),
  eliminar: (id) => api.delete(`/ordenes/${id}`)
};

// Servicios de inventario
export const inventarioService = {
  obtenerTodos: () => api.get('/inventario'),
  obtenerPorId: (id) => api.get(`/inventario/${id}`),
  crear: (data) => api.post('/inventario', data),
  actualizar: (id, data) => api.put(`/inventario/${id}`, data),
  eliminar: (id) => api.delete(`/inventario/${id}`)
};

// Servicios de auditoría
export const auditoriaService = {
  obtenerTodos: () => api.get('/auditoria')
};

// Servicios de usuarios
export const usuariosService = {
  obtenerTodos: () => api.get('/usuarios'),
  obtenerTecnicosActivos: () => api.get('/usuarios/tecnicos/activos'),
  obtenerPorId: (id) => api.get(`/usuarios/${id}`),
  crear: (data) => api.post('/usuarios', data),
  actualizar: (id, data) => api.put(`/usuarios/${id}`, data),
  eliminar: (id) => api.delete(`/usuarios/${id}`)
};

export default api;
