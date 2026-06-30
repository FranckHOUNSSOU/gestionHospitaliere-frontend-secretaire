import { useState, useRef, useEffect } from 'react';
import { Search, BedDouble, CheckCircle2, ArrowRight, FolderOpen, LogOut, AlertTriangle, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import Badge, { statusBadge } from '../../../components/ui/Badge/Badge';
import { useNavigation } from '../../../context/NavigationContext';
import { getPatient } from '../../../services/getPatient';
import AdmissionListModalModifier from './AdmissionListModalModifier';
import AdmissionListModalConfirmSuppr from './AdmissionListModalConfirmSuppr';
import AdmissionListModalSortie from './AdmissionListModalSortie';

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

function deriveStatus(sejours: any[]): string {
  if (sejours.length === 0) return 'active';
  const dernierSejour = sejours[sejours.length - 1];
  if (!dernierSejour.dateSortie) return 'active';
  const mode = (dernierSejour.modeSortie ?? '').toLowerCase();
  if (mode.includes('transfert') || mode.includes('evacuation')) return 'transferred';
  return 'discharged';
}

function toRow(p: any): any {
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
    doctorName:            dernier?.medecinResponsable?.user
      ? `Dr. ${dernier.medecinResponsable.user.prenom} ${dernier.medecinResponsable.user.nom}`
      : '—',
    reason:                dernier?.motifHospitalisation ?? dernier?.modeEntree ?? '—',
    status:                deriveStatus(sejours),
    typeSejour:            dernier?.typeSejour ?? undefined,
  };
}

function statsOf(rows: any[]) {
  const moisCourant = new Date().toISOString().slice(0, 7);
  return {
    actifs:       rows.filter(r => r.status === 'active').length,
    transferes:   rows.filter(r => r.status === 'transferred').length,
    Hospitalises: rows.filter(r => r.status === 'hospitalised').length,
    sortisMois:   rows.filter(r =>
      r.status === 'discharged' &&
      r.expectedDischargeDate?.slice(0, 7) === moisCourant,
    ).length,
  };
}

