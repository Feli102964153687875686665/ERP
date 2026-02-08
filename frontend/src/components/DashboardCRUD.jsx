import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, clientesService, solicitudesService, ordenesService, inventarioService, usuariosService } from '../utils/api';
import CRUDModal from './CRUDModal';
import StateSelect from './StateSelect';
import IconButton from './IconButton';
import NavIcon from './NavIcon';
import AlertToast from './AlertToast';
import '../css/dashboard.css';
import '../css/modal.css';
import '../css/alert-toast.css';

const DashboardCRUD = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [modulo, setModulo] = useState('clientes');
  const [clientes, setClientes] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // Modal para ver observaciones (solo lectura)
  const [viewObsOpen, setViewObsOpen] = useState(false);
  const [viewObsText, setViewObsText] = useState('');
  
  // Búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  
  // Alertas
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const user = authService.getUser();
    if (!user) {
      navigate('/login');
      return;
    }
    setUsuario(user);
    
    // Establecer módulo inicial según el rol
    if (user.rol === 'tecnico') {
      setModulo('solicitudes');
    } else if (user.rol === 'coordinador') {
      setModulo('clientes');
    } else {
      setModulo('clientes');
    }
    
    cargarDatos();
  }, [navigate]);

  const cargarDatos = async () => {
    setLoading(true);
    setError('');
    try {
      const [clientesRes, solicitudesRes, ordenesRes, inventarioRes, usuariosRes] = await Promise.all([
        clientesService.obtenerTodos(),
        solicitudesService.obtenerTodos(),
        ordenesService.obtenerTodos(),
        inventarioService.obtenerTodos(),
        usuariosService.obtenerTodos()
      ]);

      setClientes(clientesRes.data);
      setSolicitudes(solicitudesRes.data);
      setOrdenes(ordenesRes.data);
      setInventario(inventarioRes.data);
      setUsuarios(usuariosRes.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('Error al cargar los datos. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type = 'success') => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, message, type }]);
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  // CRUD Clientes
  const clientesFields = [
    { name: 'nombre', label: 'Nombre', type: 'text', required: true, placeholder: 'Ej: Empresa XYZ' },
    { name: 'tipo_documento', label: 'Tipo Documento', type: 'select', required: true, options: [
      { value: 'NIT', label: 'NIT' },
      { value: 'CC', label: 'Cédula' },
      { value: 'CE', label: 'Cédula Extranjería' },
      { value: 'RUC', label: 'RUC' },
      { value: 'PASAPORTE', label: 'Pasaporte' }
    ]},
    { name: 'numero_documento', label: 'Documento', type: 'text', required: true, placeholder: '123456789' },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'ciudad', label: 'Ciudad', type: 'text', required: true },
    { name: 'direccion', label: 'Dirección', type: 'text', required: true },
    { name: 'telefono', label: 'Teléfono', type: 'text', required: true },
    { name: 'contacto_principal', label: 'Contacto Principal', type: 'text', required: false }
  ];

  const solicitudesFields = [
    { name: 'id_cliente', label: 'Cliente', type: 'select', required: true, searchable: true, options: clientes.map(c => ({ value: c.id_cliente, label: c.nombre })) },
    { name: 'nombre_solicitud', label: 'Nombre', type: 'text', required: true },
    { name: 'descripcion', label: 'Descripción', type: 'textarea', required: false },
    { name: 'prioridad', label: 'Prioridad', type: 'select', required: true, options: [
      { value: 'baja', label: 'Baja' },
      { value: 'normal', label: 'Normal' },
      { value: 'alta', label: 'Alta' },
      { value: 'urgente', label: 'Urgente' }
    ]},
    { name: 'estado', label: 'Estado', type: 'select', required: true, options: [
      { value: 'pendiente', label: 'Pendiente' },
      { value: 'en_curso', label: 'En Curso' },
      { value: 'finalizado', label: 'Finalizado' },
      { value: 'cancelado', label: 'Cancelado' }
    ]}
  ];

  const ordenesFields = [
    { name: 'id_solicitud', label: 'Solicitud', type: 'select', required: true, searchable: true, options: solicitudes.map(s => ({ value: s.id_solicitud, label: s.nombre_solicitud })) },
    { name: 'id_cliente', label: 'Cliente', type: 'select', required: true, searchable: true, options: clientes.map(c => ({ value: c.id_cliente, label: c.nombre })) },
    { name: 'id_tecnico', label: 'Técnico', type: 'select', required: false, searchable: true, options: [{ value: '', label: 'Sin asignar' }, ...usuarios.filter(u => u.rol === 'tecnico' && u.activo).map(u => ({ value: u.id_usuario, label: u.nombre }))] },
    { name: 'fecha_inicio', label: 'Fecha Inicio', type: 'date', required: true },
    { name: 'fecha_cierre', label: 'Fecha Cierre', type: 'date', required: false },
    { name: 'estado', label: 'Estado', type: 'select', required: true, options: [
      { value: 'pendiente', label: 'Pendiente' },
      { value: 'en_curso', label: 'En Curso' },
      { value: 'finalizado', label: 'Finalizado' },
      { value: 'cancelado', label: 'Cancelado' }
    ]},
    { name: 'observaciones', label: 'Observaciones', type: 'textarea', required: false }
  ];

  const inventarioFields = [
    { name: 'codigo_interno', label: 'Código', type: 'text', required: true },
    { name: 'nombre', label: 'Nombre', type: 'text', required: true },
    { name: 'descripcion', label: 'Descripción', type: 'textarea', required: false },
    { name: 'categoria', label: 'Categoría', type: 'text', required: true },
    { name: 'cantidad_disponible', label: 'Cantidad', type: 'number', required: true },
    { name: 'cantidad_minima', label: 'Cantidad Mínima', type: 'number', required: true },
    { name: 'proveedor', label: 'Proveedor', type: 'text', required: false },
    { name: 'precio_unitario', label: 'Precio Unitario', type: 'number', required: false }
  ];

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

  const handleNew = () => {
    // Técnico no puede crear solicitudes ni órdenes
    if ((modulo === 'solicitudes' || modulo === 'ordenes') && usuario.rol === 'tecnico') {
      setError('Los técnicos solo pueden ver, no crear registros');
      return;
    }
    setEditingId(null);
    setEditingData(null);
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    // Obtener el ID correcto según el módulo actual
    let id;
    if (modulo === 'clientes') {
      id = record.id_cliente;
    } else if (modulo === 'solicitudes') {
      id = record.id_solicitud;
    } else if (modulo === 'ordenes') {
      id = record.id_orden;
    } else if (modulo === 'inventario') {
      id = record.id_item;
    } else if (modulo === 'usuarios') {
      id = record.id_usuario;
    }
    setEditingId(id);
    setEditingData(record);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      if (modulo === 'clientes') {
        await clientesService.eliminar(deleteId);
        setClientes(clientes.filter(c => c.id_cliente !== deleteId));
        showAlert('Cliente eliminado correctamente', 'success');
      } else if (modulo === 'solicitudes') {
        await solicitudesService.eliminar(deleteId);
        setSolicitudes(solicitudes.filter(s => s.id_solicitud !== deleteId));
        showAlert('Solicitud eliminada correctamente', 'success');
      } else if (modulo === 'ordenes') {
        await ordenesService.eliminar(deleteId);
        setOrdenes(ordenes.filter(o => o.id_orden !== deleteId));
        showAlert('Orden eliminada correctamente', 'success');
      } else if (modulo === 'inventario') {
        await inventarioService.eliminar(deleteId);
        setInventario(inventario.filter(i => i.id_item !== deleteId));
        showAlert('Artículo eliminado correctamente', 'success');
      } else if (modulo === 'usuarios') {
        await usuariosService.eliminar(deleteId);
        setUsuarios(usuarios.filter(u => u.id_usuario !== deleteId));
        showAlert('Usuario eliminado correctamente', 'success');
      }
      setDeleteId(null);
    } catch (error) {
      console.error('Error al eliminar:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error al eliminar.';
      showAlert(errorMessage, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      setLoading(true);
      console.log('[DASHBOARD SAVE]', { modulo, editingId, formData });
      
      if (modulo === 'clientes') {
        if (editingId) {
          const res = await clientesService.actualizar(editingId, formData);
          console.log('[CLIENTES UPDATE]', res.data);
          setClientes(clientes.map(c => c.id_cliente === editingId ? res.data : c));
          showAlert('Cliente actualizado correctamente', 'success');
        } else {
          const res = await clientesService.crear(formData);
          console.log('[CLIENTES CREATE]', res.data);
          setClientes([...clientes, res.data]);
          showAlert('Cliente creado correctamente', 'success');
        }
      } else if (modulo === 'solicitudes') {
        if (editingId) {
          // Enviar directamente los datos del formulario
          const payload = {
            nombre_solicitud: formData.nombre_solicitud,
            descripcion: formData.descripcion,
            estado: formData.estado,
            prioridad: formData.prioridad
          };
          console.log('[SOLICITUDES UPDATE PAYLOAD]', payload);
          const res = await solicitudesService.actualizar(editingId, payload);
          console.log('[SOLICITUDES UPDATE RESPONSE]', res.data);
          setSolicitudes(solicitudes.map(s => s.id_solicitud === editingId ? res.data : s));
          showAlert('Solicitud actualizada correctamente', 'success');
        } else {
          const res = await solicitudesService.crear(formData);
          console.log('[SOLICITUDES CREATE]', res.data);
          setSolicitudes([...solicitudes, res.data]);
          showAlert('Solicitud creada correctamente', 'success');
        }
      } else if (modulo === 'ordenes') {
        if (editingId) {
          // Técnicos sólo pueden cambiar estado y observaciones
          if (usuario?.rol === 'tecnico') {
            const dataToSend = {
              estado: formData.estado,
              observaciones: formData.observaciones
            };
            console.log('[ORDENES UPDATE PAYLOAD (TECNICO)]', dataToSend);
            const res = await ordenesService.actualizar(editingId, dataToSend);
            console.log('[ORDENES UPDATE RESPONSE (TECNICO)]', res.data);
            setOrdenes(ordenes.map(o => o.id_orden === editingId ? res.data : o));
            showAlert('Orden actualizada correctamente', 'success');
          } else {
            // Admin/coordinador envía payload completo
            const dataToSend = {
              estado: formData.estado,
              fecha_cierre: formData.fecha_cierre,
              observaciones: formData.observaciones
            };
            console.log('[ORDENES UPDATE PAYLOAD (ADMIN)]', dataToSend);
            const res = await ordenesService.actualizar(editingId, dataToSend);
            console.log('[ORDENES UPDATE RESPONSE (ADMIN)]', res.data);
            setOrdenes(ordenes.map(o => o.id_orden === editingId ? res.data : o));
            showAlert('Orden actualizada correctamente', 'success');
          }
        } else {
          // Enviar solo los campos que se guardan en BD
          const ordenData = {
            id_solicitud: formData.id_solicitud,
            id_cliente: formData.id_cliente,
            id_tecnico: formData.id_tecnico,
            fecha_inicio: formData.fecha_inicio,
            fecha_cierre: formData.fecha_cierre,
            estado: formData.estado,
            observaciones: formData.observaciones
          };
          
          const res = await ordenesService.crear(ordenData);
          console.log('[ORDENES CREATE]', res.data);
          setOrdenes([...ordenes, res.data]);
          showAlert('Orden creada correctamente', 'success');
        }
      } else if (modulo === 'inventario') {
        if (editingId) {
          const res = await inventarioService.actualizar(editingId, formData);
          console.log('[INVENTARIO UPDATE]', res.data);
          setInventario(inventario.map(i => i.id_item === editingId ? res.data : i));
          showAlert('Artículo actualizado correctamente', 'success');
        } else {
          const res = await inventarioService.crear(formData);
          console.log('[INVENTARIO CREATE]', res.data);
          setInventario([...inventario, res.data]);
          showAlert('Artículo creado correctamente', 'success');
        }
      } else if (modulo === 'usuarios') {
        if (editingId) {
          // No enviar contraseña vacía en edición
          const dataToSend = { ...formData };
          if (!dataToSend.password) {
            delete dataToSend.password;
          }
          const res = await usuariosService.actualizar(editingId, dataToSend);
          console.log('[USUARIOS UPDATE]', res.data);
          setUsuarios(usuarios.map(u => u.id_usuario === editingId ? res.data : u));
          showAlert('Usuario actualizado correctamente', 'success');
        } else {
          const res = await usuariosService.crear(formData);
          console.log('[USUARIOS CREATE]', res.data);
          setUsuarios([...usuarios, res.data]);
          showAlert('Usuario creado correctamente', 'success');
        }
      }
      
      console.log('[DASHBOARD SAVE CLOSE MODAL]');
      // Pequeño delay para asegurar que todos los updates de estado se procesen
      setTimeout(() => {
        setIsModalOpen(false);
        setEditingId(null);
        setEditingData(null);
      }, 100);
      setError(''); // Limpiar errores previos
    } catch (error) {
      console.error('Error al guardar:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error al guardar. Intenta de nuevo.';
      showAlert(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleChangeEstado = async (itemId, newEstado, type) => {
    try {
      setLoading(true);
      if (type === 'solicitudes') {
        // Obtener la solicitud completa antes de actualizar, porque el endpoint espera todos los campos
        const res = await solicitudesService.obtenerPorId(itemId);
        const existing = res.data || res.data === 0 ? res.data : res; // compatibilidad por si la respuesta varía
        // Build payload preservando campos necesarios
        const payload = {
          nombre_solicitud: existing.nombre_solicitud ?? existing.nombre_solicitud,
          descripcion: existing.descripcion ?? null,
          estado: newEstado,
          prioridad: existing.prioridad ?? 'normal'
        };
        await solicitudesService.actualizar(itemId, payload);
        setSolicitudes(solicitudes.map(s => s.id_solicitud === itemId ? { ...s, estado: newEstado } : s));
        
        // Recargar las órdenes desde el servidor para sincronizar cambios en la BD
        const ordenesRes = await ordenesService.obtenerTodos();
        setOrdenes(ordenesRes.data);
        
        showAlert('Estado de solicitud actualizado', 'success');
      } else if (type === 'ordenes') {
        await ordenesService.actualizar(itemId, { estado: newEstado });
        setOrdenes(ordenes.map(o => o.id_orden === itemId ? { ...o, estado: newEstado } : o));
        
        // Recargar solicitudes desde el servidor para sincronizar cambios en la BD
        const solicitudesRes = await solicitudesService.obtenerTodos();
        setSolicitudes(solicitudesRes.data);
        
        showAlert('Estado de orden actualizado', 'success');
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error al cambiar estado.';
      showAlert(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredData = () => {
    const data = {
      clientes: clientes,
      solicitudes: solicitudes,
      ordenes: ordenes,
      inventario: inventario,
      usuarios: usuarios
    }[modulo];

    // Si el usuario es técnico y estamos en Órdenes, mostrar sólo las órdenes asignadas a él
    if (modulo === 'ordenes' && usuario?.rol === 'tecnico') {
      const myId = Number(usuario.id_usuario || usuario.id || usuario.id_usuario);
      const onlyMine = (data || []).filter(o => Number(o.id_tecnico) === myId);
      if (!searchTerm) return onlyMine;
      return onlyMine.filter(item => {
        const values = Object.values(item || {}).join('').toLowerCase();
        return values.includes(searchTerm.toLowerCase());
      });
    }

    if (!searchTerm) return data;

    return (data || []).filter(item => {
      const values = Object.values(item || {}).join('').toLowerCase();
      return values.includes(searchTerm.toLowerCase());
    });
  };

  const filteredData = getFilteredData();

  if (!usuario) return <div>Cargando...</div>;

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>ERP</h2>
          <div className="user-info">
            <strong>{usuario.nombre}</strong>
            <div className="role-badge">{usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1)}</div>
          </div>
        </div>

        <nav className="modules-menu">
          <h3>Módulos</h3>
          <ul>
            {/* Administrador: ve todos */}
            {usuario.rol === 'administrador' && (
              <>
                <li
                  onClick={() => { setModulo('clientes'); setSearchTerm(''); }}
                  className={modulo === 'clientes' ? 'active' : ''}
                >
                  <NavIcon type="clientes" size={18} />
                  <span>Clientes</span>
                </li>
                <li
                  onClick={() => { setModulo('solicitudes'); setSearchTerm(''); }}
                  className={modulo === 'solicitudes' ? 'active' : ''}
                >
                  <NavIcon type="solicitudes" size={18} />
                  <span>Solicitudes</span>
                </li>
                <li
                  onClick={() => { setModulo('ordenes'); setSearchTerm(''); }}
                  className={modulo === 'ordenes' ? 'active' : ''}
                >
                  <NavIcon type="ordenes" size={18} />
                  <span>Órdenes</span>
                </li>
                <li
                  onClick={() => { setModulo('inventario'); setSearchTerm(''); }}
                  className={modulo === 'inventario' ? 'active' : ''}
                >
                  <NavIcon type="inventario" size={18} />
                  <span>Inventario</span>
                </li>
                {usuario?.rol === 'administrador' && (
                  <li
                    onClick={() => { setModulo('usuarios'); setSearchTerm(''); }}
                    className={modulo === 'usuarios' ? 'active' : ''}
                  >
                    <NavIcon type="usuarios" size={18} />
                    <span>Gestión de Usuarios</span>
                  </li>
                )}
              </>
            )}

            {/* Técnico: solo Solicitudes y Órdenes */}
            {usuario.rol === 'tecnico' && (
              <>
                <li
                  onClick={() => { setModulo('solicitudes'); setSearchTerm(''); }}
                  className={modulo === 'solicitudes' ? 'active' : ''}
                >
                  <NavIcon type="solicitudes" size={18} />
                  <span>Solicitudes</span>
                </li>
                <li
                  onClick={() => { setModulo('ordenes'); setSearchTerm(''); }}
                  className={modulo === 'ordenes' ? 'active' : ''}
                >
                  <NavIcon type="ordenes" size={18} />
                  <span>Órdenes Asignadas</span>
                </li>
              </>
            )}

            {/* Coordinador: Clientes, Solicitudes y Órdenes */}
            {usuario.rol === 'coordinador' && (
              <>
                <li
                  onClick={() => { setModulo('clientes'); setSearchTerm(''); }}
                  className={modulo === 'clientes' ? 'active' : ''}
                >
                  <NavIcon type="clientes" size={18} />
                  <span>Clientes</span>
                </li>
                <li
                  onClick={() => { setModulo('solicitudes'); setSearchTerm(''); }}
                  className={modulo === 'solicitudes' ? 'active' : ''}
                >
                  <NavIcon type="solicitudes" size={18} />
                  <span>Solicitudes</span>
                </li>
                <li
                  onClick={() => { setModulo('ordenes'); setSearchTerm(''); }}
                  className={modulo === 'ordenes' ? 'active' : ''}
                >
                  <NavIcon type="ordenes" size={18} />
                  <span>Órdenes</span>
                </li>
              </>
            )}
          </ul>
        </nav>

        <button className="btn-logout" onClick={handleLogout}>
          <NavIcon type="logout" size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="content">
        <header className="content-header">
          <h1>
            {modulo === 'usuarios' ? 'Gestión de Usuarios' : modulo.charAt(0).toUpperCase() + modulo.slice(1)}
          </h1>
        </header>

        {error && <div className="error-message">{error}</div>}

        {/* Buscador y botones */}
        <div className="crud-toolbar">
          <div className="search-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.6" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder={modulo === 'usuarios' ? 'Buscar por nombre o email...' : 'Buscar...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Mostrar botón agregar solo si tiene permisos */}
          <div className="toolbar-actions">
            {(modulo === 'usuarios' && usuario?.rol === 'administrador') && (
              <button className="btn-add primary" onClick={handleNew} aria-label="Nuevo Usuario">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="btn-add-label">Nuevo Usuario</span>
              </button>
            )}
            {modulo !== 'usuarios' && !((modulo === 'solicitudes' || modulo === 'ordenes') && usuario.rol === 'tecnico') && (
              <button className="btn-add primary" onClick={handleNew} aria-label={`Nuevo ${modulo}`}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="btn-add-label">{(() => {
                  switch(modulo) {
                    case 'clientes': return 'Nuevo Cliente';
                    case 'inventario': return 'Nueva Herramienta';
                    case 'solicitudes': return 'Nueva Solicitud';
                    case 'ordenes': return 'Nueva Orden';
                    default: return 'Agregar Nuevo';
                  }
                })()}</span>
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="loading">Cargando datos...</div>
        ) : filteredData.length === 0 ? (
          <div className="no-data">
            <p>No hay datos disponibles</p>
            {!((modulo === 'solicitudes' || modulo === 'ordenes') && usuario.rol === 'tecnico') && (
              <button className="btn-add" onClick={handleNew}>Crear el primero</button>
            )}
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {modulo === 'usuarios' && (
                    <>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Teléfono</th>
                      <th>Departamento</th>
                      <th>Estado</th>
                      {usuario.rol !== 'tecnico' && <th>Acciones</th>}
                    </>
                  )}
                  {modulo === 'clientes' && (
                    <>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Documento</th>
                      <th>Email</th>
                      <th>Teléfono</th>
                      <th>Dirección</th>
                      <th>Ciudad</th>
                      <th>Contacto</th>
                      {usuario.rol !== 'tecnico' && <th>Acciones</th>}
                    </>
                  )}
                  {modulo === 'solicitudes' && (
                    <>
                      <th>ID</th>
                      <th>Solicitud</th>
                      <th>Cliente</th>
                      <th>Descripción</th>
                      <th>Estado</th>
                      <th>Prioridad</th>
                      <th>Fecha</th>
                      {usuario.rol !== 'tecnico' && <th>Acciones</th>}
                    </>
                  )}
                  {modulo === 'ordenes' && (
                    <>
                      <th>ID</th>
                      <th>Solicitud</th>
                      <th>Cliente</th>
                      <th>Técnico</th>
                      <th>Estado</th>
                      <th>Fecha Inicio</th>
                      <th>Fecha Cierre</th>
                      <th>Observaciones</th>
                      {usuario.rol !== 'tecnico' && <th>Acciones</th>}
                    </>
                  )}
                  {modulo === 'inventario' && (
                    <>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Código</th>
                      <th>Descripción</th>
                      <th>Cantidad</th>
                      <th>Mínima</th>
                      <th>Categoría</th>
                      <th>Proveedor</th>
                      <th>Precio</th>
                      {usuario.rol !== 'tecnico' && <th>Acciones</th>}
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={modulo === 'usuarios' ? item.id_usuario : modulo === 'clientes' ? item.id_cliente : modulo === 'solicitudes' ? item.id_solicitud : modulo === 'ordenes' ? item.id_orden : item.id_item}>
                    {modulo === 'usuarios' && (
                      <>
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
                        {usuario.rol !== 'tecnico' && (
                          <td>
                            <div className="table-actions">
                              <IconButton type="edit" className="btn-action btn-edit" onClick={() => handleEdit(item)} />
                              <IconButton type="delete" className="btn-action btn-delete" onClick={() => setDeleteId(item.id_usuario)} />
                            </div>
                          </td>
                        )}
                      </>
                    )}
                    {modulo === 'clientes' && (
                      <>
                        <td>{item.id_cliente}</td>
                        <td>{item.nombre}</td>
                        <td>{item.numero_documento} ({item.tipo_documento})</td>
                        <td>{item.email}</td>
                        <td>{item.telefono}</td>
                        <td>{item.direccion}</td>
                        <td>{item.ciudad}</td>
                        <td>{item.contacto_principal || 'N/A'}</td>
                        {usuario.rol !== 'tecnico' && (
                          <td>
                            <div className="table-actions">
                              <IconButton type="edit" className="btn-action btn-edit" onClick={() => handleEdit(item)} />
                              <IconButton type="delete" className="btn-action btn-delete" onClick={() => setDeleteId(item.id_cliente)} />
                            </div>
                          </td>
                        )}
                      </>
                    )}
                    {modulo === 'solicitudes' && (
                      <>
                        <td>{item.id_solicitud}</td>
                        <td>{item.nombre_solicitud}</td>
                        <td>{item.nombre_cliente || `Cliente ${item.id_cliente}`}</td>
                        <td style={{maxWidth: '200px', overflow: 'hidden', textAlign: 'center'}}>
                          <div style={{display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center'}}>
                            <button
                              className="btn-action btn-view"
                              title={item.descripcion ? 'Ver descripción' : 'Sin descripción'}
                              onClick={() => { if (item.descripcion) { setViewObsText(item.descripcion); setViewObsOpen(true); } }}
                              aria-label="Ver descripción"
                              disabled={!item.descripcion}
                              style={{opacity: item.descripcion ? 1 : 0.45, cursor: item.descripcion ? 'pointer' : 'not-allowed', padding: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}
                            >
                              <svg width="18" height="12" viewBox="0 0 24 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M1 7C1 7 5 1 12 1s11 6 11 6-4 6-11 6S1 7 1 7z" stroke="#1f2937" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                                <circle cx="12" cy="7" r="2.2" fill="#1f2937" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td>
                          <StateSelect
                            value={item.estado}
                            onChange={(v) => handleChangeEstado(item.id_solicitud, v, 'solicitudes')}
                            disabled={usuario.rol === 'tecnico'}
                            options={[
                              { value: 'pendiente', label: 'Pendiente' },
                              { value: 'en_curso', label: 'En Curso' },
                              { value: 'finalizado', label: 'Finalizado' },
                              { value: 'cancelado', label: 'Cancelado' }
                            ]}
                          />
                        </td>
                        <td><span className={`badge badge-${item.prioridad}`}>{item.prioridad}</span></td>
                        <td>{new Date(item.fecha_creacion).toLocaleDateString()}</td>
                        {usuario.rol !== 'tecnico' && (
                          <td>
                            <div className="table-actions">
                              <IconButton type="edit" className="btn-action btn-edit" onClick={() => handleEdit(item)} />
                              <IconButton type="delete" className="btn-action btn-delete" onClick={() => setDeleteId(item.id_solicitud)} />
                            </div>
                          </td>
                        )}
                      </>
                    )}
                    {modulo === 'ordenes' && (
                      <>
                        <td>{item.id_orden}</td>
                        <td>{item.nombre_solicitud}</td>
                        <td>{item.nombre_cliente}</td>
                        <td>{item.nombre_tecnico || 'Sin asignar'}</td>
                        <td>
                          <StateSelect
                            value={item.estado}
                            onChange={(v) => handleChangeEstado(item.id_orden, v, 'ordenes')}
                            options={[
                              { value: 'pendiente', label: 'Pendiente' },
                              { value: 'en_curso', label: 'En Curso' },
                              { value: 'finalizado', label: 'Finalizado' },
                              { value: 'cancelado', label: 'Cancelado' }
                            ]}
                          />
                        </td>
                        <td>{new Date(item.fecha_inicio).toLocaleDateString()}</td>
                        <td>{item.fecha_cierre ? new Date(item.fecha_cierre).toLocaleDateString() : 'Pendiente'}</td>
                        <td style={{maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                          <div style={{display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center'}}>
                            <button
                              className="btn-action btn-view"
                              title={item.observaciones ? 'Ver observación' : 'Sin observación'}
                              onClick={() => { if (item.observaciones) { setViewObsText(item.observaciones); setViewObsOpen(true); } }}
                              aria-label="Ver observación"
                              disabled={!item.observaciones}
                              style={{opacity: item.observaciones ? 1 : 0.45, cursor: item.observaciones ? 'pointer' : 'not-allowed', padding: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}
                            >
                              <svg width="18" height="12" viewBox="0 0 24 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M1 7C1 7 5 1 12 1s11 6 11 6-4 6-11 6S1 7 1 7z" stroke="#1f2937" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                                <circle cx="12" cy="7" r="2.2" fill="#1f2937" />
                              </svg>
                            </button>
                            {usuario.rol === 'tecnico' && (
                              <button className="btn-action btn-edit" onClick={() => { setEditingId(item.id_orden); setEditingData(item); setIsModalOpen(true); }} title="Editar observación">
                                ✏️
                              </button>
                            )}
                          </div>
                        </td>
                        {usuario.rol !== 'tecnico' && (
                          <td>
                            <div className="table-actions">
                              <IconButton type="edit" className="btn-action btn-edit" onClick={() => handleEdit(item)} />
                              <IconButton type="delete" className="btn-action btn-delete" onClick={() => setDeleteId(item.id_orden)} />
                            </div>
                          </td>
                        )}
                      </>
                    )}
                    {modulo === 'inventario' && (
                      <>
                        <td>{item.id_item}</td>
                        <td>{item.nombre}</td>
                        <td>{item.codigo_interno}</td>
                        <td style={{maxWidth: '150px', overflow: 'hidden', textAlign: 'center'}}>
                          <div style={{display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center'}}>
                            <button
                              className="btn-action btn-view"
                              title={item.descripcion ? 'Ver descripción' : 'Sin descripción'}
                              onClick={() => { if (item.descripcion) { setViewObsText(item.descripcion); setViewObsOpen(true); } }}
                              aria-label="Ver descripción"
                              disabled={!item.descripcion}
                              style={{opacity: item.descripcion ? 1 : 0.45, cursor: item.descripcion ? 'pointer' : 'not-allowed', padding: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}
                            >
                              <svg width="18" height="12" viewBox="0 0 24 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M1 7C1 7 5 1 12 1s11 6 11 6-4 6-11 6S1 7 1 7z" stroke="#1f2937" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                                <circle cx="12" cy="7" r="2.2" fill="#1f2937" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td>{item.cantidad_disponible}</td>
                        <td>{item.cantidad_minima}</td>
                        <td>{item.categoria}</td>
                        <td>{item.proveedor || 'N/A'}</td>
                        <td>${parseFloat(item.precio_unitario || 0).toFixed(2)}</td>
                        {usuario.rol !== 'tecnico' && (
                          <td>
                            <div className="table-actions">
                              <IconButton type="edit" className="btn-action btn-edit" onClick={() => handleEdit(item)} />
                              <IconButton type="delete" className="btn-action btn-delete" onClick={() => setDeleteId(item.id_item)} />
                            </div>
                          </td>
                        )}
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal CRUD */}
        {(() => {

          const modalFields = (
            modulo === 'clientes' ? clientesFields :
            modulo === 'solicitudes' ? solicitudesFields :
            modulo === 'ordenes' ? (usuario?.rol === 'tecnico' && editingId ? [
              { name: 'estado', label: 'Estado', type: 'select', required: true, options: [
                { value: 'pendiente', label: 'Pendiente' },
                { value: 'en_curso', label: 'En Curso' },
                { value: 'finalizado', label: 'Finalizado' },
                { value: 'cancelado', label: 'Cancelado' }
              ]},
              { name: 'observaciones', label: 'Observaciones', type: 'textarea', required: false }
            ] : ordenesFields) :
            modulo === 'usuarios' ? usuariosFields :
            inventarioFields
          );

          return (
            <CRUDModal
              isOpen={isModalOpen}
              title={editingId ? `Editar ${modulo}` : `Nuevo ${modulo}`}
              fields={modalFields}
              data={editingData}
              onSave={handleSave}
              onClose={() => {
                setIsModalOpen(false);
                setEditingId(null);
                setEditingData(null);
              }}
              isLoading={loading}
            />
          );
        })()}

        {/* Modal minimalista de solo lectura para ver observaciones */}
        {viewObsOpen && (
          <div className="modal-overlay" onClick={() => setViewObsOpen(false)}>
            <div className="modal simple-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-body">
                <p style={{whiteSpace: 'pre-wrap', margin: 0}}>{viewObsText}</p>
              </div>
              <div className="modal-actions">
                <button className="btn-primary-blue" onClick={() => setViewObsOpen(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmación de eliminación - minimalista */}
        {deleteId && (
          <div className="modal-overlay" onClick={() => setDeleteId(null)}>
            <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
              <p>¿Eliminar este registro?</p>
              <div className="confirm-actions">
                <button className="confirm-cancel" onClick={() => setDeleteId(null)} disabled={isDeleting}>
                  Cancelar
                </button>
                <button className="confirm-delete" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Alertas Toast */}
        {alerts.map(alert => (
          <AlertToast
            key={alert.id}
            message={alert.message}
            type={alert.type}
            onClose={() => removeAlert(alert.id)}
          />
        ))}
      </main>
    </div>
  );
};

export default DashboardCRUD;
