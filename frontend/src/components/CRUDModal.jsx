import React, { useState, useEffect, useRef } from 'react';
import SearchableSelect from './SearchableSelect';
import '../css/modal.css';

const CRUDModal = ({ isOpen, title, fields, data, onSave, onClose, isLoading }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const overlayRef = useRef(null);
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (data) {
      setFormData(data);
    } else {
      setFormData({});
    }
    setErrors({});

    const onKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose && onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', onKey);
      // focus first input when modal opens for accessibility
      setTimeout(() => {
        firstInputRef.current && firstInputRef.current.focus && firstInputRef.current.focus();
      }, 50);
    }

    return () => {
      document.removeEventListener('keydown', onKey);
    };
  }, [data, isOpen, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Limpiar error del campo
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} es requerido`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      await onSave(formData);
      setFormData({});
    }
  };

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose && onClose();
    }
  };

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button className="close-btn" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {fields.map((field, idx) => (
            <div key={field.name} className="form-group">
              <label htmlFor={field.name}>{field.label}{field.required ? ' *' : ''}</label>
              {field.type === 'select' ? (
                field.searchable ? (
                  <SearchableSelect
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    options={field.options || []}
                    placeholder={`Buscar ${field.label.toLowerCase()}...`}
                    required={field.required}
                    error={!!errors[field.name]}
                    ariaLabel={field.label}
                  />
                ) : (
                  <select
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    className={errors[field.name] ? 'input-error' : ''}
                    aria-required={field.required || false}
                    aria-invalid={errors[field.name] ? 'true' : 'false'}
                    ref={idx === 0 ? firstInputRef : null}
                  >
                    <option value="">Seleccionar...</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )
              ) : field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  rows={4}
                  className={errors[field.name] ? 'input-error' : ''}
                  aria-required={field.required || false}
                  aria-invalid={errors[field.name] ? 'true' : 'false'}
                  ref={idx === 0 ? firstInputRef : null}
                />
              ) : (
                <input
                  id={field.name}
                  type={field.type || 'text'}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className={errors[field.name] ? 'input-error' : ''}
                  aria-required={field.required || false}
                  aria-invalid={errors[field.name] ? 'true' : 'false'}
                  ref={idx === 0 ? firstInputRef : null}
                />
              )}
              {errors[field.name] && (
                <span className="error-text" role="alert">{errors[field.name]}</span>
              )}
            </div>
          ))}

          <div className="modal-actions">
            <button
              type="submit"
              className="btn-save"
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CRUDModal;
