import { useState } from 'react';
import { Plus } from 'lucide-react';
import { postDossier } from '../../../services/postDossier';
import { deleteDossier } from '../../../services/deleteDossier';
import PatientFileModal from './PatientFileModal';
import PatientFileEntryRow from './PatientFileEntryRow';
import PatientFileDivider from './PatientFileDivider';

export default function PatientFileModalContacts({ patientId, items, onClose, onChanged }: {
  patientId: string; items: any[]; onClose: () => void; onChanged: () => void;
}) {
  const [form, setForm] = useState({ nom: '', prenom: '', lienParente: '', telephone: '', estPersonneConfiance: false });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState(null as any);

  async function add() {
    if (!form.nom.trim() || !form.prenom.trim() || !form.telephone.trim() || !form.lienParente.trim()) {
      setErr('Nom, prénom, lien et téléphone sont obligatoires.'); return;
    }
    setSaving(true); setErr(null);
    try {
      await postDossier.createContact(patientId, form);
      setForm({ nom: '', prenom: '', lienParente: '', telephone: '', estPersonneConfiance: false });
      onChanged();
    } catch (e: any) { setErr(e?.message ?? 'Erreur.'); } finally { setSaving(false); }
  }

  async function del(cid: string) {
    try { await deleteDossier.deleteContact(patientId, cid); onChanged(); } catch { /* silent */ }
  }

  return (
    <PatientFileModal title="Contacts d'urgence" onClose={onClose}>
      {items.length === 0
        ? <p style={{ fontSize: 12, color: 'var(--c-t3)', fontStyle: 'italic', marginBottom: 12 }}>Aucun contact enregistré.</p>
        : items.map((c: any) => (
          <PatientFileEntryRow key={c.id}
            label={`${c.prenom} ${c.nom}${c.estPersonneConfiance ? ' ★' : ''}`}
            sub={`${c.lienParente} · ${c.telephone}`}
            onDelete={() => del(c.id)}
          />
        ))
      }
      <PatientFileDivider />
      <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, color: 'var(--c-t1)' }}>Ajouter un contact</p>
      {err && <div className="adm-alert adm-alert-error" style={{ marginBottom: 10 }}>{err}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="adm-form-field">
          <label className="adm-label">Nom *</label>
          <input className="adm-input" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
        </div>
        <div className="adm-form-field">
          <label className="adm-label">Prénom *</label>
          <input className="adm-input" value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} />
        </div>
        <div className="adm-form-field">
          <label className="adm-label">Lien de parenté *</label>
          <input className="adm-input" value={form.lienParente} onChange={e => setForm(f => ({ ...f, lienParente: e.target.value }))} />
        </div>
        <div className="adm-form-field">
          <label className="adm-label">Téléphone *</label>
          <input className="adm-input" placeholder="+229 97 …" value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '10px 0 12px' }}>
        <input type="checkbox" id="confiance" checked={form.estPersonneConfiance}
          onChange={e => setForm(f => ({ ...f, estPersonneConfiance: e.target.checked }))} />
        <label htmlFor="confiance" style={{ fontSize: 12, color: 'var(--c-t1)' }}>Personne de confiance désignée</label>
      </div>
      <button onClick={add} disabled={saving} className="adm-btn adm-btn-primary" style={{ height: 34, gap: 6 }}>
        <Plus size={13} /> {saving ? 'Ajout…' : 'Ajouter'}
      </button>
    </PatientFileModal>
  );
}
