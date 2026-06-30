import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowLeft, Save, CalendarDays, Search, X, Loader2 } from 'lucide-react';
import { useNavigation } from '../../../context/NavigationContext';
import { useAuth } from '../../../context/AuthContext';
import { useDoctors } from '../../../context/DoctorContext';
import { postRendezVous } from '../../../services/postRendezVous';
import { getPatient } from '../../../services/getPatient';

const timeSlots = [
  '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00',
  '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
];

const appointmentTypes = ['Consultation', 'Suivi', 'Contrôle', 'Examen', 'Pré-opératoire', 'Urgence', 'Vaccination', 'Autre'];

export default function AppointmentForm() {
  const { navigate }   = useNavigation();
  const { user }       = useAuth();
  const { doctors }    = useDoctors();
  const location       = useLocation();
  const prefillDate    = (location.state as { prefillDate?: string } | null)?.prefillDate ?? '';

  const [patientQuery,    setPatientQuery]    = useState('');
  const [patientResults,  setPatientResults]  = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState(null as any);
  const [showDropdown,    setShowDropdown]    = useState(false);
  const [searching,       setSearching]       = useState(false);
  const dropdownRef = useRef(null as any);
  const searchTimer = useRef(null as any);

  const [form, setForm] = useState({
    serviceFilter: '', doctorId: '',
    date: prefillDate, time: '', duration: '30', type: 'Consultation', notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState(null as any);
  const [saved,  setSaved]  = useState(false);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

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
        const data = await getPatient.rechercher(patientQuery);
        setPatientResults(data);
        setShowDropdown(true);
      } catch {
        setPatientResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, [patientQuery]);

  function selectPatient(p: any) {
    setSelectedPatient(p);
    setPatientQuery(`${p.prenom} ${p.nom} — ${p.numeroIpp}`);
    setShowDropdown(false);
  }

  function clearPatient() {
    setSelectedPatient(null);
    setPatientQuery('');
    setPatientResults([]);
  }

  const serviceOptions = Array.from(new Set((doctors as any[]).map((d: any) => d.department))).filter(Boolean).sort();
  const filteredDoctors = form.serviceFilter
    ? (doctors as any[]).filter((d: any) => d.department === form.serviceFilter)
    : (doctors as any[]);
  const selectedDoctor = (doctors as any[]).find((d: any) => d.id === form.doctorId);

  function handleChange(field: string, value: string) {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'serviceFilter') updated.doctorId = '';
      return updated;
    });
  }

  async function handleSave() {
    if (!selectedPatient || !form.doctorId || !form.date || !form.time) {
      setError('Veuillez renseigner le patient, le médecin, la date et l\'heure.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await postRendezVous.createRendezVous({
        patientId:     selectedPatient.id,
        medecinUserId: form.doctorId,
        dateHeure:     `${form.date}T${form.time}:00`,
        dureeMinutes:  Number(form.duration),
        type:          form.type,
        motif:         form.notes || undefined,
      });
      setSaved(true);
      setTimeout(() => navigate('dashboard'), 1200);
    } catch (e: any) {
      setError(e?.message ?? 'Erreur lors de l\'enregistrement.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

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

          <div className="adm-form-section">
            <div className="adm-form-section-head">
              <p className="adm-card-title">Patient &amp; Médecin</p>
            </div>
            <div className="adm-form-section-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

              <div className="adm-form-field">
                <label className="adm-label">Rechercher un patient (nom, prénom ou IPP) *</label>
                <div ref={dropdownRef} style={{ position: 'relative' }}>
                  <div className="adm-search" style={{ width: '100%' }}>
                    <span className="adm-search-icon">
                      {searching
                        ? <Loader2 size={13} style={{ animation: 'spin 0.7s linear infinite' }} />
                        : <Search size={13} />}
                    </span>
                    <input
                      className="adm-search-input"
                      placeholder=""
                      value={patientQuery}
                      onChange={(e) => { setSelectedPatient(null); setPatientQuery(e.target.value); }}
                      onFocus={() => patientResults.length > 0 && setShowDropdown(true)}
                    />
                    {patientQuery && (
                      <button type="button" onClick={clearPatient}
                        style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-t3)', display: 'flex', alignItems: 'center' }}>
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {showDropdown && patientResults.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: 'var(--c-bg)', border: '1px solid var(--c-bdr)', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', marginTop: '4px', maxHeight: '240px', overflowY: 'auto' }}>
                      {(patientResults as any[]).map((p) => (
                        <div key={p.id} onMouseDown={() => selectPatient(p)}
                          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--c-bdr)', transition: 'background 0.1s' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--c-surf2)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
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

                  {showDropdown && patientResults.length === 0 && !searching && patientQuery.trim().length >= 2 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: 'var(--c-bg)', border: '1px solid var(--c-bdr)', borderRadius: '8px', padding: '16px', textAlign: 'center', fontSize: '13px', color: 'var(--c-t3)', marginTop: '4px' }}>
                      Aucun patient trouvé
                    </div>
                  )}
                </div>
              </div>

              <div className="adm-form-grid adm-form-grid-2">
                <div className="adm-form-field">
                  <label className="adm-label">Service</label>
                  <select value={form.serviceFilter} onChange={(e) => handleChange('serviceFilter', e.target.value)} className="adm-input">
                    <option value="">Tous les services</option>
                    {(serviceOptions as string[]).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="adm-form-field">
                  <label className="adm-label">Médecin *</label>
                  <select value={form.doctorId} onChange={(e) => handleChange('doctorId', e.target.value)} className="adm-input">
                    <option value="">Sélectionner un médecin</option>
                    {filteredDoctors.map((d: any) => (
                      <option key={d.id} value={d.id}>
                        {d.name}{d.serviceCode ? ` — ${d.serviceCode}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

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

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

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
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
