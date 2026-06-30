import axios from 'axios';
import { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

const BASE = import.meta.env.VITE_API_URL ?? '/api';
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}` });

const MODES_ENTREE = ['Urgences', 'Programmé', 'Transfert', 'Naissance', 'Autre'] as const;

export default function AdmissionListModalModifier({ adm, onClose, onDone }: {
  adm: any; onClose: () => void; onDone: () => void;
}) {
  const [form, setForm] = useState({
    dateAdmission:        new Date(adm.admissionDate).toISOString().slice(0, 16),
    modeEntree:           '',
    motifHospitalisation: adm.reason === '—' ? '' : adm.reason,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState(null as any);

  async function save() {
    if (!form.motifHospitalisation.trim()) { setErr('Le motif est obligatoire.'); return; }
    setSaving(true); setErr(null);
    try {
      await axios.patch(`${BASE}/sejours/${adm.id}`, {
        dateAdmission:        new Date(form.dateAdmission).toISOString(),
        ...(form.modeEntree && { modeEntree: form.modeEntree }),
        motifHospitalisation: form.motifHospitalisation.trim(),
      }, { headers: auth() });
      onDone();
    } catch (e: any) { setErr(e?.message ?? 'Erreur.'); }
    finally { setSaving(false); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'var(--c-bg)', borderRadius: 12, width: '100%', maxWidth: 480, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--c-bdr)' }}>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--c-t0)' }}>Modifier l&#39;admission</p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--c-t3)' }}>{adm.patientName}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-t3)', display: 'flex' }}><X size={18} /></button>
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {err && <div className="adm-alert adm-alert-error">{err}</div>}
          <div className="adm-form-field">
            <label className="adm-label">Date et heure d&#39;admission *</label>
            <input type="datetime-local" className="adm-input" value={form.dateAdmission}
              onChange={e => setForm(f => ({ ...f, dateAdmission: e.target.value }))} />
          </div>
          <div className="adm-form-field">
            <label className="adm-label">Mode d&#39;entrée</label>
            <select className="adm-input" value={form.modeEntree}
              onChange={e => setForm(f => ({ ...f, modeEntree: e.target.value }))}>
              <option value="">Inchangé</option>
              {MODES_ENTREE.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="adm-form-field">
            <label className="adm-label">Motif *</label>
            <input className="adm-input" value={form.motifHospitalisation}
              onChange={e => setForm(f => ({ ...f, motifHospitalisation: e.target.value }))}
              placeholder="Motif" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', padding: '12px 20px', borderTop: '1px solid var(--c-bdr)' }}>
          <button onClick={onClose} className="adm-btn" style={{ height: 34 }}>Annuler</button>
          <button onClick={save} disabled={saving} className="adm-btn adm-btn-primary" style={{ height: 34, gap: 6 }}>
            {saving ? <><Loader2 size={13} style={{ animation: 'spin 0.7s linear infinite' }} /> Enregistrement...</> : <><Save size={13} /> Enregistrer</>}
          </button>
        </div>
      </div>
    </div>
  );
}
