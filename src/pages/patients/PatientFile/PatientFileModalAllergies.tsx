import { useState } from 'react';
import { Plus } from 'lucide-react';
import { postDossier } from '../../../services/postDossier';
import { deleteDossier } from '../../../services/deleteDossier';
import PatientFileModal from './PatientFileModal';
import PatientFileEntryRow from './PatientFileEntryRow';
import PatientFileDivider from './PatientFileDivider';

const SEVERITE_ALLERGIE = ['Légère', 'Modérée', 'Sévère', 'Mortelle'];

export default function PatientFileModalAllergies({ patientId, items, onClose, onChanged }: {
  patientId: string; items: any[]; onClose: () => void; onChanged: () => void;
}) {
  const [form, setForm] = useState({ allergene: '', typeReaction: '', severite: '', dateDecouverte: '' });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState(null as any);

  async function add() {
    if (!form.allergene.trim()) { setErr('L\'allergène est obligatoire.'); return; }
    setSaving(true); setErr(null);
    try {
      await postDossier.createAllergie(patientId, {
        allergene:      form.allergene.trim(),
        typeReaction:   form.typeReaction   || undefined,
        severite:       form.severite       || undefined,
        dateDecouverte: form.dateDecouverte || undefined,
      });
      setForm({ allergene: '', typeReaction: '', severite: '', dateDecouverte: '' });
      onChanged();
    } catch (e: any) { setErr(e?.message ?? 'Erreur.'); } finally { setSaving(false); }
  }

  async function del(aid: string) {
    try { await deleteDossier.deleteAllergie(patientId, aid); onChanged(); } catch { /* silent */ }
  }

  return (
    <PatientFileModal title="Allergies connues" onClose={onClose}>
      {items.length === 0
        ? <p style={{ fontSize: 12, color: 'var(--c-t3)', fontStyle: 'italic', marginBottom: 12 }}>Aucune allergie enregistrée.</p>
        : items.map((a: any) => (
          <PatientFileEntryRow key={a.id}
            label={a.allergene}
            sub={[a.severite, a.typeReaction, a.dateDecouverte ? new Date(a.dateDecouverte).toLocaleDateString('fr-FR') : ''].filter(Boolean).join(' · ')}
            onDelete={() => del(a.id)}
          />
        ))
      }
      <PatientFileDivider />
      <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, color: 'var(--c-t1)' }}>Ajouter une allergie</p>
      {err && <div className="adm-alert adm-alert-error" style={{ marginBottom: 10 }}>{err}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="adm-form-field">
          <label className="adm-label">Allergène *</label>
          <input className="adm-input" value={form.allergene} onChange={e => setForm(f => ({ ...f, allergene: e.target.value }))} />
        </div>
        <div className="adm-form-field">
          <label className="adm-label">Type de réaction</label>
          <input className="adm-input" value={form.typeReaction} onChange={e => setForm(f => ({ ...f, typeReaction: e.target.value }))} />
        </div>
        <div className="adm-form-field">
          <label className="adm-label">Sévérité</label>
          <select className="adm-input" value={form.severite} onChange={e => setForm(f => ({ ...f, severite: e.target.value }))}>
            <option value="">—</option>
            {SEVERITE_ALLERGIE.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="adm-form-field">
          <label className="adm-label">Date de découverte</label>
          <input type="date" className="adm-input" value={form.dateDecouverte} onChange={e => setForm(f => ({ ...f, dateDecouverte: e.target.value }))} />
        </div>
      </div>
      <button onClick={add} disabled={saving} className="adm-btn adm-btn-primary" style={{ marginTop: 12, height: 34, gap: 6 }}>
        <Plus size={13} /> {saving ? 'Ajout…' : 'Ajouter'}
      </button>
    </PatientFileModal>
  );
}
