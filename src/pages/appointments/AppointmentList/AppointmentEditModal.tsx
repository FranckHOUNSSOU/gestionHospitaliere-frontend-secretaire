import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { patchRendezVous } from '../../../services/patchRendezVous';

const TIME_SLOTS = [
  '07:30','08:00','08:30','09:00','09:30','10:00','10:30','11:00',
  '11:30','12:00','14:00','14:30','15:00','15:30','16:00','16:30','17:00',
];

const APPOINTMENT_TYPES = ['Consultation','Suivi','Contrôle','Examen','Pré-opératoire','Urgence','Vaccination','Autre'];

export default function AppointmentEditModal({ appt, onClose, onSaved }: {
  appt: any; onClose: () => void; onSaved: (updated: any) => void;
}) {
  const [form, setForm] = useState({
    date:     appt.date,
    time:     appt.time,
    duration: String(appt.duration),
    type:     appt.type,
    notes:    appt.notes ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState(null as any);

  function handleChange(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!form.date || !form.time) { setError('Date et heure obligatoires.'); return; }
    setSaving(true); setError(null);
    try {
      await patchRendezVous.updateRendezVous(appt.id, {
        dateHeure:    `${form.date}T${form.time}:00`,
        dureeMinutes: Number(form.duration),
        type:         form.type,
        motif:        form.notes || undefined,
      });
      onSaved({ ...appt, date: form.date, time: form.time, duration: Number(form.duration), type: form.type, notes: form.notes || undefined });
    } catch (e: any) {
      setError(e?.message ?? 'Erreur lors de la modification.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)' }}
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'var(--c-bg)', borderRadius: 12, width: '100%', maxWidth: 520, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--c-bdr)' }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: 'var(--c-t0)' }}>Modifier le rendez-vous</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-t3)', display: 'flex' }}><X size={18} /></button>
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'var(--c-surf2)', borderRadius: 8, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[{ k: 'Patient', v: appt.patientName }, { k: 'Médecin', v: appt.doctorName }, { k: 'Service', v: appt.department }].map(({ k, v }) => (
              <div key={k} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                <span style={{ fontSize: 11, color: 'var(--c-t3)', minWidth: 60 }}>{k}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-t1)' }}>{v || '—'}</span>
              </div>
            ))}
          </div>
          {error && <div className="adm-alert adm-alert-error">{error}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="adm-form-field">
              <label className="adm-label">Date *</label>
              <input type="date" className="adm-input" value={form.date} onChange={e => handleChange('date', e.target.value)} />
            </div>
            <div className="adm-form-field">
              <label className="adm-label">Durée</label>
              <select className="adm-input" value={form.duration} onChange={e => handleChange('duration', e.target.value)}>
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">1 heure</option>
                <option value="90">1h30</option>
                <option value="120">2 heures</option>
              </select>
            </div>
          </div>
          <div className="adm-form-field">
            <label className="adm-label">Créneau horaire *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5 }}>
              {TIME_SLOTS.map((t) => (
                <button key={t} type="button" onClick={() => handleChange('time', t)}
                  className={form.time === t ? 'adm-btn adm-btn-primary' : 'adm-btn'}
                  style={{ justifyContent: 'center', height: 28, fontSize: 11 }}>{t}</button>
              ))}
            </div>
          </div>
          <div className="adm-form-field">
            <label className="adm-label">Type de consultation</label>
            <select className="adm-input" value={form.type} onChange={e => handleChange('type', e.target.value)}>
              {APPOINTMENT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="adm-form-field">
            <label className="adm-label">Notes / Motif</label>
            <textarea className="adm-input" rows={2} value={form.notes}
              onChange={e => handleChange('notes', e.target.value)} placeholder="Motif de consultation…" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '12px 20px', borderTop: '1px solid var(--c-bdr)', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="adm-btn" style={{ height: 36 }}>Annuler</button>
          <button onClick={handleSave} disabled={saving} className="adm-btn adm-btn-primary" style={{ height: 36, gap: 6 }}>
            <Save size={13} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}
