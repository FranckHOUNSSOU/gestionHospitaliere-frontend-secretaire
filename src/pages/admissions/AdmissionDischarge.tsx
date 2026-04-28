import { useState, useEffect, useRef } from 'react';
import { Plus, Search, BedDouble, CheckCircle2, ArrowRight, FolderOpen, LogOut, Loader2 } from 'lucide-react';
import Badge, { statusBadge } from '../../components/ui/Badge';
import { useNavigation } from '../../context/NavigationContext';
import type { Admission, AdmissionStatus } from '../../types/index';
import client from '../../services/clients';

// ─── Types API ───────────────────────────────────────────────────────────────

interface AdmissionStats {
  active: number;
  discharged: number;
  transferred: number;
}

// ─── Composant ───────────────────────────────────────────────────────────────

export default function AdmissionList() {
  const { navigate } = useNavigation();

  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState<AdmissionStatus | 'all'>('all');

  // Résultats de recherche
  const [results,      setResults]      = useState<Admission[]>([]);
  const [searching,    setSearching]    = useState(false);
  const [searchError,  setSearchError]  = useState<string | null>(null);

  // Stats (chargées une fois au montage)
  const [stats, setStats] = useState<AdmissionStats>({ active: 0, discharged: 0, transferred: 0 });

  // Debounce ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Chargement des stats au montage ──────────────────────────────────────
  useEffect(() => {
    client.get<AdmissionStats>('/admissions/stats')
      .then(res => setStats(res.data))
      .catch(() => { /* stats non bloquantes */ });
  }, []);

  // ── Recherche avec debounce ───────────────────────────────────────────────
  const hasQuery = search.trim().length > 0 || statusFilter !== 'all';

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!hasQuery) {
      setResults([]);
      setSearchError(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      setSearchError(null);
      try {
        const params: Record<string, string> = {};
        if (search.trim())       params.q      = search.trim();
        if (statusFilter !== 'all') params.statut = statusFilter;

        // Endpoint : GET /admissions/recherche?q=...&statut=...
        // Ajuste le chemin si ton API utilise une route différente
        const res = await client.get<Admission[]>('/admissions/recherche', { params });
        setResults(res.data);
      } catch {
        setSearchError('Erreur lors de la recherche. Vérifiez votre connexion.');
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350); // 350 ms de debounce

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search, statusFilter, hasQuery]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {[
          { label: 'Admissions actives', value: stats.active,     icon: <BedDouble size={16} />,    kpi: 'adm-kpi-blue'   },
          { label: 'Sorties récentes',   value: stats.discharged,  icon: <CheckCircle2 size={16} />, kpi: 'adm-kpi-green'  },
          { label: 'Transférés',         value: stats.transferred, icon: <ArrowRight size={16} />,   kpi: 'adm-kpi-orange' },
        ].map(s => (
          <div key={s.label} className={`adm-kpi ${s.kpi}`}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <p className="adm-kpi-lbl" style={{ marginBottom: 0 }}>{s.label}</p>
              <span style={{ opacity: 0.6 }}>{s.icon}</span>
            </div>
            <div className="adm-kpi-val">{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── Table card ── */}
      <div className="adm-card">

        {/* Filtres */}
        <div className="adm-card-head" style={{ gap: '10px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '8px', flex: 1, flexWrap: 'wrap' }}>
            <div className="adm-search" style={{ flex: 1, minWidth: '200px', maxWidth: '320px' }}>
              <span className="adm-search-icon">
                {searching ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={14} />}
              </span>
              <input
                type="text"
                placeholder="IPP, nom du patient, service, salle..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="adm-search-input"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as AdmissionStatus | 'all')}
              className="adm-input"
              style={{ width: 'auto', padding: '6px 10px' }}
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="discharged">Sorti</option>
              <option value="transferred">Transféré</option>
            </select>
          </div>
          <button onClick={() => navigate('admission-new')} className="adm-btn adm-btn-primary">
            <Plus size={13} /> Nouvelle admission
          </button>
        </div>

        {/* ── Contenu ── */}
        {!hasQuery ? (

          /* Invitation à rechercher */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '56px 24px', gap: '12px', color: 'var(--c-t3)' }}>
            <Search size={36} strokeWidth={1.4} style={{ opacity: 0.35 }} />
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>
              Recherchez un patient par IPP, nom, service ou salle
            </p>
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.7 }}>
              Les résultats s'afficheront ici dès que vous commencerez à saisir.
            </p>
          </div>

        ) : searchError ? (

          /* Erreur API */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', gap: '10px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#ef4444' }}>{searchError}</p>
          </div>

        ) : (

          <div style={{ overflowX: 'auto' }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Service / Salle</th>
                  <th>Médecin</th>
                  <th>Entrée</th>
                  <th>Sortie prévue</th>
                  <th>Motif</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 && !searching ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--c-t3)' }}>
                      Aucune admission trouvée pour cette recherche.
                    </td>
                  </tr>
                ) : (
                  results.map(adm => {
                    const { variant, label } = statusBadge(adm.status);
                    const days = adm.status === 'active'
                      ? Math.floor((Date.now() - new Date(adm.admissionDate).getTime()) / 86_400_000)
                      : null;

                    return (
                      <tr key={adm.id}>

                        {/* Patient */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="adm-avatar-sm" style={{ background: 'linear-gradient(135deg,#fbbf24,#f97316)' }}>
                              {adm.patientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <button onClick={() => navigate('patient-detail', adm.patientId)} className="adm-link-btn">
                                {adm.patientName}
                              </button>
                              {days !== null && (
                                <p className="adm-cell-mono">{days} jour{days > 1 ? 's' : ''}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Service / Salle */}
                        <td>
                          <p className="adm-cell-name">{adm.department}</p>
                          <p className="adm-cell-mono">Salle {adm.room} · Lit {adm.bed}</p>
                        </td>

                        {/* Médecin */}
                        <td>
                          <span className="adm-cell-mono" style={{ fontSize: '12px', color: 'var(--c-t1)' }}>
                            {adm.doctorName}
                          </span>
                        </td>

                        {/* Entrée */}
                        <td>
                          <span className="adm-cell-mono">
                            {new Date(adm.admissionDate).toLocaleDateString('fr-FR')}
                          </span>
                        </td>

                        {/* Sortie prévue */}
                        <td>
                          <span className="adm-cell-mono">
                            {adm.expectedDischargeDate
                              ? new Date(adm.expectedDischargeDate).toLocaleDateString('fr-FR')
                              : '—'}
                          </span>
                        </td>

                        {/* Motif */}
                        <td>
                          <span className="adm-cell-mono adm-text-truncate" style={{ maxWidth: '140px', display: 'block' }}>
                            {adm.reason}
                          </span>
                        </td>

                        {/* Statut */}
                        <td><Badge variant={variant}>{label}</Badge></td>

                        {/* ── Actions ── */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>

                            {/* Dossier patient */}
                            <button
                              onClick={() => navigate('patient-file', adm.patientId)}
                              title="Compléter le dossier patient"
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '30px', height: '30px', borderRadius: '6px',
                                border: '1px solid var(--c-bdr)', background: 'var(--c-bg2)',
                                color: 'var(--c-primary)', cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
                              }}
                              onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = 'var(--c-primary)';
                                (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                              }}
                              onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = 'var(--c-bg2)';
                                (e.currentTarget as HTMLButtonElement).style.color = 'var(--c-primary)';
                              }}
                            >
                              <FolderOpen size={14} />
                            </button>

                            {/* Sortie */}
                            <button
                              onClick={() => navigate('admission-discharge', adm.id)}
                              title="Enregistrer la sortie"
                              disabled={adm.status !== 'active'}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '30px', height: '30px', borderRadius: '6px',
                                border: '1px solid var(--c-bdr)', background: 'var(--c-bg2)',
                                color: adm.status === 'active' ? '#ef4444' : 'var(--c-t3)',
                                cursor: adm.status === 'active' ? 'pointer' : 'not-allowed',
                                opacity: adm.status === 'active' ? 1 : 0.4,
                                transition: 'background 0.15s, color 0.15s',
                              }}
                              onMouseEnter={e => {
                                if (adm.status !== 'active') return;
                                (e.currentTarget as HTMLButtonElement).style.background = '#ef4444';
                                (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                              }}
                              onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = 'var(--c-bg2)';
                                (e.currentTarget as HTMLButtonElement).style.color = adm.status === 'active' ? '#ef4444' : 'var(--c-t3)';
                              }}
                            >
                              <LogOut size={14} />
                            </button>

                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}