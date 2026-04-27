import { useState } from 'react';
import { ArrowLeft, Save, BedDouble, User, Stethoscope } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { patients, departments } from '../../services/mockData';
import { useDoctors } from '../../context/DoctorContext';

export default function AdmissionForm() {
  const { navigate } = useNavigation();
  const { doctors } = useDoctors();
  const [form, setForm] = useState({
    patientId: '', doctorId: '', department: '', room: '', bed: '',
    admissionDate: new Date().toISOString().split('T')[0],
    expectedDischargeDate: '', reason: '', notes: '',
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

  function handleSave() {
    setSaved(true);
    setTimeout(() => navigate('admissions'), 1000);
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => navigate('admissions')} className="adm-back-btn"><ArrowLeft size={16} /></button>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--c-t0)', margin: 0 }}>Nouvelle admission</p>
          <p style={{ fontSize: '12px', color: 'var(--c-t2)', margin: '2px 0 0' }}>Enregistrer l'hospitalisation d'un patient</p>
        </div>
      </div>

      {saved && (
        <div className="adm-alert adm-alert-success">
          <Save size={14} style={{ flexShrink: 0 }} />
          Admission enregistrée avec succès !
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '14px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Patient */}
          <div className="adm-form-section">
            <div className="adm-form-section-head">
              <div className="adm-form-section-icon adm-fsi-blue"><User size={13} /></div>
              <p className="adm-card-title">Sélection du patient</p>
            </div>
            <div className="adm-form-section-body">
              <div className="adm-form-field">
                <label className="adm-label">Patient *</label>
                <select value={form.patientId} onChange={(e) => handleChange('patientId', e.target.value)} className="adm-input">
                  <option value="">Sélectionner un patient</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName} — {p.phone}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Hébergement */}
          <div className="adm-form-section">
            <div className="adm-form-section-head">
              <div className="adm-form-section-icon adm-fsi-amber"><BedDouble size={13} /></div>
              <p className="adm-card-title">Hébergement</p>
            </div>
            <div className="adm-form-section-body">
              <div className="adm-form-grid adm-form-grid-2">
                <div className="adm-form-field" style={{ gridColumn: '1 / -1' }}>
                  <label className="adm-label">Service *</label>
                  <select value={form.department} onChange={(e) => handleChange('department', e.target.value)} className="adm-input">
                    <option value="">Sélectionner un service</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>{d.name} ({d.beds - d.occupiedBeds} lits disponibles)</option>
                    ))}
                  </select>
                </div>
                <div className="adm-form-field">
                  <label className="adm-label">N° chambre *</label>
                  <input type="text" value={form.room} onChange={(e) => handleChange('room', e.target.value)}
                    className="adm-input" placeholder="Ex: C-204" />
                </div>
                <div className="adm-form-field">
                  <label className="adm-label">N° lit *</label>
                  <input type="text" value={form.bed} onChange={(e) => handleChange('bed', e.target.value)}
                    className="adm-input" placeholder="Ex: B1" />
                </div>
              </div>
            </div>
          </div>

          {/* Informations médicales */}
          <div className="adm-form-section">
            <div className="adm-form-section-head">
              <div className="adm-form-section-icon adm-fsi-blue"><Stethoscope size={13} /></div>
              <p className="adm-card-title">Informations médicales</p>
            </div>
            <div className="adm-form-section-body">
              <div className="adm-form-grid adm-form-grid-2">
                <div className="adm-form-field">
                  <label className="adm-label">Médecin responsable *</label>
                  <select value={form.doctorId} onChange={(e) => handleChange('doctorId', e.target.value)} className="adm-input">
                    <option value="">Sélectionner un médecin</option>
                    {filteredDoctors.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>
                    ))}
                  </select>
                </div>
                <div className="adm-form-field">
                  <label className="adm-label">Motif d'admission *</label>
                  <input type="text" value={form.reason} onChange={(e) => handleChange('reason', e.target.value)}
                    className="adm-input" placeholder="Motif d'hospitalisation" />
                </div>
                <div className="adm-form-field">
                  <label className="adm-label">Date d'admission *</label>
                  <input type="date" value={form.admissionDate} onChange={(e) => handleChange('admissionDate', e.target.value)} className="adm-input" />
                </div>
                <div className="adm-form-field">
                  <label className="adm-label">Sortie prévue</label>
                  <input type="date" value={form.expectedDischargeDate} onChange={(e) => handleChange('expectedDischargeDate', e.target.value)} className="adm-input" />
                </div>
                <div className="adm-form-field" style={{ gridColumn: '1 / -1' }}>
                  <label className="adm-label">Notes</label>
                  <textarea value={form.notes} onChange={(e) => handleChange('notes', e.target.value)}
                    rows={3} className="adm-input" placeholder="Informations supplémentaires..." />
                </div>
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
              <p className="adm-card-title">Récapitulatif</p>
            </div>
            <div className="adm-card-body">
              {[
                { label: 'Patient',     value: form.patientId ? `${selectedPatient?.firstName ?? ''} ${selectedPatient?.lastName ?? ''}`.trim() || '—' : '—' },
                { label: 'Service',     value: form.department || '—' },
                { label: 'Chambre',     value: form.room || '—' },
                { label: 'Lit',         value: form.bed || '—' },
                { label: 'Médecin',     value: form.doctorId ? (doctors.find((d) => d.id === form.doctorId)?.name ?? '—') : '—' },
                { label: 'Date entrée', value: form.admissionDate ? new Date(form.admissionDate).toLocaleDateString('fr-FR') : '—' },
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
              <Save size={14} /> Enregistrer l'admission
            </button>
            <button onClick={() => navigate('admissions')} className="adm-btn" style={{ height: '38px', justifyContent: 'center' }}>
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
