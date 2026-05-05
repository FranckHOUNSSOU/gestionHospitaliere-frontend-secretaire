import { useState, useRef, useEffect } from 'react';
import { Search, BedDouble, CheckCircle2, ArrowRight, FolderOpen, LogOut, AlertTriangle } from 'lucide-react';
import Badge, { statusBadge } from '../../../components/ui/Badge/Badge';
import { useNavigation } from '../../../context/NavigationContext';
import type { Admission, AdmissionStatus } from '../../../types/index';
import { patientsData, type Patient } from '../../../services/patients';

// ── Couleurs avatars ──────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  { from: '#60a5fa', to: '#06b6d4' },
  { from: '#34d399', to: '#14b8a6' },
  { from: '#a78bfa', to: '#6366f1' },
  { from: '#f472b6', to: '#fb7185' },
  { from: '#fbbf24', to: '#f97316' },
];

function getAvatarGradient(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  const c = AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  return `linear-gradient(135deg, ${c.from}, ${c.to})`;
}

// ── Statut dérivé ─────────────────────────────────────────────────────────────

function deriveStatus(sejours: NonNullable<Patient['sejours']>): AdmissionStatus {
  if (sejours.length === 0) return 'active';
  const dernierSejour = sejours[sejours.length - 1];
  if (!dernierSejour.dateSortie) return 'active';
  const mode = (dernierSejour.modeSortie ?? '').toLowerCase();
  if (mode.includes('transfert') || mode.includes('evacuation')) return 'transferred';
  return 'discharged';
}

function toRow(p: Patient): Admission {
  const sejours    = p.sejours ?? [];
  const dernier    = sejours[sejours.length - 1];
  const dernierMvt = dernier?.mouvements?.[dernier.mouvements.length - 1];

  return {
    id:                    dernier?.id ?? `no-sejour-${p.id}`,
    patientId:             p.id,
    patientName:           `${p.prenom} ${p.nom}`,
    admissionDate:         dernier?.dateAdmission ?? p.createdAt,
    expectedDischargeDate: dernier?.dateSortie ?? undefined,
    department:            dernierMvt?.serviceArrivee ?? dernier?.modeEntree ?? '—',
    room:                  dernierMvt?.numeroChambre  ?? '—',
    bed:                   dernierMvt?.numeroLit      ?? '—',
    doctorId:              '',
    doctorName:            '—',
    reason:                dernier?.motifHospitalisation ?? dernier?.modeEntree ?? '—',
    status:                deriveStatus(sejours),
  };
}

// ── Stats ─────────────────────────────────────────────────────────────────────

function statsOf(rows: Admission[]) {
  const moisCourant = new Date().toISOString().slice(0, 7);
  return {
    actifs:     rows.filter(r => r.status === 'active').length,
    transferes: rows.filter(r => r.status === 'transferred').length,
    Hospitalises: rows.filter(r => r.status === 'hospitalised').length,
    sortisMois: rows.filter(r =>
      r.status === 'discharged' &&
      r.expectedDischargeDate?.slice(0, 7) === moisCourant,
    ).length,
  };
}

// ── Composant ─────────────────────────────────────────────────────────────────

