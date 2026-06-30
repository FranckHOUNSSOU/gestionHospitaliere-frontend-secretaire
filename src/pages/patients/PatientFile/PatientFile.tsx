import './PatientFile.css';
import { useState, useEffect, useCallback } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useNavigation } from '../../../context/NavigationContext';
import {
  ArrowLeft, Loader2,
  AlertTriangle, Pill, Phone, Building2, Stethoscope, HeartPulse, FileText, Activity,
} from 'lucide-react';
import { getDossier } from '../../../services/getDossier';
import PatientFileSectionCard from './PatientFileSectionCard';
import PatientFileModalSynthese from './PatientFileModalSynthese';
import PatientFileModalSoins from './PatientFileModalSoins';
import PatientFileModalCritiques from './PatientFileModalCritiques';
import PatientFileModalAllergies from './PatientFileModalAllergies';
import PatientFileModalTraitements from './PatientFileModalTraitements';
import PatientFileModalContacts from './PatientFileModalContacts';
import PatientFileModalCouvertures from './PatientFileModalCouvertures';
import PatientFileModalDiagnostics from './PatientFileModalDiagnostics';

export default function PatientFile() {
  const { id } = useParams<{ id: string }>();
  const { navigate } = useNavigation();
  const location = useLocation();
  const autoSynthese = (location.state as any)?.synthese === true;

  const [dossier,   setDossier]   = useState(null as any);
  const [sejour,    setSejour]    = useState(null as any);
  const [diagList,  setDiagList]  = useState<any[]>([]);
  const [soinsList, setSoinsList] = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null as any);
  const [openModal, setOpenModal] = useState(null as any);

  const loadDossier = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getDossier.getDossier(id);
      setDossier(data);
    } catch {
      setError('Impossible de charger le dossier.');
    }
  }, [id]);

  const loadSejour = useCallback(async () => {
    if (!id) return;
    try {
      const sejData = await getDossier.getSejourActif(id);
      setSejour(sejData);
      if (sejData?.id) {
        const detail = await getDossier.getSejourDetail(sejData.id);
        setDiagList(detail.diagnostics ?? []);
        setSoinsList(detail.soinsInfirmiers ?? []);
      }
    } catch { setSejour(null); }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadDossier(), loadSejour()]).finally(() => {
      setLoading(false);
      if (autoSynthese) setOpenModal('synthese');
    });
  }, [loadDossier, loadSejour]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 32, color: 'var(--c-t3)' }}>
      <Loader2 size={18} style={{ animation: 'spin 0.7s linear infinite' }} /> Chargement du dossier…
    </div>
  );
  if (error || !dossier) return (
    <div>
      <button onClick={() => navigate('admissions')} className="adm-back-btn" style={{ marginBottom: 16 }}><ArrowLeft size={16} /></button>
      <div className="adm-alert adm-alert-error">{error ?? 'Patient introuvable.'}</div>
    </div>
  );

  const age = Math.floor((Date.now() - new Date(dossier.dateNaissance).getTime()) / (365.25 * 24 * 3600 * 1000));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 900, margin: '0 auto' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate('admissions')} className="adm-back-btn"><ArrowLeft size={16} /></button>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: 'var(--c-t0)' }}>Dossier patient</p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--c-t2)' }}>Compléter et gérer les informations médicales</p>
        </div>
        <button onClick={() => setOpenModal('synthese')} className="adm-btn adm-btn-primary" style={{ gap: 6, height: 34, fontSize: 12 }}>
          <FileText size={14} /> Synthèse
        </button>
      </div>

      <div className="adm-card">
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 12, flexShrink: 0,
              background: dossier.sexe === 'F' ? 'linear-gradient(135deg,#f9a8d4,#ec4899)' : 'linear-gradient(135deg,#93c5fd,#3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff',
            }}>
              {dossier.prenom[0]}{dossier.nom[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: 'var(--c-t0)' }}>
                  {dossier.prenom} {dossier.nom}
                </p>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                  background: dossier.statutProfil === 'Complet' ? '#dcfce7' : '#fef3c7',
                  color: dossier.statutProfil === 'Complet' ? '#166534' : '#92400e',
                }}>
                  {dossier.statutProfil}
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--c-t3)' }}>
                {dossier.numeroIpp} · {dossier.sexe === 'M' ? 'Masculin' : dossier.sexe === 'F' ? 'Féminin' : 'Autre'} · {age} ans
                {dossier.telephoneMobile && ` · ${dossier.telephoneMobile}`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {dossier.groupeSanguinAbo && (
                <span style={{ fontSize: 12, fontWeight: 700, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 6, padding: '3px 10px' }}>
                  {dossier.groupeSanguinAbo} {dossier.groupeSanguinRhesus === 'Positif' ? '+' : dossier.groupeSanguinRhesus === 'Négatif' ? '−' : ''}
                </span>
              )}
              {sejour && sejour.typeSejour && (
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                  background: sejour.typeSejour === 'Hospitalisation' ? '#eff6ff' : sejour.typeSejour === 'Consultation' ? '#f0fdf4' : '#fef2f2',
                  color:      sejour.typeSejour === 'Hospitalisation' ? '#1d4ed8' : sejour.typeSejour === 'Consultation' ? '#166534' : '#dc2626',
                }}>
                  {sejour.typeSejour}
                </span>
              )}
              {sejour && (
                <span style={{ fontSize: 11, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: 6, padding: '3px 10px' }}>
                  Séjour actif · {new Date(sejour.dateAdmission).toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <PatientFileSectionCard
          icon={<HeartPulse size={15} />} title="Données critiques" color="#ef4444"
          count={dossier.groupeSanguinAbo ? 1 : 0}
          preview={`${dossier.groupeSanguinAbo ?? '?'} ${dossier.groupeSanguinRhesus === 'Positif' ? '+' : dossier.groupeSanguinRhesus === 'Négatif' ? '−' : ''} · ${dossier.statutReanimatoire ?? '—'}`}
          onClick={() => setOpenModal('critiques')}
        />
        <PatientFileSectionCard
          icon={<AlertTriangle size={15} />} title="Allergies" color="#f97316"
          count={dossier.allergies.length}
          preview={dossier.allergies.slice(0, 3).map((a: any) => a.allergene).join(', ')}
          onClick={() => setOpenModal('allergies')}
        />
        <PatientFileSectionCard
          icon={<Pill size={15} />} title="Traitements à risque" color="#8b5cf6"
          count={dossier.traitementsARisque.length}
          preview={dossier.traitementsARisque.slice(0, 2).map((t: any) => t.nomMedicament).join(', ')}
          onClick={() => setOpenModal('traitements')}
        />
        <PatientFileSectionCard
          icon={<Phone size={15} />} title="Contacts d'urgence" color="#0ea5e9"
          count={dossier.contactsUrgence.length}
          preview={dossier.contactsUrgence.slice(0, 2).map((c: any) => `${c.prenom} ${c.nom}`).join(', ')}
          onClick={() => setOpenModal('contacts')}
        />
        <PatientFileSectionCard
          icon={<Building2 size={15} />} title="Couverture sociale" color="#059669"
          count={dossier.couverturesSociales.length}
          preview={dossier.couverturesSociales.slice(0, 2).map((c: any) => c.nomOrganisme).join(', ')}
          onClick={() => setOpenModal('couvertures')}
        />
        <PatientFileSectionCard
          icon={<Stethoscope size={15} />} title="Diagnostics" color="#1e3a5f"
          count={(diagList as any[]).length}
          preview={(diagList as any[]).slice(0, 2).map(d => d.libelle).join(', ')}
          onClick={() => setOpenModal('diagnostics')}
        />
        <PatientFileSectionCard
          icon={<Activity size={15} />} title="Soins infirmiers" color="#0891b2"
          count={(soinsList as any[]).length}
          preview={(soinsList as any[]).slice(0, 2).map(s => s.cible).join(', ')}
          onClick={() => setOpenModal('soins')}
        />
      </div>

      {openModal === 'critiques' && (
        <PatientFileModalCritiques patientId={id!} dossier={dossier} onClose={() => setOpenModal(null)} onSaved={() => { loadDossier(); setOpenModal(null); }} />
      )}
      {openModal === 'allergies' && (
        <PatientFileModalAllergies patientId={id!} items={dossier.allergies} onClose={() => setOpenModal(null)} onChanged={loadDossier} />
      )}
      {openModal === 'traitements' && (
        <PatientFileModalTraitements patientId={id!} items={dossier.traitementsARisque} onClose={() => setOpenModal(null)} onChanged={loadDossier} />
      )}
      {openModal === 'contacts' && (
        <PatientFileModalContacts patientId={id!} items={dossier.contactsUrgence} onClose={() => setOpenModal(null)} onChanged={loadDossier} />
      )}
      {openModal === 'couvertures' && (
        <PatientFileModalCouvertures patientId={id!} items={dossier.couverturesSociales} onClose={() => setOpenModal(null)} onChanged={loadDossier} />
      )}
      {openModal === 'diagnostics' && (
        <PatientFileModalDiagnostics sejour={sejour} items={diagList as any[]} onClose={() => setOpenModal(null)} onChanged={loadSejour} />
      )}
      {openModal === 'soins' && (
        <PatientFileModalSoins sejour={sejour} items={soinsList as any[]} onClose={() => setOpenModal(null)} onChanged={loadSejour} />
      )}
      {openModal === 'synthese' && (
        <PatientFileModalSynthese dossier={dossier} sejour={sejour} diagList={diagList as any[]} soinsList={soinsList as any[]} onClose={() => setOpenModal(null)} />
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
