import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { searchCIM10, type CIM10Entry } from '../../data/cim10';

interface CIM10InputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (entry: CIM10Entry) => void;
  placeholder?: string;
}

const TYPE_COLORS: Record<CIM10Entry['type'], { bg: string; color: string; label: string }> = {
  chapitre:  { bg: '#e0f4fd', color: '#0ea5e9', label: 'Chapitre' },
  categorie: { bg: '#d1fae5', color: '#059669', label: 'Catégorie' },
  code:      { bg: '#fef3c7', color: '#d97706', label: 'Code' },
};

export default function CIM10Input({ value, onChange, onSelect, placeholder }: CIM10InputProps) {
  const [query,       setQuery]       = useState('');
  const [results,     setResults]     = useState<CIM10Entry[]>([]);
  const [open,        setOpen]        = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value) setQuery('');
  }, [value]);

  const handleInput = (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      onChange('');
      setResults([]);
      setOpen(false);
      return;
    }
    const found = searchCIM10(val, 12);
    setResults(found);
    setOpen(found.length > 0);
    setHighlighted(0);
  };

  const select = (entry: CIM10Entry) => {
    if (onSelect) {
      // Mode "deux champs" : le code dans l'input, le libellé dans un champ séparé
      setQuery(entry.code);
      onChange(entry.code);
      onSelect(entry);
    } else {
      // Mode "champ unique" : affiche "CODE — libellé"
      const display = `${entry.code} — ${entry.libelle}`;
      setQuery(display);
      onChange(display);
    }
    setOpen(false);
    setResults([]);
  };

  const clear = () => {
    setQuery('');
    onChange('');
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted(h => Math.min(h + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[highlighted]) select(results[highlighted]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector<HTMLDivElement>(`[data-idx="${highlighted}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlighted]);

  return (
    <div style={{ position: 'relative' }}>
      <div className="adm-search" style={{ width: '100%' }}>
        <span className="adm-search-icon">
          <Search size={13} />
        </span>
        <input
          ref={inputRef}
          className="adm-search-input"
          value={query}
          onChange={e => handleInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 180)}
          placeholder={placeholder ?? 'Code ou libellé CIM-10…'}
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={clear}
            style={{
              position: 'absolute', right: 8, top: '50%',
              transform: 'translateY(-50%)', background: 'none',
              border: 'none', cursor: 'pointer',
              color: 'var(--c-t3)', display: 'flex', alignItems: 'center',
            }}
          >
            <X size={13} />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div
          ref={listRef}
          style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            zIndex: 100, background: 'var(--c-surf)',
            border: '1px solid var(--c-bdr)',
            borderRadius: '8px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.13)',
            marginTop: '4px',
            maxHeight: '280px', overflowY: 'auto',
          }}
        >
          {results.map((entry, idx) => {
            const colors = TYPE_COLORS[entry.type];
            const isActive = idx === highlighted;
            return (
              <div
                key={entry.code}
                data-idx={idx}
                onMouseDown={() => select(entry)}
                onMouseEnter={() => setHighlighted(idx)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 12px', cursor: 'pointer',
                  borderBottom: '1px solid var(--c-bdr)',
                  background: isActive ? 'var(--c-surf2)' : 'transparent',
                  transition: 'background 0.1s',
                }}
              >
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '11px', fontWeight: 700,
                  background: colors.bg, color: colors.color,
                  padding: '2px 6px', borderRadius: '4px',
                  whiteSpace: 'nowrap', flexShrink: 0,
                  minWidth: '72px', textAlign: 'center',
                }}>
                  {entry.code}
                </span>
                <span style={{
                  flex: 1, fontSize: '12px', color: 'var(--c-t1)',
                  lineHeight: 1.4, minWidth: 0,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {entry.libelle}
                </span>
                <span style={{
                  fontSize: '9px', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.5px', color: colors.color,
                  background: colors.bg, padding: '1px 5px',
                  borderRadius: '99px', flexShrink: 0,
                }}>
                  {colors.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
