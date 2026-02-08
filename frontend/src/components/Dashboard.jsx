import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, clientesService, solicitudesService, ordenesService, inventarioService, auditoriaService } from '../utils/api';
import '../css/dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [modulo, setModulo] = useState('clientes');
  const [clientes, setClientes] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [auditoria, setAuditoria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = authService.getUser();
    if (!user) {
      navigate('/login');
      return;
    }
    setUsuario(user);
    cargarDatos();
  }, [navigate]);

  const cargarDatos = async () => {
    setLoading(true);
    setError('');
    try {
      const [clientesRes, solicitudesRes, ordenesRes, inventarioRes, auditoriaRes] = await Promise.all([
        clientesService.obtenerTodos(),
        solicitudesService.obtenerTodos(),
        ordenesService.obtenerTodos(),
        inventarioService.obtenerTodos(),
        auditoriaService.obtenerTodos()
      ]);

      setClientes(clientesRes.data);
      setSolicitudes(solicitudesRes.data);
      setOrdenes(ordenesRes.data);
      setInventario(inventarioRes.data);
      setAuditoria(auditoriaRes.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('Error al cargar los datos. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (!usuario) return <div>Cargando...</div>;

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>ERP</h2>
          <p className="user-info">
            <strong>{usuario.nombre}</strong>
            <br />
            Rol: {usuario.rol}
          </p>
        </div>

        <nav className="modules-menu">
          <h3>Módulos</h3>
          <ul>
            <li
              onClick={() => setModulo('clientes')}
              className={modulo === 'clientes' ? 'active' : ''}
            >
              👥 Clientes
            </li>
            <li
              onClick={() => setModulo('solicitudes')}
              className={modulo === 'solicitudes' ? 'active' : ''}
            >
              📋 Solicitudes
            </li>
            <li
              onClick={() => setModulo('ordenes')}
              className={modulo === 'ordenes' ? 'active' : ''}
            >
              📦 Órdenes
            </li>
            <li
              onClick={() => setModulo('inventario')}
              className={modulo === 'inventario' ? 'active' : ''}
            >
              📊 Inventario
            </li>
            <li
              onClick={() => setModulo('auditoria')}
              className={modulo === 'auditoria' ? 'active' : ''}
            >
              📈 Auditoría
            </li>
          </ul>
        </nav>

        <button className="btn-logout" onClick={handleLogout}>
          🚪 Cerrar Sesión
        </button>
      </aside>

      {/* Main Content */}
      <main className="content">
        <header className="content-header">
          <h1>{modulo.charAt(0).toUpperCase() + modulo.slice(1)}</h1>
        </header>

        {loading ? (
          <div className="loading">Cargando datos...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="table-container">
            {modulo === 'clientes' && (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Documento</th>
                    <th>Ciudad</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente) => (
                    <tr key={cliente.id_cliente}>
                      <td>{cliente.id_cliente}</td>
                      <td>{cliente.nombre}</td>
                      <td>{cliente.numero_documento}</td>
                      <td>{cliente.ciudad}</td>
                      <td>{cliente.telefono}</td>
                      <td>{cliente.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {modulo === 'solicitudes' && (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Solicitud</th>
                    <th>Cliente</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.map((sol) => (
                    <tr key={sol.id_solicitud}>
                      <td>{sol.id_solicitud}</td>
                      <td>{sol.nombre_solicitud}</td>
                      <td>{sol.id_cliente}</td>
                      <td>{sol.estado}</td>
                      <td>{new Date(sol.fecha_creacion).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {modulo === 'ordenes' && (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Solicitud</th>
                    <th>Cliente</th>
                    <th>Técnico</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenes.map((orden) => (
                    <tr key={orden.id_orden}>
                      <td>{orden.id_orden}</td>
                      <td>{orden.nombre_solicitud}</td>
                      <td>{orden.nombre_cliente}</td>
                      <td>{orden.nombre_tecnico}</td>
                      <td>{orden.estado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {modulo === 'inventario' && (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Cantidad</th>
                    <th>Categoría</th>
                  </tr>
                </thead>
                <tbody>
                  {inventario.map((item) => (
                    <tr key={item.id_item}>
                      <td>{item.id_item}</td>
                      <td>{item.nombre}</td>
                      <td>{item.cantidad_disponible}</td>
                      <td>{item.categoria}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {modulo === 'auditoria' && (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Operación</th>
                    <th>Tabla</th>
                    <th>Usuario</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {auditoria.map((audit) => (
                    <tr key={audit.id_auditoria}>
                      <td>{audit.id_auditoria}</td>
                      <td>{audit.tipo_operacion}</td>
                      <td>{audit.tabla_afectada}</td>
                      <td>{audit.usuario_nombre}</td>
                      <td>{new Date(audit.fecha_operacion).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
