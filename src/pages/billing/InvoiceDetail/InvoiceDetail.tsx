import './InvoiceDetail.css';
import { useState, useEffect } from 'react';
import { ArrowLeft, Printer, Loader2 } from 'lucide-react';
import client from '../../../services/clients';
import { useNavigation } from '../../../context/NavigationContext';
import { getApercuFacture, type ApercuFacture } from '../../../services/facturationService';

function fmt(n: number) { return n.toLocaleString('fr-FR') + ' FCFA'; }

function fmtDate(s?: string | Date | null) {
  if (!s) return '—';
  const d = typeof s === 'string' ? new Date(s) : s;
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function fmtDateCourt(s?: string | Date | null) {
  if (!s) return '—';
  const d = typeof s === 'string' ? new Date(s) : s;
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/* ── Composants internes ─────────────────────────────────────────────────────── */
function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ margin: 0, fontSize: 9, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
      <p style={{ margin: '2px 0 0', fontSize: 11, fontWeight: 600, color: '#1e293b' }}>{value || '—'}</p>
    </div>
  );
}

function SectionHeader({ color, title, total }: { color: string; title: string; total: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 12px', background: color + '15', borderLeft: `3px solid ${color}`, marginBottom: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color }}>{fmt(total)}</span>
    </div>
  );
}

function THead({ cols, template = '3fr 1fr 1fr 1fr' }: { cols: string[]; template?: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: template, gap: 6, padding: '5px 10px', background: '#f1f5f9', fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {cols.map((c, i) => <span key={i} style={{ textAlign: i === 0 ? 'left' : 'right' }}>{c}</span>)}
    </div>
  );
}

function TRow({ cols, template = '3fr 1fr 1fr 1fr' }: { cols: (string | number)[]; template?: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: template, gap: 6, padding: '6px 10px', borderBottom: '1px solid #e2e8f0', fontSize: 11, color: '#334155' }}>
      {cols.map((c, i) => (
        <span key={i} style={{ textAlign: i === 0 ? 'left' : 'right', fontVariantNumeric: 'tabular-nums' }}>
          {typeof c === 'number' ? c.toLocaleString('fr-FR') : c}
        </span>
      ))}
    </div>
  );
}


function Vide() {
  return <p style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic', padding: '6px 10px', margin: 0 }}>Aucune prestation — 0 FCFA</p>;
}

/* ══════════════════════════════════════════════════════════════════════════════
   PAGE PRINCIPALE
   ══════════════════════════════════════════════════════════════════════════════ */
