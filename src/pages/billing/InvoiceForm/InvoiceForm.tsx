import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Search, X, Printer, Loader2, Building2, Stethoscope, FlaskConical, HeartPulse } from 'lucide-react';
import { useNavigation } from '../../../context/NavigationContext';
import { patientsData, type Patient } from '../../../services/patients';
import { getApercuFacture, type ApercuFacture } from '../../../services/facturationService';

function fmt(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA';
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function fmtDateHeure(s: string) {
  return new Date(s).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/* ── Section de la facture ─────────────────────────────────────────────────── */
function Section({ icon, title, children, total, color = '#0ea5e9' }: {
  icon: React.ReactNode; title: string; children: React.ReactNode; total: number; color?: string;
}) {
  return (
    <div className="adm-form-section" style={{ breakInside: 'avoid' }}>
      <div className="adm-form-section-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color }}>{icon}</span>
          <p className="adm-card-title">{title}</p>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>
          {fmt(total)}
        </span>
      </div>
      <div className="adm-form-section-body">
        {children}
      </div>
    </div>
  );
}

function TableLigne({ cols }: { cols: (string | number)[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', gap: 8, padding: '7px 10px', borderBottom: '1px solid var(--c-bdr)', fontSize: 12, color: 'var(--c-t1)' }}>
      {cols.map((c, i) => (
        <span key={i} style={{ textAlign: i === 0 ? 'left' : 'right', fontVariantNumeric: 'tabular-nums' }}>
          {typeof c === 'number' ? c.toLocaleString('fr-FR') : c}
        </span>
      ))}
    </div>
  );
}

function TableHeader({ cols }: { cols: string[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', gap: 8, padding: '6px 10px', background: 'var(--c-surf2)', borderRadius: '6px 6px 0 0', fontSize: 11, fontWeight: 600, color: 'var(--c-t3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
      {cols.map((c, i) => <span key={i} style={{ textAlign: i === 0 ? 'left' : 'right' }}>{c}</span>)}
    </div>
  );
}

function TableVide() {
  return <p style={{ fontSize: 12, color: 'var(--c-t3)', margin: '10px 0', fontStyle: 'italic' }}>Aucune prestation</p>;
}

/* ══════════════════════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ══════════════════════════════════════════════════════════════════════════════ */
export default function InvoiceForm() {
  const { navigate } = useNavigation();

  // Recherche patient
  const [query,         setQuery]         = useState('');
  const [results,       setResults]       = useState<Patient[]>([]);
  const [searching,     setSearching]     = useState(false);
  const [showDropdown,  setShowDropdown]  = useState(false);
  const [patient,       setPatient]       = useState<Patient | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Facture
  const [apercu,   setApercu]   = useState<ApercuFacture | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [erreur,   setErreur]   = useState<string | null>(null);

  // Fermer dropdown au clic extérieur
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Recherche debounce
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

  async function selectPatient(p: Patient) {
    setPatient(p);
    setQuery(`${p.prenom} ${p.nom} — ${p.numeroIpp}`);
    setShowDropdown(false);
    setLoading(true); setErreur(null);
    try {
      const r = await getApercuFacture(p.id);
      setApercu(r.data);
    } catch {
      setErreur('Impossible de charger les données de facturation.');
    } finally { setLoading(false); }
  }

  function clearPatient() {
    setPatient(null); setQuery(''); setResults([]); setApercu(null); setErreur(null);
  }

  function handlePrint() { window.print(); }

  return (
    <>
      {/* CSS impression */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #facture-print, #facture-print * { visibility: visible; }
          #facture-print { position: absolute; top: 0; left: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* En-tête */}
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('billing')} className="adm-back-btn"><ArrowLeft size={16} /></button>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-t0)', margin: 0 }}>Nouvelle facture</p>
            <p style={{ fontSize: 12, color: 'var(--c-t2)', margin: '2px 0 0' }}>Rechercher un patient pour générer automatiquement sa facture</p>
          </div>
        </div>

        {/* Recherche patient */}
        <div className="adm-form-section no-print">
          <div className="adm-form-section-head">
            <p className="adm-card-title">Sélectionner le patient</p>
          </div>
          <div className="adm-form-section-body">
            <div ref={dropdownRef} style={{ position: 'relative', maxWidth: 480 }}>
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
                  onChange={e => { setPatient(null); setQuery(e.target.value); }}
                  onFocus={() => results.length > 0 && setShowDropdown(true)}
                />
                {query && (
                  <button onClick={clearPatient} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-t3)', display: 'flex' }}>
                    <X size={13} />
                  </button>
                )}
              </div>

              {showDropdown && results.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: 'var(--c-bg)', border: '1px solid var(--c-bdr)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', marginTop: 4, maxHeight: 240, overflowY: 'auto' }}>
                  {results.map(p => (
                    <div key={p.id} onMouseDown={() => selectPatient(p)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--c-bdr)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--c-surf2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg,#60a5fa,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {p.prenom[0]}{p.nom[0]}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>{p.prenom} {p.nom}</p>
                        <p style={{ margin: 0, fontSize: 11, color: 'var(--c-t3)' }}>
                          {p.numeroIpp}{p.dateNaissance && ` · ${new Date(p.dateNaissance).toLocaleDateString('fr-FR')}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chargement */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 24, color: 'var(--c-t3)', fontSize: 13 }}>
            <Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} />
            Génération de la facture en cours…
          </div>
        )}

        {/* Erreur */}
        {erreur && <div className="adm-alert adm-alert-error">{erreur}</div>}

        {/* ── FACTURE ── */}
        {apercu && !loading && (
          <div id="facture-print">

            {/* En-tête facture */}
            <div className="adm-card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--c-t0)' }}>FACTURE MÉDICALE</p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--c-t3)' }}>Générée le {fmtDate(apercu.genereLe)}</p>
                </div>
                <button onClick={handlePrint} className="adm-btn adm-btn-primary no-print" style={{ height: 36, gap: 6 }}>
                  <Printer size={14} /> Imprimer
                </button>
              </div>

              <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--c-surf2)', borderRadius: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
                  {[
                    { k: 'Patient',       v: `${apercu.patient.prenom} ${apercu.patient.nom}` },
                    { k: 'N° IPP',        v: apercu.patient.numeroIpp },
                    { k: 'Date naissance',v: fmtDate(apercu.patient.dateNaissance) },
                  ].map(({ k, v }) => (
                    <div key={k}>
                      <p style={{ margin: 0, fontSize: 10, color: 'var(--c-t3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 600, color: 'var(--c-t0)' }}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Hospitalisation ── */}
            <Section icon={<Building2 size={15} />} title="Hospitalisation" total={apercu.totalHospitalisation} color="#7c3aed">
              {apercu.lignesHospitalisation.length === 0 ? <TableVide /> : (
                <>
                  <TableHeader cols={['Description', 'Jours', 'Prix/jour', 'Total']} />
                  {apercu.lignesHospitalisation.map((l, i) => (
                    <TableLigne key={i} cols={[l.description, l.jours, l.prixJour, l.total]} />
                  ))}
                </>
              )}
            </Section>

            {/* ── Consultations / RDV ── */}
            <Section icon={<Stethoscope size={15} />} title="Consultations et rendez-vous" total={apercu.totalConsultations} color="#0ea5e9">
              {apercu.consultations.length === 0 ? <TableVide /> : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', gap: 8, padding: '6px 10px', background: 'var(--c-surf2)', borderRadius: '6px 6px 0 0', fontSize: 11, fontWeight: 600, color: 'var(--c-t3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <span>Type / Médecin</span><span style={{ textAlign: 'right' }}>Date</span>
                    <span style={{ textAlign: 'right' }}>Statut</span><span style={{ textAlign: 'right' }}>Tarif</span>
                  </div>
                  {apercu.consultations.map(c => (
                    <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', gap: 8, padding: '7px 10px', borderBottom: '1px solid var(--c-bdr)', fontSize: 12, color: 'var(--c-t1)' }}>
                      <div>
                        <span style={{ fontWeight: 600 }}>{c.type}</span>
                        <span style={{ color: 'var(--c-t3)', marginLeft: 6 }}>{c.medecin}</span>
                      </div>
                      <span style={{ textAlign: 'right' }}>{new Date(c.dateHeure).toLocaleDateString('fr-FR')}</span>
                      <span style={{ textAlign: 'right' }}>{c.statut}</span>
                      <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{c.tarif.toLocaleString('fr-FR')}</span>
                    </div>
                  ))}
                </>
              )}
            </Section>

            {/* ── Examens ── */}
            {apercu.sejours.map(s => s.examens.length > 0 && (
              <Section key={`ex-${s.id}`} icon={<FlaskConical size={15} />}
                title={`Examens — Séjour du ${fmtDate(s.dateAdmission)}`}
                total={s.totalExamens} color="#059669">
                <TableHeader cols={['Description', '', '', 'Tarif']} />
                {s.examens.map(e => (
                  <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', gap: 8, padding: '7px 10px', borderBottom: '1px solid var(--c-bdr)', fontSize: 12, color: 'var(--c-t1)' }}>
                    <span>{e.description}</span>
                    <span /><span />
                    <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{e.tarif.toLocaleString('fr-FR')}</span>
                  </div>
                ))}
              </Section>
            ))}

            {/* ── Soins infirmiers ── */}
            {apercu.sejours.map(s => s.soins.length > 0 && (
              <Section key={`si-${s.id}`} icon={<HeartPulse size={15} />}
                title={`Soins infirmiers — Séjour du ${fmtDate(s.dateAdmission)}`}
                total={s.totalSoins} color="#d97706">
                <TableHeader cols={['Description', 'Date / Heure', '', 'Tarif']} />
                {s.soins.map(soin => (
                  <div key={soin.id} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', gap: 8, padding: '7px 10px', borderBottom: '1px solid var(--c-bdr)', fontSize: 12, color: 'var(--c-t1)' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{soin.description}</span>
                    <span style={{ textAlign: 'right', fontSize: 11, color: 'var(--c-t3)' }}>{fmtDateHeure(soin.dateHeure)}</span>
                    <span />
                    <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{soin.tarif.toLocaleString('fr-FR')}</span>
                  </div>
                ))}
              </Section>
            ))}

            {/* ── Total général ── */}
            <div className="adm-card" style={{ padding: '16px 20px' }}>
              <div style={{ maxWidth: 380, marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Hospitalisation',   value: apercu.totalHospitalisation,  color: '#7c3aed' },
                  { label: 'Consultations',      value: apercu.totalConsultations,    color: '#0ea5e9' },
                  { label: 'Examens',            value: apercu.totalExamens,          color: '#059669' },
                  { label: 'Soins infirmiers',   value: apercu.totalSoins,            color: '#d97706' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--c-t2)' }}>{label}</span>
                    <span style={{ color, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{fmt(value)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--c-bdr)', paddingTop: 10, marginTop: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--c-t0)' }}>TOTAL GÉNÉRAL</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--c-accent)', fontVariantNumeric: 'tabular-nums' }}>
                    {fmt(apercu.totalGeneral)}
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </>
  );
}
