import React from 'react';

const NavIcon = ({ type, size = 20 }) => {
  const iconProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  };

  switch (type) {
    case 'clientes':
      return (
        <svg {...iconProps} aria-label="Clientes">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );

    case 'solicitudes':
      return (
        <svg {...iconProps} aria-label="Solicitudes">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="13" x2="8" y2="13" />
          <line x1="12" y1="17" x2="8" y2="17" />
        </svg>
      );

    case 'ordenes':
      return (
        <svg {...iconProps} aria-label="Órdenes">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );

    case 'inventario':
      return (
        <svg {...iconProps} aria-label="Inventario">
          <path d="M9 2H7.17A2 2 0 0 0 5.29 3.29L2.7 5.88A2 2 0 0 0 2 7.17V16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7.17a2 2 0 0 0-.59-1.41l-2.59-2.59A2 2 0 0 0 16.83 2H15" />
          <circle cx="12" cy="13" r="2" />
        </svg>
      );

    case 'usuarios':
      return (
        <svg {...iconProps} aria-label="Usuarios">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );

    case 'auditoria':
      return (
        <svg {...iconProps} aria-label="Auditoría">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );

    case 'logout':
      return (
        <svg {...iconProps} aria-label="Cerrar Sesión">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      );

    default:
      return null;
  }
};

export default NavIcon;
