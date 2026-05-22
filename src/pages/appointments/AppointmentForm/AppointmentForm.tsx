import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, CalendarDays, Search, X } from 'lucide-react';
import { useNavigation } from '../../../context/NavigationContext';
import { useAuth } from '../../../context/AuthContext';
import { useDoctors } from '../../../context/DoctorContext';
import { createRendezVous } from '../../../services/appointmentService';
import { rechercherPatients } from '../../../services/patientService';
import type { PatientApi } from '../../../services/patientService';

const timeSlots = [
  '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00',
  '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
];

const appointmentTypes = ['Consultation', 'Suivi', 'Contrôle', 'Examen', 'Pré-opératoire', 'Urgence', 'Vaccination', 'Autre'];

export default function AppointmentForm() {
  const { navigate }   = useNavigation();
  const { user }       = useAuth();
  const { doctors }    = useDoctors();

  // ── Patient combobox ──────────────────────────────────────────────────────
  const [patientQuery,    setPatientQuery]    = useState('');
  const [patientResults,  setPatientResults]  = useState<PatientApi[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientApi | null>(null);
  const [showDropdown,    setShowDropdown]    = useState(false);
  const [searching,       setSearching]       = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Formulaire ────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    serviceFilter: '', doctorId: '',
    date: '', time: '', duration: '30', type: 'Consultation', notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);
  const [saved,  setSaved]  = useState(false);

  // ── Fermer dropdown au clic extérieur ─────────────────────────────────────
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ── Recherche patient (debounce 300ms) ────────────────────────────────────
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!patientQuery.trim() || patientQuery.length < 2) {
      setPatientResults([]);
      setShowDropdown(false);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await rechercherPatients(patientQuery);
        setPatientResults(data);
        setShowDropdown(true);
      } catch {
        setPatientResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, [patientQuery]);

  function selectPatient(p: PatientApi) {
    setSelectedPatient(p);
    setPatientQuery(`${p.prenom} ${p.nom} — ${p.numeroIpp}`);
    setShowDropdown(false);
  }

  function clearPatient() {
    setSelectedPatient(null);
    setPatientQuery('');
    setPatientResults([]);
  }

  // ── Médecins filtrés par service ──────────────────────────────────────────
  const serviceOptions = Array.from(new Set(doctors.map((d) => d.department))).filter(Boolean).sort();
  const filteredDoctors = form.serviceFilter
    ? doctors.filter((d) => d.department === form.serviceFilter)
    : doctors;
  const selectedDoctor = doctors.find((d) => d.id === form.doctorId);

  function handleChange(field: string, value: string) {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'serviceFilter') updated.doctorId = '';
      return updated;
    });
  }

  // ── Enregistrement ────────────────────────────────────────────────────────
  async function handleSave() {
    if (!selectedPatient || !form.doctorId || !form.date || !form.time) {
      setError('Veuillez renseigner le patient, le médecin, la date et l\'heure.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await createRendezVous({
        patientId:     selectedPatient.id,
        medecinUserId: form.doctorId,
        dateHeure:     `${form.date}T${form.time}:00`,
        dureeMinutes:  Number(form.duration),
        type:          form.type,
        motif:         form.notes || undefined,
      });
      setSaved(true);
      setTimeout(() => navigate('appointments'), 1200);
    } catch (e: any) {
      setError(e?.message ?? 'Erreur lors de l\'enregistrement.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => navigate('appointments')} className="adm-back-btn"><ArrowLeft size={16} /></button>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--c-t0)', margin: 0 }}>Nouveau rendez-vous</p>
          <p style={{ fontSize: '12px', color: 'var(--c-t2)', margin: '2px 0 0' }}>
            Pôle : <strong>{user?.pole ?? '—'}</strong>
          </p>
        </div>
      </div>

      {saved && (
        <div className="adm-alert adm-alert-success">
          <Save size={14} style={{ flexShrink: 0 }} />
          Rendez-vous enregistré avec succès !
        </div>
      )}
      {error && (
        <div className="adm-alert adm-alert-error">{error}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '14px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* ── Patient & Médecin ── */}
          <div className="adm-form-section">
            <div className="adm-form-section-head">
              <p className="adm-card-title">Patient &amp; Médecin</p>
            </div>
            <div className="adm-form-section-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

              {/* Recherche patient */}
              <div className="adm-form-field">
                <label className="adm-label">Patient *</label>
                <div ref={dropdownRef} style={{ position: 'relative' }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={14} style={{
                      position: 'absolute', left: '10px', color: 'var(--c-t3)', pointerEvents: 'none', flexShrink: 0,
                    }} />
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="Rechercher par nom ou IPP…"
                      value={patientQuery}
                      onChange={(e) => { setSelectedPatient(null); setPatientQuery(e.target.value); }}
                      onFocus={() => patientResults.length > 0 && setShowDropdown(true)}
                      style={{ paddingLeft: '32px', paddingRight: selectedPatient ? '32px' : '10px' }}
                    />
                    {(patientQuery || selectedPatient) && (
                      <button
                        type="button"
                        onClick={clearPatient}
                        style={{ position: 'absolute', right: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-t3)', padding: '2px', display: 'flex' }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Dropdown résultats */}
                  {showDropdown && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 50,
                      background: 'var(--c-surf)', border: '1px solid var(--c-bdr)',
                      borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,.12)',
                      maxHeight: '220px', overflowY: 'auto',
                    }}>
                      {searching ? (
                        <div style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--c-t3)' }}>Recherche…</div>
                      ) : patientResults.length === 0 ? (
                        <div style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--c-t3)' }}>Aucun patient trouvé</div>
                      ) : (
                        patientResults.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onMouseDown={() => selectPatient(p)}
                            style={{
                              display: 'block', width: '100%', textAlign: 'left',
                              padding: '9px 14px', background: 'none', border: 'none',
                              cursor: 'pointer', borderBottom: '1px solid var(--c-bdr)',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--c-surf2)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                          >
                            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--c-t0)' }}>
                              {p.prenom} {p.nom}
                            </p>
                            <p style={{ margin: 0, fontSize: '11px', color: 'var(--c-t3)', fontFamily: 'monospace' }}>
                              {p.numeroIpp}{p.telephoneMobile ? ` · ${p.telephoneMobile}` : ''}
                            </p>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Service + Médecin */}
              <div className="adm-form-grid adm-form-grid-2">
                <div className="adm-form-field">
                  <label className="adm-label">Service</label>
                  <select value={form.serviceFilter} onChange={(e) => handleChange('serviceFilter', e.target.value)} className="adm-input">
                    <option value="">Tous les services</option>
                    {serviceOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="adm-form-field">
                  <label className="adm-label">Médecin *</label>
                  <select value={form.doctorId} onChange={(e) => handleChange('doctorId', e.target.value)} className="adm-input">
                    <option value="">Sélectionner un médecin</option>
                    {filteredDoctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}{d.serviceCode ? ` — ${d.serviceCode}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ── Date et heure ── */}
          <div className="adm-form-section">
            <div className="adm-form-section-head">
              <div className="adm-form-section-icon adm-fsi-blue"><CalendarDays size={13} /></div>
              <p className="adm-card-title">Date et heure</p>
            </div>
            <div className="adm-form-section-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="adm-form-grid adm-form-grid-2">
                <div className="adm-form-field">
                  <label className="adm-label">Date *</label>
                  <input type="date" value={form.date} onChange={(e) => handleChange('date', e.target.value)} className="adm-input" />
                </div>
                <div className="adm-form-field">
                  <label className="adm-label">Durée</label>
                  <select value={form.duration} onChange={(e) => handleChange('duration', e.target.value)} className="adm-input">
                    <option value="15">15 min</option>
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">1 heure</option>
                    <option value="90">1h30</option>
                    <option value="120">2 heures</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="adm-label" style={{ marginBottom: '8px' }}>Créneau horaire *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                  {timeSlots.map((t) => (
                    <button key={t} type="button" onClick={() => handleChange('time', t)}
                      className={form.time === t ? 'adm-btn adm-btn-primary' : 'adm-btn'}
                      style={{ justifyContent: 'center', height: '30px', fontSize: '11.5px' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Détails ── */}
          <div className="adm-form-section">
            <div className="adm-form-section-head">
              <p className="adm-card-title">Détails du rendez-vous</p>
            </div>
            <div className="adm-form-section-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="adm-form-field">
                <label className="adm-label">Type de consultation</label>
                <select value={form.type} onChange={(e) => handleChange('type', e.target.value)} className="adm-input">
                  {appointmentTypes.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="adm-form-field">
                <label className="adm-label">Notes / Motif</label>
                <textarea value={form.notes} onChange={(e) => handleChange('notes', e.target.value)}
                  rows={3} className="adm-input" placeholder="Motif de consultation, symptômes…" />
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
                  <p className="adm-cell-name" style={{ color: 'var(--c-accent)' }}>
                    {selectedPatient.prenom} {selectedPatient.nom}
                  </p>
                  <p className="adm-cell-mono" style={{ color: 'var(--c-accent)' }}>{selectedPatient.numeroIpp}</p>
                </div>
              </div>
            </div>
          )}

          {/* Récapitulatif */}
          <div className="adm-card">
            <div className="adm-card-head">
              <p className="adm-card-title">Récapitulatif RDV</p>
            </div>
            <div className="adm-card-body">
              {[
                { label: 'Pôle',    value: user?.pole ?? '—' },
                { label: 'Médecin', value: selectedDoctor ? `${selectedDoctor.name}${selectedDoctor.serviceCode ? ` (${selectedDoctor.serviceCode})` : ''}` : '—' },
                { label: 'Date',    value: form.date ? new Date(form.date).toLocaleDateString('fr-FR') : '—' },
                { label: 'Heure',   value: form.time || '—' },
                { label: 'Durée',   value: `${form.duration} min` },
                { label: 'Type',    value: form.type },
              ].map(({ label, value }) => (
                <div key={label} className="adm-summary-row">
                  <span className="adm-summary-k">{label}</span>
                  <span className="adm-summary-v">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={handleSave} disabled={saving} className="adm-btn adm-btn-primary"
              style={{ height: '38px', justifyContent: 'center', gap: '6px' }}>
              <Save size={14} /> {saving ? 'Enregistrement…' : 'Confirmer le rendez-vous'}
            </button>
            <button onClick={() => navigate('appointments')} className="adm-btn"
              style={{ height: '38px', justifyContent: 'center' }}>
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
