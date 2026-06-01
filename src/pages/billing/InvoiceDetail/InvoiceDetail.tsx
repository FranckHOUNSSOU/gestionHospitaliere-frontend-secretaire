import './InvoiceDetail.css';
import { useState, useEffect } from 'react';
import { ArrowLeft, Printer, Loader2 } from 'lucide-react';
import { useNavigation } from '../../../context/NavigationContext';
import { getApercuFacture, type ApercuFacture } from '../../../services/facturationService';

function fmt(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA';
}

function fmtDate(s?: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function fmtDateHeure(s: string) {
  return new Date(s).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/* ── Ligne de tableau ──────────────────────────────────────────────────────── */
function TRow({ cols, cols4 = true }: { cols: (string | number)[]; cols4?: boolean }) {
  const tpl = cols4 ? '3fr 1fr 1fr 1fr' : '3fr 0 0 1fr';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: tpl, gap: 8, padding: '7px 10px', borderBottom: '1px solid var(--c-bdr)', fontSize: 12, color: 'var(--c-t1)' }}>
      {cols.map((c, i) => (
        <span key={i} style={{ textAlign: i === 0 ? 'left' : 'right', fontVariantNumeric: 'tabular-nums' }}>
          {typeof c === 'number' ? c.toLocaleString('fr-FR') : c}
        </span>
      ))}
    </div>
  );
}

