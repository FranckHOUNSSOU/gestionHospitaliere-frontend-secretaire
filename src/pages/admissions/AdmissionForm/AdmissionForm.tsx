import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, BedDouble, User, Stethoscope, Search, X, Loader2 } from 'lucide-react';
import { useNavigation } from '../../../context/NavigationContext';
import { useAuth } from '../../../context/AuthContext';
import client from '../../../services/clients';
import { patientsData, type Patient } from '../../../services/patients';
import CIM10Input from '../../../components/CIM10Input/CIM10Input';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Medecin {
  id: string;
  nom: string;
  prenom: string;
}
interface Service {
  id: string;
  nom: string;
  code: string;
}
interface Chambre {
  id: string;
  numero: string;
  designation: string | null;
  etage: string | null;
  capacite: number;
}

const TYPES_SEJOUR = [
  { value: 'Hospitalisation', label: 'Hospitalisation', desc: 'Admission avec lit/chambre assigné' },
  { value: 'Consultation',    label: 'Consultation',    desc: 'Visite médicale, retour le même jour' },
  { value: 'Urgences',        label: 'Urgences',        desc: 'Prise en charge immédiate' },
] as const;

// Valeurs de l'enum ModeEntree côté backend
const MODES_ENTREE = ['Urgences', 'Programmé', 'Transfert', 'Naissance', 'Autre'] as const;

// Auto-génère un numéro de séjour unique
function genNumeroSejour(): string {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `SEJ-${year}-${rand}`;
}

// ─── Composant ────────────────────────────────────────────────────────────────

