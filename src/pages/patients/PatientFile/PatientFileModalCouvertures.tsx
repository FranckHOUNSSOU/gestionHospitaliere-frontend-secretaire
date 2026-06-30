import { useState } from 'react';
import { Plus } from 'lucide-react';
import { postDossier } from '../../../services/postDossier';
import { patchDossier } from '../../../services/patchDossier';
import PatientFileModal from './PatientFileModal';
import PatientFileDivider from './PatientFileDivider';

const STATUT_COUVERTURE = ['Assuré principal', 'Ayant droit'];

export default function PatientFileModalCouvertures({ patientId, items, onClose, onChanged }: {
  patientId: string; items: any[]; onClose: () => void; onChanged: () => void;
}) {
  const [form, setForm] = useState({ typeCouverture: '', nomOrganisme: '', numeroAssure: '', statut: '', dateDebut: '' });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState(null as any);

  async function add() {
    if (!form.typeCouverture.trim() || !form.nomOrganisme.trim() || !form.numeroAssure.trim() || !form.statut || !form.dateDebut) {
      setErr('Tous les champs obligatoires doivent être remplis.'); return;
    }
    setSaving(true); setErr(null);
    try {
      await postDossier.createCouverture(patientId, { ...form, estActive: true });
      setForm({ typeCouverture: '', nomOrganisme: '', numeroAssure: '', statut: '', dateDebut: '' });
      onChanged();
    } catch (e: any) { setErr(e?.message ?? 'Erreur.'); } finally { setSaving(false); }
  }

  async function toggleActif(cid: string, estActive: boolean) {
    try { await patchDossier.updateCouverture(patientId, cid, { estActive: !estActive }); onChanged(); } catch { /* silent */ }
  }

  return (
    <PatientFileModal title="Couverture sociale" onClose={onClose}>
      {items.length === 0
        ? <p style={{ fontSize: 12, color: 'var(--c-t3)', fontStyle: 'italic', marginBottom: 12 }}>Aucune couverture enregistrée.</p>
        : items.map((c: any) => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--c-surf2)', borderRadius: 8, marginBottom: 6 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--c-t1)' }}>{c.nomOrganisme}</p>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--c-t3)' }}>{c.typeCouverture} · N°{c.numeroAssure}</p>
            </div>
            <button onClick={() => toggleActif(c.id, c.estActive)} style={{
              fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99, border: 'none', cursor: 'pointer',
              background: c.estActive ? '#dcfce7' : '#f1f5f9', color: c.estActive ? '#166534' : '#64748b',
            }}>
              {c.estActive ? 'Active' : 'Inactive'}
            </button>
          </div>
        ))
      }
      <PatientFileDivider />
      <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, color: 'var(--c-t1)' }}>Ajouter une couverture</p>
      {err && <div className="adm-alert adm-alert-error" style={{ marginBottom: 10 }}>{err}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="adm-form-field">
          <label className="adm-label">Type *</label>
          <input className="adm-input" value={form.typeCouverture} onChange={e => setForm(f => ({ ...f, typeCouverture: e.target.value }))} />
        </div>
        <div className="adm-form-field">
          <label className="adm-label">Organisme *</label>
          <input className="adm-input" value={form.nomOrganisme} onChange={e => setForm(f => ({ ...f, nomOrganisme: e.target.value }))} />
        </div>
        <div className="adm-form-field">
          <label className="adm-label">N° Assuré *</label>
          <input className="adm-input" value={form.numeroAssure} onChange={e => setForm(f => ({ ...f, numeroAssure: e.target.value }))} />
        </div>
        <div className="adm-form-field">
          <label className="adm-label">Statut *</label>
          <select className="adm-input" value={form.statut} onChange={e => setForm(f => ({ ...f, statut: e.target.value }))}>
            <option value="">—</option>
            {STATUT_COUVERTURE.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="adm-form-field">
          <label className="adm-label">Date de début *</label>
          <input type="date" className="adm-input" value={form.dateDebut} onChange={e => setForm(f => ({ ...f, dateDebut: e.target.value }))} />
        </div>
      </div>
      <button onClick={add} disabled={saving} className="adm-btn adm-btn-primary" style={{ marginTop: 12, height: 34, gap: 6 }}>
        <Plus size={13} /> {saving ? 'Ajout…' : 'Ajouter'}
      </button>
    </PatientFileModal>
  );
}
