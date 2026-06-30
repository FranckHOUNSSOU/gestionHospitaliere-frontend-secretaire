import './InvoiceDetail.css';
import { useState, useEffect } from 'react';
import { ArrowLeft, Printer, Loader2 } from 'lucide-react';
import { useNavigation } from '../../../context/NavigationContext';
import { getFacture } from '../../../services/getFacture';
import { postFacture } from '../../../services/postFacture';
import InvoiceInfoField from './InvoiceInfoField';
import InvoiceSectionHeader from './InvoiceSectionHeader';
import InvoiceTHead from './InvoiceTHead';
import InvoiceTRow from './InvoiceTRow';
import InvoiceVide from './InvoiceVide';

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

export default function InvoiceDetail() {
  const { navigate, nav } = useNavigation();
  const patientId = nav.selectedId;

  const [apercu,   setApercu]   = useState(null as any);
  const [loading,  setLoading]  = useState(true);
  const [erreur,   setErreur]   = useState(null as any);
  const [printing, setPrinting] = useState(false);

  async function handlePrint() {
    if (!patientId || !apercu) return;
    setPrinting(true);
    try {
      await postFacture.emettreFacture(patientId);
    } catch { /* erreur non bloquante */ }
    finally { setPrinting(false); }
    window.print();
  }

  useEffect(() => {
    if (!patientId) { setLoading(false); return; }
    setLoading(true);
    getFacture.getApercuFacture(patientId)
      .then(data => setApercu(data))
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
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body * { visibility: hidden; }
          #facture-print, #facture-print * { visibility: visible; }
          #facture-print {
            position: absolute;
            top: 0; left: 0;
            width: 100%;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: white !important;
          }
          @page {
            size: A4 portrait;
            margin: 12mm 15mm;
          }
        }
      `}</style>

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

      <div id="facture-print" style={{ background: 'white', padding: '16px 20px', borderRadius: 8, border: '1px solid #e2e8f0', fontFamily: 'Arial, sans-serif', maxWidth: '210mm', margin: '0 auto' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr 1fr', gap: 8, alignItems: 'center', paddingBottom: 12, borderBottom: '2px solid #1e3a5f', marginBottom: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textAlign: 'center' }}>
            <img src="/benin_embleme.png" alt="Armoiries du Bénin" style={{ height: 115, objectFit: 'contain' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: '#1e3a5f', lineHeight: 1.6, textTransform: 'uppercase' }}>
              CENTRE HOSPITALIER UNIVERSITAIRE<br />
              DE LA MÈRE ET DE L'ENFANT-LAGUNE <br />
              (CHU-MEL) <br />
              *****
            </p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img src="/chuMel-logo.png" alt="CHU-MEL" style={{ height: 72, objectFit: 'contain' }} />
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 800, color: '#1e3a5f', textDecoration: 'underline', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '8px 0 12px' }}>
          NOTE DE FRAIS D'HOSPITALISATION
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '7px 12px', border: '1px solid #1e3a5f', borderRadius: 3, marginBottom: 10, fontSize: 11 }}>
          <p style={{ margin: 0 }}><strong>FORMATION SANITAIRE :</strong> CHU-MEL</p>
          <p style={{ margin: 0 }}><strong>Service :</strong> {sejour?.service ?? '—'}</p>
        </div>

        <div style={{ border: '1px solid #1e3a5f', borderRadius: 3, marginBottom: 12, overflow: 'hidden' }}>
          <div style={{ background: '#1e3a5f', padding: '5px 12px' }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Informations du patient
            </p>
          </div>
          <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              <InvoiceInfoField label="Nom" value={apercu.patient.nom} />
              <InvoiceInfoField label="Prénom" value={apercu.patient.prenom} />
              <InvoiceInfoField label="Date de naissance" value={fmtDate(apercu.patient.dateNaissance)} />
              <InvoiceInfoField label="Sexe" value={p.sexe === 'M' ? 'Masculin' : p.sexe === 'F' ? 'Féminin' : p.sexe ?? '—'} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              <InvoiceInfoField label="Téléphone" value={p.telephone ?? '—'} />
              <InvoiceInfoField label="Mode d'admission" value={sejour?.modeEntree ?? '—'} />
              <InvoiceInfoField label="Date d'entrée" value={fmtDate(sejour?.dateAdmission)} />
              <InvoiceInfoField label="Date de sortie" value={fmtDate(sejour?.dateSortie)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              <InvoiceInfoField
                label="Couverture sociale"
                value={couv ? `${couv.organisme} — ${couv.type} · N°${couv.numero}` : 'Aucune'}
              />
              <InvoiceInfoField label="Type de sortie" value={sejour?.modeSortie ?? '—'} />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 10 }}>
          <InvoiceSectionHeader color="#1e3a5f" title="Hospitalisation" total={apercu.totalHospitalisation} />
          {apercu.lignesHospitalisation.length === 0 ? <InvoiceVide /> : (
            <>
              <InvoiceTHead cols={['Description / Service / Chambre', 'Jours', 'Prix/jour', 'Montant']} />
              {apercu.lignesHospitalisation.map((l: any, i: number) => (
                <InvoiceTRow key={i} cols={[l.description, l.jours, l.prixJour, l.total]} />
              ))}
            </>
          )}
        </div>

        <div style={{ marginBottom: 10 }}>
          <InvoiceSectionHeader color="#1e3a5f" title="Consultations et rendez-vous" total={apercu.totalConsultations} />
          {apercu.consultations.length === 0 ? <InvoiceVide /> : (
            <>
              <InvoiceTHead cols={['Type / Médecin', 'Date', 'Statut', 'Tarif']} />
              {apercu.consultations.map((c: any) => (
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

        <div style={{ marginBottom: 10 }}>
          <InvoiceSectionHeader color="#1e3a5f" title="Examens" total={apercu.totalExamens} />
          {apercu.sejours.every((s: any) => s.examens.length === 0) ? <InvoiceVide /> : (
            <>
              <InvoiceTHead cols={['Description', 'Séjour', '', 'Tarif']} />
              {apercu.sejours.flatMap((s: any) =>
                s.examens.map((e: any) => (
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

        <div style={{ marginBottom: 12 }}>
          <InvoiceSectionHeader color="#1e3a5f" title="Soins infirmiers" total={apercu.totalSoins} />
          {apercu.sejours.every((s: any) => s.soins.length === 0) ? <InvoiceVide /> : (
            <>
              <InvoiceTHead cols={['Soin / Action réalisée', 'Date et heure', '', 'Tarif']} />
              {apercu.sejours.flatMap((s: any) =>
                s.soins.map((soin: any) => (
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

        <div style={{ border: '2px solid #1e3a5f', borderRadius: 3, padding: '12px 16px' }}>
          <div style={{ maxWidth: 420, marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: 7 }}>
            {[
              { label: 'Hospitalisation',   value: apercu.totalHospitalisation },
              { label: 'Consultations',     value: apercu.totalConsultations   },
              { label: 'Examens',           value: apercu.totalExamens         },
              { label: 'Soins infirmiers',  value: apercu.totalSoins           },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, borderBottom: '1px dashed #e2e8f0', paddingBottom: 5 }}>
                <span style={{ color: '#64748b' }}>{label}</span>
                <span style={{ color: '#1e3a5f', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{fmt(value)}</span>
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
