import React, { useState, useEffect } from 'react';
import { authService, usuariosService } from '../utils/api';
import CRUDModal from './CRUDModal';
import IconButton from './IconButton';
import '../css/dashboard.css';
import '../css/modal.css';

const UsersManager = ({ usuario, onLogout }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Campos del formulario de usuario
  const usuariosFields = [
    { name: 'nombre', label: 'Nombre Completo', type: 'text', required: true },
    { name: 'email', label: 'Correo Electrónico', type: 'email', required: true },
    { name: 'password', label: 'Contraseña', type: 'password', required: !editingId },
    { name: 'telefono', label: 'Teléfono', type: 'text', required: true },
    { name: 'rol', label: 'Rol', type: 'select', required: true, options: [
      { value: 'administrador', label: 'Administrador' },
      { value: 'tecnico', label: 'Técnico' },
      { value: 'coordinador', label: 'Coordinador' }
    ]},
    { name: 'departamento', label: 'Departamento', type: 'text', required: false },
    { name: 'activo', label: 'Activo', type: 'select', required: true, options: [
      { value: true, label: 'Sí' },
      { value: false, label: 'No' }
    ]}
  ];

  // Solo administrador puede acceder
  useEffect(() => {
    if (usuario?.rol !== 'administrador') {
      setError('No tienes permiso para acceder a este módulo');
      return;
    }
    cargarUsuarios();
  }, [usuario]);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await usuariosService.obtenerTodos();
      setUsuarios(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar usuarios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingId(null);
    setEditingData(null);
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingId(record.id_usuario);
    setEditingData({ ...record, password: '' });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await usuariosService.eliminar(deleteId);
      setUsuarios(usuarios.filter(u => u.id_usuario !== deleteId));
      setError('');
      setDeleteId(null);
    } catch (err) {
      setError('Error al eliminar usuario');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      setLoading(true);
      
      if (editingId) {
        // No enviar contraseña vacía en edición
        const dataToSend = { ...formData };
        if (!dataToSend.password) {
          delete dataToSend.password;
        }
        await usuariosService.actualizar(editingId, dataToSend);
        setUsuarios(usuarios.map(u => u.id_usuario === editingId ? { ...u, ...dataToSend } : u));
      } else {
        const response = await usuariosService.crear(formData);
        setUsuarios([...usuarios, response.data]);
      }
      
      setIsModalOpen(false);
      setEditingId(null);
      setEditingData(null);
      setError('');
    } catch (err) {
      setError('Error al guardar usuario: ' + err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (usuario?.rol !== 'administrador') {
    return <div className="error-message" style={{ margin: '20px' }}>Acceso denegado</div>;
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>👤 {usuario?.nombre}</h2>
          <p className="role-badge">🔐 {usuario?.rol.toUpperCase()}</p>
        </div>

        <button className="btn-logout" onClick={onLogout}>
          🚪 Cerrar Sesión
        </button>
      </aside>

      <main className="content">
        <header className="content-header">
          <h1>👥 Gestión de Usuarios</h1>
        </header>

        {error && <div className="error-message">{error}</div>}

        <div className="crud-toolbar">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="toolbar-actions">
            <button className="btn-add primary" onClick={handleNew} aria-label="Nuevo Usuario">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="btn-add-label">Nuevo Usuario</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Cargando usuarios...</div>
        ) : filteredData.length === 0 ? (
          <div className="no-data">
            <p>No hay usuarios disponibles</p>
            <button className="btn-add" onClick={handleNew}>Crear el primero</button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Teléfono</th>
                  <th>Departamento</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id_usuario}>
                    <td>{item.id_usuario}</td>
                    <td>{item.nombre}</td>
                    <td>{item.email}</td>
                    <td>
                      <span className={`badge badge-${item.rol}`}>
                        {item.rol}
                      </span>
                    </td>
                    <td>{item.telefono}</td>
                    <td>{item.departamento || '-'}</td>
                    <td>
                      <span className={item.activo ? 'badge-success' : 'badge-danger'}>
                        {item.activo ? '✅ Activo' : '❌ Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <IconButton
                          type="edit"
                          className="btn-edit"
                          onClick={() => handleEdit(item)}
                          disabled={loading}
                          title="Editar usuario"
                        />
                        <IconButton
                          type="delete"
                          className="btn-delete"
                          onClick={() => setDeleteId(item.id_usuario)}
                          disabled={loading}
                          title="Eliminar usuario"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal CRUD */}
        <CRUDModal
          isOpen={isModalOpen}
          title={editingId ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          fields={usuariosFields}
          data={editingData}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false);
            setEditingId(null);
            setEditingData(null);
          }}
          isLoading={loading}
        />

        {/* Confirmación de eliminación */}
        {deleteId && (
          <div className="modal-overlay" onClick={() => setDeleteId(null)}>
            <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
              <h3>⚠️ Confirmar eliminación</h3>
              <p>¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.</p>
              <div className="confirm-actions">
                <button className="confirm-cancel" onClick={() => setDeleteId(null)} disabled={isDeleting}>
                  Cancelar
                </button>
                <button className="confirm-delete" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UsersManager;