function THead({ cols }: { cols: string[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', gap: 8, padding: '6px 10px', background: 'var(--c-surf2)', borderRadius: '6px 6px 0 0', fontSize: 10, fontWeight: 700, color: 'var(--c-t3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {cols.map((c, i) => <span key={i} style={{ textAlign: i === 0 ? 'left' : 'right' }}>{c}</span>)}
    </div>
  );
}

function SectionTitle({ color, title, total }: { color: string; title: string; total: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: color + '18', borderLeft: `3px solid ${color}`, borderRadius: 4, marginBottom: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color }}>{fmt(total)}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   PAGE PRINCIPALE
   ══════════════════════════════════════════════════════════════════════════════ */
export default function InvoiceDetail() {
  const { navigate, nav } = useNavigation();
  const patientId = nav.selectedId;

  const [apercu,  setApercu]  = useState<ApercuFacture | null>(null);
  const [loading, setLoading] = useState(true);
  const [erreur,  setErreur]  = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) { setLoading(false); return; }
    setLoading(true);
    getApercuFacture(patientId)
      .then(r => setApercu(r.data))
      .catch(() => setErreur('Impossible de charger la facture.'))
      .finally(() => setLoading(false));
  }, [patientId]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 32, color: 'var(--c-t3)' }}>
      <Loader2 size={18} style={{ animation: 'spin 0.7s linear infinite' }} /> Chargement de la facture…
    </div>
  );

  if (erreur || !apercu) return (
    <div>
      <button onClick={() => navigate('billing-new')} className="adm-back-btn" style={{ marginBottom: 16 }}><ArrowLeft size={16} /></button>
      <div className="adm-alert adm-alert-error">{erreur ?? 'Patient introuvable.'}</div>
    </div>
  );

  const p         = apercu.patient as any;
  const sejour    = apercu.sejours?.[0];
  const service   = sejour?.service ?? '—';
  const couv      = p.couvertureSociale;

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .adm-layout-sidebar, .adm-topbar, .adm-layout-nav { display: none !important; }
          #facture-print { padding: 0 !important; }
        }
      `}</style>

      {/* Boutons hors impression */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={() => navigate('billing-new')} className="adm-back-btn"><ArrowLeft size={16} /></button>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: 'var(--c-t0)' }}>Facture — {apercu.patient.prenom} {apercu.patient.nom}</p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--c-t2)' }}>IPP : {apercu.patient.numeroIpp}</p>
        </div>
        <button onClick={() => window.print()} className="adm-btn adm-btn-primary" style={{ height: 36, gap: 6 }}>
          <Printer size={14} /> Imprimer
        </button>
      </div>

      {/* ── DOCUMENT IMPRIMABLE ── */}
      <div id="facture-print" style={{ background: 'white', padding: '20px 28px', borderRadius: 8, border: '1px solid var(--c-bdr)', fontFamily: 'Arial, sans-serif' }}>

        {/* ══ EN-TÊTE OFFICIEL ══ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr 1fr', gap: 12, alignItems: 'center', paddingBottom: 14, borderBottom: '2px solid #1e3a5f', marginBottom: 12 }}>

          {/* Gauche — Armoiries + Ministère */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textAlign: 'center' }}>
            <img
              src="/armoiries-benin.png"
              alt="Armoiries du Bénin"
              style={{ height: 64, objectFit: 'contain' }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: '#1e3a5f', lineHeight: 1.4 }}>
              MINISTÈRE DE LA SANTÉ<br />
              <span style={{ fontWeight: 400 }}>République du Bénin</span>
            </p>
          </div>

          {/* Centre — Nom de l'établissement */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: '#1e3a5f', lineHeight: 1.5, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              CENTRE HOSPITALIER UNIVERSITAIRE<br />
              DE LA MÈRE ET DE L'ENFANT-LAGUNE
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 13, fontWeight: 900, color: '#1e3a5f', letterSpacing: '0.1em' }}>
              (CHU-MEL) ★★★★★
            </p>
          </div>

          {/* Droite — Logo CHU-MEL */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img src="/chuMel-logo.png" alt="CHU-MEL" style={{ height: 70, objectFit: 'contain' }} />
          </div>
        </div>

        {/* ══ TITRE FACTURE ══ */}
        <div style={{ textAlign: 'center', margin: '10px 0 14px' }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#1e3a5f', textDecoration: 'underline', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            NOTE DE FRAIS D'HOSPITALISATION
          </p>
        </div>

        {/* ══ FORMATION SANITAIRE & SERVICE ══ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12, padding: '8px 10px', border: '1px solid #1e3a5f', borderRadius: 4 }}>
          <p style={{ margin: 0, fontSize: 11 }}><strong>FORMATION SANITAIRE :</strong> CHU-MEL</p>
          <p style={{ margin: 0, fontSize: 11 }}><strong>Service :</strong> {service}</p>
        </div>

        {/* ══ INFOS PATIENT ══ */}
        <div style={{ border: '1px solid #1e3a5f', borderRadius: 4, marginBottom: 14, overflow: 'hidden' }}>
          <div style={{ background: '#1e3a5f', padding: '5px 10px' }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Informations du patient</p>
          </div>
          <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
              <InfoField label="Nom" value={apercu.patient.nom} />
              <InfoField label="Prénom" value={apercu.patient.prenom} />
              <InfoField label="Date de naissance" value={fmtDate(apercu.patient.dateNaissance)} />
              <InfoField label="Sexe" value={p.sexe === 'M' ? 'Masculin' : p.sexe === 'F' ? 'Féminin' : p.sexe ?? '—'} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
              <InfoField label="Téléphone" value={p.telephone ?? '—'} />
              <InfoField label="Mode d'admission" value={sejour?.modeEntree ?? '—'} />
              <InfoField label="Date d'entrée" value={fmtDate(sejour?.dateAdmission)} />
              <InfoField label="Date de sortie" value={fmtDate(sejour?.dateSortie)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <InfoField
                label="Couverture sociale"
                value={couv ? `${couv.organisme} — ${couv.type} (N° ${couv.numero})` : 'Aucune'}
              />
              <InfoField label="Type de sortie" value={sejour?.modeSortie ?? '—'} />
            </div>
          </div>
        </div>

        {/* ══ HOSPITALISATION ══ */}
        {apercu.lignesHospitalisation.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <SectionTitle color="#4f46e5" title="Hospitalisation" total={apercu.totalHospitalisation} />
            <THead cols={['Description', 'Jours', 'Prix/jour', 'Total']} />
            {apercu.lignesHospitalisation.map((l, i) => (
              <TRow key={i} cols={[l.description, l.jours, l.prixJour, l.total]} />
            ))}
            <TotalLigne label="Sous-total hospitalisation" value={apercu.totalHospitalisation} color="#4f46e5" />
          </div>
        )}

        {/* ══ CONSULTATIONS / RDV ══ */}
        {apercu.consultations.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <SectionTitle color="#0284c7" title="Consultations et rendez-vous" total={apercu.totalConsultations} />
            <THead cols={['Type / Médecin', 'Date', 'Statut', 'Tarif']} />
            {apercu.consultations.map(c => (
              <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', gap: 8, padding: '7px 10px', borderBottom: '1px solid var(--c-bdr)', fontSize: 12, color: 'var(--c-t1)' }}>
                <span><strong>{c.type}</strong> <span style={{ color: 'var(--c-t3)', fontSize: 11 }}>{c.medecin}</span></span>
                <span style={{ textAlign: 'right' }}>{new Date(c.dateHeure).toLocaleDateString('fr-FR')}</span>
                <span style={{ textAlign: 'right' }}>{c.statut}</span>
                <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{c.tarif.toLocaleString('fr-FR')}</span>
              </div>
            ))}
            <TotalLigne label="Sous-total consultations" value={apercu.totalConsultations} color="#0284c7" />
          </div>
        )}

        {/* ══ EXAMENS ══ */}
        {apercu.totalExamens > 0 && apercu.sejours.some(s => s.examens.length > 0) && (
          <div style={{ marginBottom: 12 }}>
            <SectionTitle color="#059669" title="Examens" total={apercu.totalExamens} />
            {apercu.sejours.filter(s => s.examens.length > 0).map(s => (
              <div key={s.id}>
                <p style={{ fontSize: 10, color: 'var(--c-t3)', margin: '4px 10px', fontStyle: 'italic' }}>
                  Séjour du {fmtDate(s.dateAdmission)}
                </p>
                {s.examens.map(e => (
                  <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', gap: 8, padding: '7px 10px', borderBottom: '1px solid var(--c-bdr)', fontSize: 12, color: 'var(--c-t1)' }}>
                    <span>{e.description}</span>
                    <span /><span />
                    <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{e.tarif.toLocaleString('fr-FR')}</span>
                  </div>
                ))}
              </div>
            ))}
            <TotalLigne label="Sous-total examens" value={apercu.totalExamens} color="#059669" />
          </div>
        )}

        {/* ══ SOINS INFIRMIERS ══ */}
        {apercu.totalSoins > 0 && apercu.sejours.some(s => s.soins.length > 0) && (
          <div style={{ marginBottom: 12 }}>
            <SectionTitle color="#d97706" title="Soins infirmiers" total={apercu.totalSoins} />
            {apercu.sejours.filter(s => s.soins.length > 0).map(s => (
              <div key={s.id}>
                <p style={{ fontSize: 10, color: 'var(--c-t3)', margin: '4px 10px', fontStyle: 'italic' }}>
                  Séjour du {fmtDate(s.dateAdmission)}
                </p>
                {s.soins.map(soin => (
                  <div key={soin.id} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', gap: 8, padding: '7px 10px', borderBottom: '1px solid var(--c-bdr)', fontSize: 12, color: 'var(--c-t1)' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{soin.description}</span>
                    <span style={{ textAlign: 'right', fontSize: 11, color: 'var(--c-t3)' }}>{fmtDateHeure(soin.dateHeure)}</span>
                    <span />
                    <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{soin.tarif.toLocaleString('fr-FR')}</span>
                  </div>
                ))}
              </div>
            ))}
            <TotalLigne label="Sous-total soins infirmiers" value={apercu.totalSoins} color="#d97706" />
          </div>
        )}

        {/* ══ TOTAL GÉNÉRAL ══ */}
        <div style={{ border: '2px solid #1e3a5f', borderRadius: 4, padding: '12px 16px', marginTop: 8 }}>
          <div style={{ maxWidth: 400, marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: 7 }}>
            {[
              { label: 'Hospitalisation',  value: apercu.totalHospitalisation,  color: '#4f46e5' },
              { label: 'Consultations',    value: apercu.totalConsultations,    color: '#0284c7' },
              { label: 'Examens',          value: apercu.totalExamens,          color: '#059669' },
              { label: 'Soins infirmiers', value: apercu.totalSoins,            color: '#d97706' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#64748b' }}>{label}</span>
                <span style={{ color, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{fmt(value)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #1e3a5f', paddingTop: 10, marginTop: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TOTAL GÉNÉRAL</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: '#1e3a5f', fontVariantNumeric: 'tabular-nums' }}>
                {fmt(apercu.totalGeneral)}
              </span>
            </div>
          </div>
        </div>

        {/* ══ SIGNATURE ══ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 32 }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 600, marginBottom: 40, color: '#1e3a5f' }}>Le Responsable Financier</p>
            <div style={{ borderTop: '1px solid #1e3a5f', paddingTop: 4 }}>
              <p style={{ fontSize: 10, color: '#64748b', margin: 0 }}>Nom et Signature</p>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 600, marginBottom: 40, color: '#1e3a5f' }}>Le Patient / Tuteur</p>
            <div style={{ borderTop: '1px solid #1e3a5f', paddingTop: 4 }}>
              <p style={{ fontSize: 10, color: '#64748b', margin: 0 }}>Nom et Signature</p>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

/* ── Composants helpers ─────────────────────────────────────────────────────── */
function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ margin: 0, fontSize: 9, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
      <p style={{ margin: '2px 0 0', fontSize: 11, fontWeight: 600, color: '#1e293b' }}>{value}</p>
    </div>
  );
}

function TotalLigne({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, padding: '6px 10px', background: color + '0d', borderTop: `1px solid ${color}` }}>
      <span style={{ fontSize: 11, color, fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 12, color, fontWeight: 700, fontVariantNumeric: 'tabular-nums', minWidth: 100, textAlign: 'right' }}>{fmt(value)}</span>
    </div>
  );
}
