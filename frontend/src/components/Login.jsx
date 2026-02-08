import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../utils/api';
import '../css/login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validar campos
    if (!email || !password) {
      setError('Por favor completa email y contraseña');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.login(email, password);
      const { token, usuario } = response.data;

      console.log('✅ JWT recibido del servidor');
      console.log('👤 Usuario autenticado:', usuario);
      console.log('🔐 Token guardado en localStorage');

      // Guardar token y usuario
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));

      // Redirigir al dashboard
      navigate('/dashboard');
    } catch (err) {
      setError('Credenciales inválidas. Intenta de nuevo.');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>ERP Mantenimiento</h1>
          <p>Sistema de Gestión Integrado</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              placeholder="ejemplo@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? (
              <>
                <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: '8px' }}>⏳</span>
                Verificando credenciales...
              </>
            ) : 'Iniciar Sesión'}
          </button>

          <div className="login-demo">
            <p>📧 Datos de prueba:</p>
            <small>👤 Admin: admin@erp.com / 123456</small>
            <br />
            <small>🔧 Técnico: tecnico@erp.com / 123456</small>
            <br />
            <small>📋 Coordinador: coordinador@erp.com / 123456</small>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
