import React from 'react';

const IconButton = ({ type = 'edit', text = '', className = '', onClick, disabled = false, title }) => {
  const kindClass = type === 'delete' ? 'btn-delete' : 'btn-edit';
  const commonProps = {
    className: `${className} icon-btn ${kindClass}`.trim(),
    onClick,
    disabled,
    title: title || text || (type === 'delete' ? 'Eliminar' : 'Editar'),
    'aria-label': title || text || (type === 'delete' ? 'Eliminar' : 'Editar')
  };

  return (
    <button {...commonProps}>
      {type === 'edit' && (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 21v-3.75L14.06 6.19l3.75 3.75L6.75 21H3z" />
          <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
        </svg>
      )}

      {type === 'delete' && (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </svg>
      )}

      {text && <span className="icon-text">{text}</span>}
    </button>
  );
};

export default IconButton;
