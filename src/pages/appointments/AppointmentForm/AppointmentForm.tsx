import { useState } from 'react';
import { ArrowLeft, Save, CalendarDays } from 'lucide-react';
import { useNavigation } from '../../../context/NavigationContext';
import { patients, departments } from '../../../services/mockData';
import { useDoctors } from '../../../context/DoctorContext';

const timeSlots = [
  '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00',
  '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
];

const appointmentTypes = ['Consultation', 'Suivi', 'Contrôle', 'Examen', 'Pré-opératoire', 'Urgence', 'Vaccination', 'Autre'];

export default function AppointmentForm() {
  const { navigate } = useNavigation();
  const { doctors } = useDoctors();
  const [form, setForm] = useState({
    patientId: '', doctorId: '', department: '',
    date: '', time: '', duration: '30', type: 'Consultation', notes: '',
  });
  const [saved, setSaved] = useState(false);

  function handleChange(field: string, value: string) {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'department') updated.doctorId = '';
      return updated;
    });
  }

  const filteredDoctors = form.department ? doctors.filter((d) => d.department === form.department) : doctors;
  const selectedPatient = patients.find((p) => p.id === form.patientId);
  const selectedDoctor = doctors.find((d) => d.id === form.doctorId);

  function handleSave() {
    setSaved(true);
    setTimeout(() => navigate('appointments'), 1000);
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => navigate('appointments')} className="adm-back-btn"><ArrowLeft size={16} /></button>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--c-t0)', margin: 0 }}>Nouveau rendez-vous</p>
          <p style={{ fontSize: '12px', color: 'var(--c-t2)', margin: '2px 0 0' }}>Planifier un rendez-vous médical</p>
        </div>
      </div>

      {saved && (
        <div className="adm-alert adm-alert-success">
          <Save size={14} style={{ flexShrink: 0 }} />
          Rendez-vous enregistré avec succès !
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '14px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Patient & Médecin */}
          <div className="adm-form-section">
            <div className="adm-form-section-head">
              <p className="adm-card-title">Patient & Médecin</p>
            </div>
            <div className="adm-form-section-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="adm-form-field">
                <label className="adm-label">Patient *</label>
                <select value={form.patientId} onChange={(e) => handleChange('patientId', e.target.value)} className="adm-input">
                  <option value="">Sélectionner un patient</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName} — {p.phone}</option>
                  ))}
                </select>
              </div>
              <div className="adm-form-grid adm-form-grid-2">
                <div className="adm-form-field">
                  <label className="adm-label">Service *</label>
                  <select value={form.department} onChange={(e) => handleChange('department', e.target.value)} className="adm-input">
                    <option value="">Sélectionner un service</option>
                    {departments.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div className="adm-form-field">
                  <label className="adm-label">Médecin *</label>
                  <select value={form.doctorId} onChange={(e) => handleChange('doctorId', e.target.value)} className="adm-input">
                    <option value="">Sélectionner un médecin</option>
                    {filteredDoctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Date et heure */}
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

          {/* Détails */}
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
                  rows={3} className="adm-input" placeholder="Motif de consultation, symptômes..." />
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
                  {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                </div>
                <div>
                  <p className="adm-cell-name" style={{ color: 'var(--c-accent)' }}>{selectedPatient.firstName} {selectedPatient.lastName}</p>
                  <p className="adm-cell-mono" style={{ color: 'var(--c-accent)' }}>{selectedPatient.phone}</p>
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
                { label: 'Médecin',  value: selectedDoctor?.name ?? '—' },
                { label: 'Date',     value: form.date ? new Date(form.date).toLocaleDateString('fr-FR') : '—' },
                { label: 'Heure',    value: form.time || '—' },
                { label: 'Durée',    value: `${form.duration} min` },
                { label: 'Type',     value: form.type },
              ].map(({ label, value }) => (
                <div key={label} className="adm-summary-row">
                  <span className="adm-summary-k">{label}</span>
                  <span className="adm-summary-v">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={handleSave} className="adm-btn adm-btn-primary" style={{ height: '38px', justifyContent: 'center', gap: '6px' }}>
              <Save size={14} /> Confirmer le rendez-vous
            </button>
            <button onClick={() => navigate('appointments')} className="adm-btn" style={{ height: '38px', justifyContent: 'center' }}>
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