export default function AdmissionList() {
  const { navigate } = useNavigation();
  const [sortieModal,   setSortieModal]   = useState(null as any);
  const [modifierModal, setModifierModal] = useState(null as any);
  const [supprModal,    setSupprModal]    = useState(null as any);
  const [menuOuvert,    setMenuOuvert]    = useState(null as any);

  const [allRows,  setAllRows]  = useState<any[]>([]);
  const [initLoad, setInitLoad] = useState(true);
  const [initErr,  setInitErr]  = useState(null as any);

  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchRows,   setSearchRows]   = useState<any[]>([]);
  const [searching,    setSearching]    = useState(false);
  const [searched,     setSearched]     = useState(false);
  const [searchErr,    setSearchErr]    = useState(null as any);

  const debounceRef = useRef(null as any);

  useEffect(() => {
    getPatient.findAll()
      .then((patients: any[]) => setAllRows(patients.map(toRow) as any))
      .catch(() => setInitErr('Impossible de charger la liste des patients.'))
      .finally(() => setInitLoad(false));
  }, []);

  const runSearch = async (q: string) => {
    if (!q.trim()) return;
    setSearching(true);
    setSearchErr(null);
    try {
      const patients = await getPatient.rechercher(q.trim());
      setSearchRows((patients as any[]).map(toRow) as any);
      setSearched(true);
    } catch (err: any) {
      setSearchErr(err?.message ?? 'Erreur lors de la recherche.');
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

  const baseRows    = searched ? searchRows : allRows;
  const visibleRows = (baseRows as any[]).filter((r: any) => {
    if (statusFilter === 'all') return searched ? true : r.status !== 'discharged';
    return r.status === statusFilter;
  });
  const stats = statsOf(allRows);

  function refreshAll() {
    getPatient.findAll().then((ps: any[]) => setAllRows(ps.map(toRow) as any));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {[
          { label: 'Patients actifs', value: stats.actifs,       icon: <BedDouble size={16} />,    kpi: 'adm-kpi-blue'   },
          { label: 'Transférés',      value: stats.transferes,   icon: <ArrowRight size={16} />,   kpi: 'adm-kpi-orange' },
          { label: 'Hospitalisés',    value: stats.Hospitalises, icon: <ArrowRight size={16} />,   kpi: 'adm-kpi-purple' },
          { label: 'Sorties ce mois', value: stats.sortisMois,   icon: <CheckCircle2 size={16} />, kpi: 'adm-kpi-green'  },
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

      <div className="adm-card">
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
              onChange={e => setStatusFilter(e.target.value)}
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

        {(initErr || searchErr) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', color: '#ef4444', fontSize: '13px' }}>
            <AlertTriangle size={14} /> {initErr ?? searchErr}
          </div>
        )}

        {initLoad && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px', gap: '10px', color: 'var(--c-t3)', fontSize: '13px' }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--c-bdr)', borderTopColor: 'var(--c-primary)', animation: 'spin 0.7s linear infinite' }} />
            Chargement des patients…
          </div>
        )}

        {!initLoad && (
          <div style={{ overflowX: 'auto' }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Service / Salle</th>
                  <th>Médecin</th>
                  <th>Type</th>
                  <th>Entrée</th>
                  {statusFilter === 'discharged' && <th>Sortie le</th>}
                  <th>Motif</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: 'var(--c-t3)' }}>
                      {searched ? 'Aucun résultat pour cette recherche.' : 'Aucun patient actif hospitalisé ou transféré.'}
                    </td>
                  </tr>
                ) : visibleRows.map((adm: any, idx: number) => {
                  const { variant, label } = statusBadge(adm.status);
                  const days = adm.status === 'active'
                    ? Math.floor((Date.now() - new Date(adm.admissionDate).getTime()) / 86_400_000)
                    : null;
                  const heures = (Date.now() - new Date(adm.admissionDate).getTime()) / 3_600_000;
                  const consultationOubliee = adm.status === 'active'
                    && adm.typeSejour === 'Consultation'
                    && heures > 12;
                  const rowBg = consultationOubliee
                    ? 'rgba(251,191,36,0.08)'
                    : idx % 2 !== 0 ? 'rgba(99,102,241,0.04)' : 'transparent';

                  return (
                    <tr key={adm.id} style={{ background: rowBg }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="adm-avatar-sm" style={{ background: getAvatarGradient(adm.patientId) }}>
                            {adm.patientName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
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
                        {adm.typeSejour ? (
                          <span style={{
                            fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                            background: adm.typeSejour === 'Hospitalisation' ? '#eff6ff' : adm.typeSejour === 'Consultation' ? '#f0fdf4' : '#fef2f2',
                            color:      adm.typeSejour === 'Hospitalisation' ? '#1d4ed8' : adm.typeSejour === 'Consultation' ? '#166534' : '#dc2626',
                          }}>
                            {adm.typeSejour}
                          </span>
                        ) : <span style={{ color: 'var(--c-t3)', fontSize: 12 }}>—</span>}
                      </td>
                      <td>
                        <span className="adm-cell-mono">
                          {new Date(adm.admissionDate).toLocaleDateString('fr-FR')}
                        </span>
                      </td>
                      {statusFilter === 'discharged' && (
                        <td>
                          <span className="adm-cell-mono" style={{ color: '#059669' }}>
                            {adm.expectedDischargeDate
                              ? new Date(adm.expectedDischargeDate).toLocaleDateString('fr-FR')
                              : '—'}
                          </span>
                        </td>
                      )}
                      <td>
                        <span className="adm-cell-mono adm-text-truncate" style={{ maxWidth: '140px', display: 'block' }}>
                          {adm.reason}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <Badge variant={variant}>{label}</Badge>
                          {consultationOubliee && (
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#92400e', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 4, padding: '1px 6px', whiteSpace: 'nowrap' }}>
                              ⚠ Sortie non enregistrée
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, position: 'relative' }}>
                          <button
                            onClick={() => navigate('patient-file', adm.patientId, adm.status === 'discharged' ? { synthese: true } : undefined)}
                            title={adm.status === 'discharged' ? 'Voir la synthèse' : 'Voir le dossier'}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, border: '1px solid var(--c-bdr)', background: 'var(--c-bg2)', color: 'var(--c-primary)', cursor: 'pointer' }}>
                            <FolderOpen size={13} />
                          </button>
                          {adm.status === 'active' && (
                            <button onClick={() => setSortieModal({ sejourId: adm.id, patientName: adm.patientName })} title="Enregistrer la sortie"
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, border: '1px solid var(--c-bdr)', background: 'var(--c-bg2)', color: '#ef4444', cursor: 'pointer' }}>
                              <LogOut size={13} />
                            </button>
                          )}
                          {adm.status !== 'discharged' && (
                            <div style={{ position: 'relative' }}>
                              <button onClick={() => setMenuOuvert(menuOuvert === adm.id ? null : adm.id)} title="Plus d'actions"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, border: '1px solid var(--c-bdr)', background: 'var(--c-bg2)', color: 'var(--c-t2)', cursor: 'pointer' }}>
                                <MoreVertical size={13} />
                              </button>
                              {menuOuvert === adm.id && (
                                <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, zIndex: 100, background: 'var(--c-bg)', border: '1px solid var(--c-bdr)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', minWidth: 150, overflow: 'hidden' }}
                                  onMouseLeave={() => setMenuOuvert(null)}>
                                  <button onClick={() => { setMenuOuvert(null); setModifierModal(adm); }}
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--c-t1)' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--c-surf2)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                                    <Edit2 size={12} /> Modifier
                                  </button>
                                  <button onClick={() => { setMenuOuvert(null); setSupprModal(adm); }}
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#dc2626' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#fee2e2')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                                    <Trash2 size={12} /> Supprimer
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
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

      {sortieModal && (
        <AdmissionListModalSortie
          sejourId={sortieModal.sejourId}
          patientName={sortieModal.patientName}
          onClose={() => setSortieModal(null)}
          onDone={() => { setSortieModal(null); refreshAll(); }}
        />
      )}
      {modifierModal && (
        <AdmissionListModalModifier
          adm={modifierModal}
          onClose={() => setModifierModal(null)}
          onDone={() => { setModifierModal(null); refreshAll(); }}
        />
      )}
      {supprModal && (
        <AdmissionListModalConfirmSuppr
          adm={supprModal}
          onClose={() => setSupprModal(null)}
          onDone={() => { setSupprModal(null); refreshAll(); }}
        />
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