export default function InvoiceDetail() {
  const { navigate, nav } = useNavigation();
  const patientId = nav.selectedId;

  const [apercu,   setApercu]   = useState<ApercuFacture | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [erreur,   setErreur]   = useState<string | null>(null);
  const [printing, setPrinting] = useState(false);

  async function handlePrint() {
    if (!patientId || !apercu) return;
    setPrinting(true);
    try {
      await client.post(`/facturation/emettre/${patientId}`);
    } catch { /* erreur non bloquante */ }
    finally { setPrinting(false); }
    window.print();
  }

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
      <Loader2 size={18} style={{ animation: 'spin 0.7s linear infinite' }} /> Chargement…
    </div>
  );

  if (erreur || !apercu) return (
    <div>
      <button onClick={() => navigate('billing-new')} className="adm-back-btn" style={{ marginBottom: 16 }}><ArrowLeft size={16} /></button>
      <div className="adm-alert adm-alert-error">{erreur ?? 'Patient introuvable.'}</div>
    </div>
  );

  const p      = apercu.patient as any;
  const sejour = apercu.sejours?.[0];
  const couv   = p.couvertureSociale;

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media print {
          body * { visibility: hidden; }
          #facture-print, #facture-print * { visibility: visible; }
          #facture-print {
            position: absolute;
            top: 0; left: 0;
            width: 100%;
            padding: 20px 24px !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }
          @page { margin: 0; }
        }
      `}</style>

      {/* Barre d'actions */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={() => navigate('billing-new')} className="adm-back-btn"><ArrowLeft size={16} /></button>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: 'var(--c-t0)' }}>
            Facture — {apercu.patient.prenom} {apercu.patient.nom}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--c-t2)' }}>IPP : {apercu.patient.numeroIpp}</p>
        </div>
        <button onClick={handlePrint} disabled={printing} className="adm-btn adm-btn-primary" style={{ height: 36, gap: 6 }}>
          {printing
            ? <><Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> Enregistrement…</>
            : <><Printer size={14} /> Imprimer</>}
        </button>
      </div>

      {/* ══════════ DOCUMENT ══════════ */}
      <div id="facture-print" style={{ background: 'white', padding: '20px 28px', borderRadius: 8, border: '1px solid #e2e8f0', fontFamily: 'Arial, sans-serif' }}>

        {/* ── EN-TÊTE OFFICIEL ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr 1fr', gap: 8, alignItems: 'center', paddingBottom: 12, borderBottom: '2px solid #1e3a5f', marginBottom: 10 }}>

          {/* Gauche */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textAlign: 'center' }}>
            <img src="/benin_embleme.png" alt="Armoiries du Bénin" style={{ height: 115, objectFit: 'contain' }} />
            
          </div>

          {/* Centre */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: '#1e3a5f', lineHeight: 1.6, textTransform: 'uppercase' }}>
              CENTRE HOSPITALIER UNIVERSITAIRE<br />
              DE LA MÈRE ET DE L'ENFANT-LAGUNE <br />
              (CHU-MEL) <br />
              *****
            </p>
          </div>

          {/* Droite */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img src="/chuMel-logo.png" alt="CHU-MEL" style={{ height: 72, objectFit: 'contain' }} />
          </div>
        </div>

        {/* ── TITRE ── */}
        <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 800, color: '#1e3a5f', textDecoration: 'underline', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '8px 0 12px' }}>
          NOTE DE FRAIS D'HOSPITALISATION
        </p>

        {/* ── FORMATION SANITAIRE & SERVICE ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '7px 12px', border: '1px solid #1e3a5f', borderRadius: 3, marginBottom: 10, fontSize: 11 }}>
          <p style={{ margin: 0 }}><strong>FORMATION SANITAIRE :</strong> CHU-MEL</p>
          <p style={{ margin: 0 }}><strong>Service :</strong> {sejour?.service ?? '—'}</p>
        </div>

        {/* ── INFORMATIONS PATIENT ── */}
        <div style={{ border: '1px solid #1e3a5f', borderRadius: 3, marginBottom: 12, overflow: 'hidden' }}>
          <div style={{ background: '#1e3a5f', padding: '5px 12px' }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Informations du patient
            </p>
          </div>
          <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              <InfoField label="Nom" value={apercu.patient.nom} />
              <InfoField label="Prénom" value={apercu.patient.prenom} />
              <InfoField label="Date de naissance" value={fmtDate(apercu.patient.dateNaissance)} />
              <InfoField label="Sexe" value={p.sexe === 'M' ? 'Masculin' : p.sexe === 'F' ? 'Féminin' : p.sexe ?? '—'} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              <InfoField label="Téléphone" value={p.telephone ?? '—'} />
              <InfoField label="Mode d'admission" value={sejour?.modeEntree ?? '—'} />
              <InfoField label="Date d'entrée" value={fmtDate(sejour?.dateAdmission)} />
              <InfoField label="Date de sortie" value={fmtDate(sejour?.dateSortie)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              <InfoField
                label="Couverture sociale"
                value={couv ? `${couv.organisme} — ${couv.type} · N°${couv.numero}` : 'Aucune'}
              />
              <InfoField label="Type de sortie" value={sejour?.modeSortie ?? '—'} />
            </div>
          </div>
        </div>

        {/* ══ SECTION HOSPITALISATION ══ */}
        <div style={{ marginBottom: 10 }}>
          <SectionHeader color="#1e3a5f" title="Hospitalisation" total={apercu.totalHospitalisation} />
          {apercu.lignesHospitalisation.length === 0 ? <Vide /> : (
            <>
              <THead cols={['Description / Service / Chambre', 'Jours', 'Prix/jour', 'Montant']} />
              {apercu.lignesHospitalisation.map((l, i) => (
                <TRow key={i} cols={[l.description, l.jours, l.prixJour, l.total]} />
              ))}
            </>
          )}
        </div>

        {/* ══ SECTION CONSULTATIONS ══ */}
        <div style={{ marginBottom: 10 }}>
          <SectionHeader color="#1e3a5f" title="Consultations et rendez-vous" total={apercu.totalConsultations} />
          {apercu.consultations.length === 0 ? <Vide /> : (
            <>
              <THead cols={['Type / Médecin', 'Date', 'Statut', 'Tarif']} />
              {apercu.consultations.map(c => (
                <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', gap: 6, padding: '6px 10px', borderBottom: '1px solid #e2e8f0', fontSize: 11, color: '#334155' }}>
                  <span>
                    <strong>{c.type}</strong>
                    <span style={{ color: '#94a3b8', marginLeft: 6, fontSize: 10 }}>{c.medecin}</span>
                  </span>
                  <span style={{ textAlign: 'right' }}>{fmtDateCourt(c.dateHeure)}</span>
                  <span style={{ textAlign: 'right' }}>{c.statut}</span>
                  <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{c.tarif.toLocaleString('fr-FR')}</span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* ══ SECTION EXAMENS ══ */}
        <div style={{ marginBottom: 10 }}>
          <SectionHeader color="#1e3a5f" title="Examens" total={apercu.totalExamens} />
          {apercu.sejours.every(s => s.examens.length === 0) ? <Vide /> : (
            <>
              <THead cols={['Description', 'Séjour', '', 'Tarif']} />
              {apercu.sejours.flatMap(s =>
                s.examens.map(e => (
                  <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', gap: 6, padding: '6px 10px', borderBottom: '1px solid #e2e8f0', fontSize: 11, color: '#334155' }}>
                    <span>{e.description}</span>
                    <span style={{ textAlign: 'right', fontSize: 10, color: '#94a3b8' }}>{fmtDate(s.dateAdmission)}</span>
                    <span />
                    <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{e.tarif.toLocaleString('fr-FR')}</span>
                  </div>
                ))
              )}
            </>
          )}
        </div>

        {/* ══ SECTION SOINS INFIRMIERS ══ */}
        <div style={{ marginBottom: 12 }}>
          <SectionHeader color="#1e3a5f" title="Soins infirmiers" total={apercu.totalSoins} />
          {apercu.sejours.every(s => s.soins.length === 0) ? <Vide /> : (
            <>
              <THead cols={['Soin / Action réalisée', 'Date et heure', '', 'Tarif']} />
              {apercu.sejours.flatMap(s =>
                s.soins.map(soin => (
                  <div key={soin.id} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', gap: 6, padding: '6px 10px', borderBottom: '1px solid #e2e8f0', fontSize: 11, color: '#334155' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{soin.description}</span>
                    <span style={{ textAlign: 'right', fontSize: 10, color: '#94a3b8' }}>{fmtDateCourt(soin.dateHeure)}</span>
                    <span />
                    <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{soin.tarif.toLocaleString('fr-FR')}</span>
                  </div>
                ))
              )}
            </>
          )}
        </div>

        {/* ══ TOTAL GÉNÉRAL ══ */}
        <div style={{ border: '2px solid #1e3a5f', borderRadius: 3, padding: '12px 16px' }}>
          <div style={{ maxWidth: 420, marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: 7 }}>
            {[
              { label: 'Hospitalisation',   value: apercu.totalHospitalisation, color: '#1e3a5f' },
              { label: 'Consultations',    value: apercu.totalConsultations,   color: '#1e3a5f' },
              { label: 'Examens',          value: apercu.totalExamens,         color: '#1e3a5f' },
              { label: 'Soins infirmiers', value: apercu.totalSoins,           color: '#1e3a5f' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, borderBottom: '1px dashed #e2e8f0', paddingBottom: 5 }}>
                <span style={{ color: '#64748b' }}>{label}</span>
                <span style={{ color, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{fmt(value)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 6, borderTop: '2px solid #1e3a5f' }}>
              <span style={{ fontSize: 14, fontWeight: 900, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                TOTAL GÉNÉRAL
              </span>
              <span style={{ fontSize: 18, fontWeight: 900, color: '#1e3a5f', fontVariantNumeric: 'tabular-nums' }}>
                {fmt(apercu.totalGeneral)}
              </span>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
