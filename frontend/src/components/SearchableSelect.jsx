import React, { useState, useRef, useEffect } from 'react';
import '../css/searchable-select.css';

const SearchableSelect = ({ 
  name, 
  value, 
  onChange, 
  options, 
  placeholder = 'Buscar...', 
  required = false,
  error = false,
  disabled = false,
  ariaLabel = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Filtrar opciones basado en búsqueda
  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtener el label del valor seleccionado
  const selectedLabel = options.find(opt => opt.value === value)?.label || '';

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Limpiar búsqueda cuando se cierra
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    } else {
      // Focus en el input cuando se abre
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSelect = (optionValue) => {
    onChange({
      target: {
        name,
        value: optionValue
      }
    });
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div 
      className={`searchable-select-container ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
      ref={containerRef}
    >
      <button
        type="button"
        className="searchable-select-trigger"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || `Seleccionar ${name}`}
        disabled={disabled}
      >
        <span className="selected-label">
          {selectedLabel || placeholder}
        </span>
        <svg 
          className={`chevron ${isOpen ? 'open' : ''}`}
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="searchable-select-dropdown" role="listbox">
          <input
            ref={inputRef}
            type="text"
            className="searchable-select-input"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label={`Buscar ${name}`}
          />
          
          <div className="searchable-select-options">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`searchable-select-option ${value === opt.value ? 'selected' : ''}`}
                  onClick={() => handleSelect(opt.value)}
                  role="option"
                  aria-selected={value === opt.value}
                >
                  {opt.label}
                </button>
              ))
            ) : (
              <div className="searchable-select-empty">No hay resultados</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
