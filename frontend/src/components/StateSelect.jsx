import React, { useState, useRef, useEffect } from 'react';

const StateSelect = ({ value, onChange, options = [], disabled = false, className = '' }) => {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const ref = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  useEffect(() => {
    if (!open) setHighlight(-1);
  }, [open]);

  const selected = options.find(o => o.value === value) || options[0];

  const toggle = () => {
    if (disabled) return;
    setOpen(!open);
  };

  const handleKey = (e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!open) setOpen(true);
      else if (highlight >= 0) onChange(options[highlight].value);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setHighlight(h => Math.min(h + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
      setHighlight(h => Math.max(h - 1, 0));
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className={`custom-select ${className}`} ref={ref}>
      <button
        type="button"
        className={`custom-select__button state-${value}`}
        onClick={toggle}
        onKeyDown={handleKey}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
      >
        <span className="custom-select__label">{selected?.label}</span>
        <span className="custom-select__arrow">▾</span>
      </button>

      {open && (
        <ul className="custom-select__list" role="listbox" tabIndex={-1}>
          {options.map((opt, idx) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`custom-select__item state-${opt.value} ${highlight === idx ? 'highlight' : ''}`}
              onMouseEnter={() => setHighlight(idx)}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StateSelect;