export default function AdmissionList() {
  const { navigate } = useNavigation();

  const [allRows,  setAllRows]  = useState<Admission[]>([]);
  const [initLoad, setInitLoad] = useState(true);
  const [initErr,  setInitErr]  = useState<string | null>(null);

  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState<AdmissionStatus | 'all'>('all');
  const [searchRows,   setSearchRows]   = useState<Admission[]>([]);
  const [searching,    setSearching]    = useState(false);
  const [searched,     setSearched]     = useState(false);
  const [searchErr,    setSearchErr]    = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    patientsData.findAll()
      .then(patients => setAllRows(patients.map(toRow)))
      .catch(() => setInitErr('Impossible de charger la liste des patients.'))
      .finally(() => setInitLoad(false));
  }, []);

  const runSearch = async (q: string) => {
    if (!q.trim()) return;
    setSearching(true);
    setSearchErr(null);
    try {
      const patients = await patientsData.rechercher(q.trim());
      setSearchRows(patients.map(toRow));
      setSearched(true);
    } catch (err: unknown) {
      setSearchErr((err as Error)?.message ?? 'Erreur lors de la recherche.');
    } finally {
      setSearching(false);
    }
  };

  const handleChange = (val: string) => {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length >= 2) {
      debounceRef.current = setTimeout(() => runSearch(val), 400);
    } else if (!val.trim()) {
      setSearched(false);
      setSearchRows([]);
      setSearchErr(null);
    }
  };

  const baseRows = searched ? searchRows : allRows;

  const visibleRows = baseRows.filter(r => {
    if (statusFilter === 'all') return searched ? true : r.status !== 'discharged';
    return r.status === statusFilter;
  });

  const stats = statsOf(allRows);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {[
          { label: 'Patients actifs', value: stats.actifs,     icon: <BedDouble size={16} />,    kpi: 'adm-kpi-blue'   },
          { label: 'Transférés',      value: stats.transferes, icon: <ArrowRight size={16} />,   kpi: 'adm-kpi-orange' },
          { label: 'Hospitalisés',    value: stats.Hospitalises, icon: <ArrowRight size={16} />,     kpi: 'adm-kpi-purple' },
          { label: 'Sorties ce mois', value: stats.sortisMois, icon: <CheckCircle2 size={16} />, kpi: 'adm-kpi-green'  },
        ].map(s => (
          <div key={s.label} className={`adm-kpi ${s.kpi}`}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <p className="adm-kpi-lbl" style={{ marginBottom: 0 }}>{s.label}</p>
              <span style={{ opacity: 0.6 }}>{s.icon}</span>
            </div>
            <div className="adm-kpi-val">{initLoad ? '…' : s.value}</div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="adm-card">

        {/* Filters */}
        <div className="adm-card-head" style={{ gap: '10px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '8px', flex: 1, flexWrap: 'wrap' }}>
            <div className="adm-search" style={{ flex: 1, minWidth: '200px', maxWidth: '900px' }}>
              <span className="adm-search-icon">
                {searching
                  ? <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--c-bdr)', borderTopColor: 'var(--c-primary)', animation: 'spin 0.7s linear infinite' }} />
                  : <Search size={14} />}
              </span>
              <input
                type="text"
                placeholder="Rechercher par nom ou IPP..."
                value={search}
                onChange={e => handleChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && runSearch(search)}
                className="adm-search-input"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as AdmissionStatus | 'all')}
              className="adm-input"
              style={{ minWidth: '200px', padding: '6px 10px' }}
            >
              <option value="all">Tous</option>
              <option value="active">Actif</option>
              <option value="transferred">Transféré</option>
              <option value="hospitalised">Hospitalisé</option>
              <option value="discharged">Sorti</option>
            </select>
          </div>
        </div>

        {/* Erreurs */}
        {(initErr || searchErr) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', color: '#ef4444', fontSize: '13px' }}>
            <AlertTriangle size={14} /> {initErr ?? searchErr}
          </div>
        )}

        {/* Loading */}
        {initLoad && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px', gap: '10px', color: 'var(--c-t3)', fontSize: '13px' }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--c-bdr)', borderTopColor: 'var(--c-primary)', animation: 'spin 0.7s linear infinite' }} />
            Chargement des patients…
          </div>
        )}

        {/* Tableau */}
        {!initLoad && (
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
                {visibleRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--c-t3)' }}>
                      {searched ? 'Aucun résultat pour cette recherche.' : 'Aucun patient actif hospiitalisé ou transféré.'}
                    </td>
                  </tr>
                ) : visibleRows.map((adm, idx) => {
                  const { variant, label } = statusBadge(adm.status);
                  const days = adm.status === 'active'
                    ? Math.floor((Date.now() - new Date(adm.admissionDate).getTime()) / 86_400_000)
                    : null;
                  const rowBg = idx % 2 !== 0 ? 'rgba(99,102,241,0.04)' : 'transparent';

                  return (
                    <tr key={adm.id} style={{ background: rowBg }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="adm-avatar-sm" style={{ background: getAvatarGradient(adm.patientId) }}>
                            {adm.patientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <button onClick={() => navigate('patient-detail', adm.patientId)} className="adm-link-btn">
                              {adm.patientName}
                            </button>
                            {days !== null && <p className="adm-cell-mono">{days} jour{days > 1 ? 's' : ''}</p>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <p className="adm-cell-name">{adm.department}</p>
                        <p className="adm-cell-mono">Salle {adm.room} · Lit {adm.bed}</p>
                      </td>
                      <td>
                        <span className="adm-cell-mono" style={{ fontSize: '12px', color: 'var(--c-t1)' }}>
                          {adm.doctorName}
                        </span>
                      </td>
                      <td>
                        <span className="adm-cell-mono">
                          {new Date(adm.admissionDate).toLocaleDateString('fr-FR')}
                        </span>
                      </td>
                      <td>
                        <span className="adm-cell-mono">
                          {adm.expectedDischargeDate
                            ? new Date(adm.expectedDischargeDate).toLocaleDateString('fr-FR')
                            : '—'}
                        </span>
                      </td>
                      <td>
                        <span className="adm-cell-mono adm-text-truncate" style={{ maxWidth: '140px', display: 'block' }}>
                          {adm.reason}
                        </span>
                      </td>
                      <td><Badge variant={variant}>{label}</Badge></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => navigate('patient-file', adm.patientId)}
                            title="Compléter le dossier patient"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '6px', border: '1px solid var(--c-bdr)', background: 'var(--c-bg2)', color: 'var(--c-primary)', cursor: 'pointer', transition: 'background 0.15s, color 0.15s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--c-primary)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--c-bg2)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--c-primary)'; }}
                          >
                            <FolderOpen size={14} />
                          </button>
                          <button
                            onClick={() => navigate('admission-discharge', adm.id)}
                            title="Enregistrer le dossier"
                            disabled={adm.status !== 'active'}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '6px', border: '1px solid var(--c-bdr)', background: 'var(--c-bg2)', color: adm.status === 'active' ? '#ef4444' : 'var(--c-t3)', cursor: adm.status === 'active' ? 'pointer' : 'not-allowed', opacity: adm.status === 'active' ? 1 : 0.4, transition: 'background 0.15s, color 0.15s' }}
                            onMouseEnter={e => { if (adm.status !== 'active') return; (e.currentTarget as HTMLButtonElement).style.background = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--c-bg2)'; (e.currentTarget as HTMLButtonElement).style.color = adm.status === 'active' ? '#ef4444' : 'var(--c-t3)'; }}
                          >
                            <LogOut size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}