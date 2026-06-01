import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Search, X, Loader2, FileText } from 'lucide-react';
import { useNavigation } from '../../../context/NavigationContext';
import { patientsData, type Patient } from '../../../services/patients';

export default function InvoiceForm() {
  const { navigate } = useNavigation();

  const [query,        setQuery]        = useState('');
  const [results,      setResults]      = useState<Patient[]>([]);
  const [searching,    setSearching]    = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!query.trim() || query.length < 2) { setResults([]); setShowDropdown(false); return; }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await patientsData.rechercher(query);
        setResults(data); setShowDropdown(true);
      } catch { setResults([]); } finally { setSearching(false); }
    }, 300);
  }, [query]);

  function selectPatient(p: Patient) {
    setShowDropdown(false);
    navigate('billing-detail', p.id);
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate('billing')} className="adm-back-btn"><ArrowLeft size={16} /></button>
        <div>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-t0)', margin: 0 }}>Nouvelle facture</p>
          <p style={{ fontSize: 12, color: 'var(--c-t2)', margin: '2px 0 0' }}>
            Rechercher le patient pour générer automatiquement sa note de frais
          </p>
        </div>
      </div>

      <div className="adm-form-section">
        <div className="adm-form-section-head">
          <p className="adm-card-title">Sélectionner le patient</p>
        </div>
        <div className="adm-form-section-body">
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <div className="adm-search">
              <span className="adm-search-icon">
                {searching
                  ? <Loader2 size={13} style={{ animation: 'spin 0.7s linear infinite' }} />
                  : <Search size={13} />}
              </span>
              <input
                className="adm-search-input"
                placeholder="Nom, prénom ou numéro IPP…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => results.length > 0 && setShowDropdown(true)}
              />
              {query && (
                <button onClick={() => { setQuery(''); setResults([]); }}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-t3)', display: 'flex' }}>
                  <X size={13} />
                </button>
              )}
            </div>

            {showDropdown && results.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: 'var(--c-bg)', border: '1px solid var(--c-bdr)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', marginTop: 4, maxHeight: 300, overflowY: 'auto' }}>
                {results.map(p => (
                  <div key={p.id} onMouseDown={() => selectPatient(p)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', cursor: 'pointer', borderBottom: '1px solid var(--c-bdr)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--c-surf2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg,#60a5fa,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {p.prenom[0]}{p.nom[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: 'var(--c-t0)' }}>{p.prenom} {p.nom}</p>
                      <p style={{ margin: 0, fontSize: 11, color: 'var(--c-t3)' }}>
                        {p.numeroIpp}
                        {p.dateNaissance && ` · ${new Date(p.dateNaissance).toLocaleDateString('fr-FR')}`}
                      </p>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--c-accent)', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      <FileText size={12} /> Générer la facture
                    </span>
                  </div>
                ))}
              </div>
            )}

            {showDropdown && results.length === 0 && !searching && query.trim().length >= 2 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: 'var(--c-bg)', border: '1px solid var(--c-bdr)', borderRadius: 8, padding: 16, textAlign: 'center', fontSize: 13, color: 'var(--c-t3)', marginTop: 4 }}>
                Aucun patient trouvé
              </div>
            )}
          </div>

          <p style={{ fontSize: 11, color: 'var(--c-t3)', marginTop: 10 }}>
            La facture sera générée automatiquement avec toutes les prestations (hospitalisation, examens, soins, consultations).
          </p>
        </div>
      </div>
    </div>
  );
}