export default function AdmissionForm() {
  const { navigate }   = useNavigation();
  const { user }       = useAuth();

  const poleNom = user?.pole   ?? null;
  const poleId  = user?.poleId ?? null;

  // ── Services du pôle ─────────────────────────────────────────────────────────
const [services,        setServices]        = useState<Service[]>([]);
const [servicesLoading, setServicesLoading] = useState(false);
const [servicesErr,     setServicesErr]     = useState<string | null>(null);
const [selectedService, setSelectedService] = useState<string>(''); // id du service choisi

  // ── État du formulaire ────────────────────────────────────────────────────
  const [form, setForm] = useState({
    typeSejour:            'Hospitalisation' as string,
    medecinResponsableId:  '',
    modeEntree:            '',
    motifHospitalisation:  '',
    codeCIM10:             '',
    dateAdmission:         new Date().toISOString().slice(0, 16),
    numeroSejour:          genNumeroSejour(),
    numeroChambre:         '',
    numeroLit:             '',
  });

  // Patient sélectionné
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // ── Recherche patient ─────────────────────────────────────────────────────
  const [patientQuery,   setPatientQuery]   = useState('');
  const [patientResults, setPatientResults] = useState<Patient[]>([]);
  const [patientLoading, setPatientLoading] = useState(false);
  const [showResults,    setShowResults]    = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePatientSearch = (val: string) => {
    setPatientQuery(val);
    if (selectedPatient) { setSelectedPatient(null); }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length >= 2) {
      setPatientLoading(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const results = await patientsData.rechercher(val.trim());
          setPatientResults(results);
          setShowResults(true);
        } catch { setPatientResults([]); }
        finally { setPatientLoading(false); }
      }, 400);
    } else {
      setPatientResults([]);
      setShowResults(false);
    }
  };

  const selectPatient = (p: Patient) => {
    setSelectedPatient(p);
    setPatientQuery(`${p.prenom} ${p.nom} — ${p.numeroIpp}`);
    setShowResults(false);
  };

  const clearPatient = () => {
    setSelectedPatient(null);
    setPatientQuery('');
    setPatientResults([]);
    setShowResults(false);
  };

  // ── Médecins du pôle ──────────────────────────────────────────────────────
  const [medecins,        setMedecins]        = useState<Medecin[]>([]);
  const [medecinsLoading, setMedecinsLoading] = useState(false);
  const [medecinsErr,     setMedecinsErr]     = useState<string | null>(null);

  // ── Chambres du service ──────────────────────────────────────────────────
  const [chambres,        setChambres]        = useState<Chambre[]>([]);
  const [chambresLoading, setChambresLoading] = useState(false);

    // ── Chargement des services du pôle ──────────────────────────────────────────
    useEffect(() => {
      if (!poleId) return;
      setServicesLoading(true);
      setServicesErr(null);
      setSelectedService('');
      setMedecins([]);
      client
        .get<Service[]>('/services', { params: { poleId } })
        .then(res => setServices(res.data))
        .catch(() => setServicesErr('Impossible de charger les services du pôle.'))
        .finally(() => setServicesLoading(false));
    }, [poleId]);

    useEffect(() => {
  if (!selectedService) {
    setMedecins([]);   // vide la liste si aucun service choisi
    return;
  }
  setMedecinsLoading(true);
  setMedecinsErr(null);
  client
    .get<Medecin[]>('/auth/users', {
      params: { role: 'MEDECIN', actif: 'true', serviceId: selectedService },
    })
    .then(res => setMedecins(res.data))
    .catch(() => setMedecinsErr('Impossible de charger les médecins du service.'))
    .finally(() => setMedecinsLoading(false));
}, [selectedService]);

  useEffect(() => {
    const needsRoom = form.typeSejour === 'Hospitalisation' || form.typeSejour === 'Urgences';
    if (!selectedService || !needsRoom) { setChambres([]); return; }
    setChambresLoading(true);
    client
      .get<Chambre[]>(`/chambres/service/${selectedService}`)
      .then(res => setChambres(res.data.filter(c => (c as any).estActive !== false)))
      .catch(() => setChambres([]))
      .finally(() => setChambresLoading(false));
  }, [selectedService, form.typeSejour]);

  // ── Sauvegarde ────────────────────────────────────────────────────────────
  const [saving,   setSaving]   = useState(false);
  const [saveErr,  setSaveErr]  = useState<string | null>(null);
  const [saved,    setSaved]    = useState(false);

  const canSave = Boolean(
    selectedPatient &&
    form.medecinResponsableId &&
    form.modeEntree &&
    form.motifHospitalisation.trim() &&
    form.dateAdmission,
  );

  const handleSave = async () => {
    if (!selectedPatient || !canSave) return;
    setSaving(true);
    setSaveErr(null);
    try {
      const { data: sejour } = await client.post<{ id: string }>(`/sejours/patient/${selectedPatient.id}`, {
        numeroSejour:         form.numeroSejour,
        typeSejour:           form.typeSejour,
        medecinResponsableId: form.medecinResponsableId || undefined,
        modeEntree:           form.modeEntree,
        motifHospitalisation: form.motifHospitalisation.trim(),
        codeCIM10:            form.codeCIM10 || undefined,
        dateAdmission:        new Date(form.dateAdmission).toISOString(),
      });

      // Pour une hospitalisation, enregistrer l'affectation lit/chambre
      if (form.typeSejour === 'Hospitalisation' || form.typeSejour === 'Urgences') {
        const serviceNom = services.find(s => s.id === selectedService)?.nom ?? '';
        await client.post(`/sejours/${sejour.id}/mouvements`, {
          dateHeureMouvement: new Date(form.dateAdmission).toISOString(),
          serviceArrivee:     serviceNom,
          numeroChambre:      form.numeroChambre || undefined,
          numeroLit:          form.numeroLit     || undefined,
        });
      }

      setSaved(true);
      setTimeout(() => navigate('admissions'), 1200);
    } catch (err: unknown) {
      setSaveErr((err as Error)?.message ?? 'Erreur lors de l\'enregistrement.');
    } finally {
      setSaving(false);
    }
  };

  const selectedMedecin = medecins.find(m => m.id === form.medecinResponsableId);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => navigate('admissions')} className="adm-back-btn">
          <ArrowLeft size={16} />
        </button>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--c-t0)', margin: 0 }}>Nouvelle admission</p>
          <p style={{ fontSize: '12px', color: 'var(--c-t2)', margin: '2px 0 0' }}>
            Enregistrer l'hospitalisation d'un patient
          </p>
        </div>
      </div>

      {/* Succès */}
      {saved && (
        <div className="adm-alert adm-alert-success" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Save size={14} style={{ flexShrink: 0 }} />
          Admission enregistrée avec succès !
        </div>
      )}

      {/* Erreur sauvegarde */}
      {saveErr && (
        <div className="adm-alert adm-alert-danger" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          ⚠ {saveErr}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '14px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* ── Section Patient ── */}
          <div className="adm-form-section">
            <div className="adm-form-section-head">
              <div className="adm-form-section-icon adm-fsi-blue"><User size={13} /></div>
              <p className="adm-card-title">Sélection du patient</p>
            </div>
            <div className="adm-form-section-body">
              <div className="adm-form-field">
                <label className="adm-label">Rechercher un patient (nom, prénom ou IPP) *</label>
                <div style={{ position: 'relative' }}>
                  <div className="adm-search" style={{ width: '100%' }}>
                    <span className="adm-search-icon">
                      {patientLoading
                        ? <Loader2 size={13} style={{ animation: 'spin 0.7s linear infinite' }} />
                        : <Search size={13} />}
                    </span>
                    <input
                      className="adm-search-input"
                      placeholder=""
                      value={patientQuery}
                      onChange={e => handlePatientSearch(e.target.value)}
                      onFocus={() => patientResults.length > 0 && setShowResults(true)}
                    />
                    {patientQuery && (
                      <button onClick={clearPatient} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-t3)', display: 'flex', alignItems: 'center' }}>
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {/* Dropdown résultats */}
                  {showResults && patientResults.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: 'var(--c-bg)', border: '1px solid var(--c-bdr)', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', marginTop: '4px', maxHeight: '240px', overflowY: 'auto' }}>
                      {patientResults.map(p => (
                        <div
                          key={p.id}
                          onClick={() => selectPatient(p)}
                          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--c-bdr)', transition: 'background 0.1s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--c-surf2)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <div style={{ width: 34, height: 34, borderRadius: '8px', background: 'linear-gradient(135deg,#60a5fa,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                            {p.prenom[0]}{p.nom[0]}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: '13px', color: 'var(--c-t1)' }}>
                              {p.prenom} {p.nom}
                            </p>
                            <p style={{ margin: 0, fontSize: '11px', color: 'var(--c-t3)' }}>
                              {p.numeroIpp}
                              {p.dateNaissance && ` · ${new Date(p.dateNaissance).toLocaleDateString('fr-FR')}`}
                              {p.telephoneMobile && ` · ${p.telephoneMobile}`}
                            </p>
                          </div>
                          {p.statutProfil === 'Incomplet' && (
                            <span style={{ fontSize: '10px', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', borderRadius: '99px', padding: '1px 7px', fontWeight: 600, flexShrink: 0 }}>
                              Incomplet
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {showResults && patientResults.length === 0 && !patientLoading && patientQuery.trim().length >= 2 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: 'var(--c-bg)', border: '1px solid var(--c-bdr)', borderRadius: '8px', padding: '16px', textAlign: 'center', fontSize: '13px', color: 'var(--c-t3)', marginTop: '4px' }}>
                      Aucun patient trouvé
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Section Service (pré-rempli) ── */}
          <div className="adm-form-section">
            <div className="adm-form-section-head">
              <div className="adm-form-section-icon adm-fsi-amber"><BedDouble size={13} /></div>
              <p className="adm-card-title">Service / Pôle</p>
            </div>
            <div className="adm-form-section-body">
              <div className="adm-form-field">
                <label className="adm-label">Pôle d'affectation</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: 'var(--c-surf2)', border: '1px solid var(--c-bdr)', borderRadius: '8px', fontSize: '13px', color: 'var(--c-t1)', fontWeight: 600 }}>
                  <BedDouble size={14} style={{ color: 'var(--c-primary)', flexShrink: 0 }} />
                  {poleNom ?? <span style={{ color: 'var(--c-t3)', fontWeight: 400 }}>Pôle non renseigné sur votre compte</span>}
                </div>
                {/* ── Champ Service (nouveau) ── */}
                <div className="adm-form-field" style={{ marginTop: '12px' }}>
                  <label className="adm-label">Service *</label>

                  {servicesLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', fontSize: '13px', color: 'var(--c-t3)' }}>
                      <Loader2 size={13} style={{ animation: 'spin 0.7s linear infinite' }} /> Chargement des services…
                    </div>
                  ) : servicesErr ? (
                    <p style={{ fontSize: '12px', color: '#ef4444', margin: 0 }}>{servicesErr}</p>
                  ) : !poleId ? (
                    <p style={{ fontSize: '12px', color: '#f97316', margin: 0 }}>
                      ⚠ Aucun pôle associé, impossible de lister les services.
                    </p>
                  ) : (
                    <select
                      value={selectedService}
                      onChange={e => {
                        setSelectedService(e.target.value);
                        // Reset le médecin si on change de service
                        setForm(f => ({ ...f, medecinResponsableId: '' }));
                      }}
                      className="adm-input"
                    >
                      <option value="">Sélectionner un service</option>
                      {services.map(s => (
                        <option key={s.id} value={s.id}>{s.nom}</option>
                      ))}
                    </select>
                  )}
                </div>
                {!poleId && (
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#f97316' }}>
                    ⚠ Aucun pôle associé à votre compte. Contactez l'administrateur.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Section Type de séjour ── */}
          <div className="adm-form-section">
            <div className="adm-form-section-head">
              <div className="adm-form-section-icon adm-fsi-blue"><Stethoscope size={13} /></div>
              <p className="adm-card-title">Type de prise en charge</p>
            </div>
            <div className="adm-form-section-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {TYPES_SEJOUR.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, typeSejour: t.value }))}
                    style={{
                      padding: '10px 12px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                      border: form.typeSejour === t.value ? '2px solid var(--c-primary)' : '1px solid var(--c-bdr)',
                      background: form.typeSejour === t.value ? 'var(--c-accent-bg)' : 'var(--c-surf2)',
                      transition: 'all 0.15s',
                    }}
                  >
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: form.typeSejour === t.value ? 'var(--c-primary)' : 'var(--c-t1)' }}>{t.label}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 10, color: 'var(--c-t3)' }}>{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Section Médecin + Infos médicales ── */}
          <div className="adm-form-section">
            <div className="adm-form-section-head">
              <div className="adm-form-section-icon adm-fsi-blue"><Stethoscope size={13} /></div>
              <p className="adm-card-title">Informations médicales</p>
            </div>
            <div className="adm-form-section-body">
              <div className="adm-form-grid adm-form-grid-2">

                {/* Médecin */}
                <div className="adm-form-field">
                  <label className="adm-label">Médecin responsable *</label>
                  {medecinsLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', fontSize: '13px', color: 'var(--c-t3)' }}>
                      <Loader2 size={13} style={{ animation: 'spin 0.7s linear infinite' }} /> Chargement…
                    </div>
                  ) : medecinsErr ? (
                    <p style={{ fontSize: '12px', color: '#ef4444', margin: 0 }}>{medecinsErr}</p>
                  ) : (
                    <select
                      value={form.medecinResponsableId}
                      onChange={e => setForm(f => ({ ...f, medecinResponsableId: e.target.value }))}
                      className="adm-input"
                    >
                      <option value="">Sélectionner un médecin</option>
                      {medecins.map(m => (
                        <option key={m.id} value={m.id}>Dr. {m.prenom} {m.nom}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Mode d'entrée */}
                <div className="adm-form-field">
                  <label className="adm-label">Mode d'entrée *</label>
                  <select
                    value={form.modeEntree}
                    onChange={e => setForm(f => ({ ...f, modeEntree: e.target.value }))}
                    className="adm-input"
                  >
                    <option value="">Sélectionner un mode</option>
                    {MODES_ENTREE.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                {/* Motif */}
                <div className="adm-form-field" style={{ gridColumn: '1 / -1' }}>
                  <label className="adm-label">
                    {form.typeSejour === 'Consultation' ? 'Motif de consultation' : form.typeSejour === 'Urgences' ? 'Motif de venue aux urgences' : 'Motif d\'hospitalisation'} *
                  </label>
                  <input
                    type="text"
                    value={form.motifHospitalisation}
                    onChange={e => setForm(f => ({ ...f, motifHospitalisation: e.target.value }))}
                    className="adm-input"
                    placeholder=""
                  />
                </div>

                {/* Diagnostic CIM-10 */}
                <div className="adm-form-field" style={{ gridColumn: '1 / -1' }}>
                  <label className="adm-label">
                    Code diagnostic CIM-10
                    <span style={{ marginLeft: 6, fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--c-t3)' }}>
                      (optionnel — tapez le code ou le libellé)
                    </span>
                  </label>
                  <CIM10Input
                    value={form.codeCIM10}
                    onChange={v => setForm(f => ({ ...f, codeCIM10: v }))}
                  />
                </div>

                {/* Date d'admission */}
                <div className="adm-form-field">
                  <label className="adm-label">Date et heure d'admission *</label>
                  <input
                    type="datetime-local"
                    value={form.dateAdmission}
                    onChange={e => setForm(f => ({ ...f, dateAdmission: e.target.value }))}
                    className="adm-input"
                  />
                </div>

                {/* Numéro de séjour (auto) */}
                <div className="adm-form-field">
                  <label className="adm-label">N° de séjour (auto-généré)</label>
                  <input
                    type="text"
                    value={form.numeroSejour}
                    onChange={e => setForm(f => ({ ...f, numeroSejour: e.target.value }))}
                    className="adm-input"
                    style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}
                  />
                </div>

                {/* Chambre / Lit — Hospitalisation et Urgences */}
                {(form.typeSejour === 'Hospitalisation' || form.typeSejour === 'Urgences') && (<>
                  <div className="adm-form-field">
                    <label className="adm-label">
                      Chambre
                      {!selectedService && <span style={{ color: '#f97316', fontSize: 10, marginLeft: 6 }}>— sélectionnez d'abord un service</span>}
                    </label>
                    {chambresLoading ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', fontSize: 12, color: 'var(--c-t3)' }}>
                        <Loader2 size={13} style={{ animation: 'spin 0.7s linear infinite' }} /> Chargement…
                      </div>
                    ) : (
                      <select
                        className="adm-input"
                        value={form.numeroChambre}
                        disabled={!selectedService}
                        onChange={e => setForm(f => ({ ...f, numeroChambre: e.target.value, numeroLit: '' }))}
                      >
                        <option value="">
                          {!selectedService
                            ? '— Sélectionnez un service —'
                            : chambres.length === 0
                              ? '— Aucune chambre disponible —'
                              : '— Choisir une chambre —'}
                        </option>
                        {chambres.map(c => (
                          <option key={c.id} value={c.numero}>
                            {c.numero}{c.designation ? ` — ${c.designation}` : ''}{c.etage ? ` (${c.etage})` : ''} · {c.capacite} lit{c.capacite > 1 ? 's' : ''}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="adm-form-field">
                    <label className="adm-label">N° de lit</label>
                    <input
                      className="adm-input"
                      placeholder="Ex : 1, 2, 3…"
                      value={form.numeroLit}
                      disabled={!form.numeroChambre}
                      onChange={e => setForm(f => ({ ...f, numeroLit: e.target.value }))}
                    />
                  </div>
                </>)}

              </div>
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Patient sélectionné */}
          {selectedPatient && (
            <div style={{ background: 'var(--c-accent-bg)', border: '1px solid var(--c-accent-bd)', borderRadius: '10px', padding: '14px' }}>
              <p className="adm-sec-h" style={{ color: 'var(--c-accent)' }}>Patient sélectionné</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="adm-avatar-sm" style={{ background: 'var(--c-accent)', width: 38, height: 38 }}>
                  {selectedPatient.prenom[0]}{selectedPatient.nom[0]}
                </div>
                <div>
                  <p className="adm-cell-name" style={{ color: 'var(--c-accent)', margin: 0 }}>
                    {selectedPatient.prenom} {selectedPatient.nom}
                  </p>
                  <p className="adm-cell-mono" style={{ color: 'var(--c-accent)', margin: 0 }}>
                    {selectedPatient.numeroIpp}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Récapitulatif */}
          <div className="adm-card">
            <div className="adm-card-head">
              <p className="adm-card-title">Récapitulatif</p>
            </div>
            <div className="adm-card-body">
              {[
                { label: 'Patient', value: selectedPatient ? `${selectedPatient.prenom} ${selectedPatient.nom}` : '—' },
                { label: 'IPP',     value: selectedPatient?.numeroIpp ?? '—' },
                { label: 'Type',    value: form.typeSejour || '—' },
                { label: 'Pôle',    value: poleNom ?? '—' },
                { label: 'Service', value: services.find(s => s.id === selectedService)?.nom ?? '—' },
                { label: 'Médecin', value: selectedMedecin ? `Dr. ${selectedMedecin.prenom} ${selectedMedecin.nom}` : '—' },
                { label: 'Mode',    value: form.modeEntree || '—' },
                { label: 'CIM-10',  value: form.codeCIM10 ? form.codeCIM10.split(' — ')[0] : '—' },
                { label: 'Entrée',  value: form.dateAdmission ? new Date(form.dateAdmission).toLocaleDateString('fr-FR') : '—' },
                ...(form.typeSejour === 'Hospitalisation' || form.typeSejour === 'Urgences' ? [
                  { label: 'Chambre', value: form.numeroChambre || '—' },
                  { label: 'Lit',     value: form.numeroLit     || '—' },
                ] : []),
              ].map(({ label, value }) => (
                <div key={label} className="adm-summary-row">
                  <span className="adm-summary-k">{label}</span>
                  <span className="adm-summary-v">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Boutons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={handleSave}
              disabled={!canSave || saving}
              className="adm-btn adm-btn-primary"
              style={{ height: '38px', justifyContent: 'center', gap: '6px', opacity: canSave && !saving ? 1 : 0.5, cursor: canSave && !saving ? 'pointer' : 'not-allowed' }}
            >
              {saving
                ? <><Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> Enregistrement…</>
                : <><Save size={14} /> Enregistrer l'admission</>}
            </button>
            <button onClick={() => navigate('admissions')} className="adm-btn" style={{ height: '38px', justifyContent: 'center' }}>
              Annuler
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}