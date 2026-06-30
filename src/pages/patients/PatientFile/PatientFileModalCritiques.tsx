import { useState } from 'react';
import { Save } from 'lucide-react';
import { patchDossier } from '../../../services/patchDossier';
import PatientFileModal from './PatientFileModal';

const GROUPE_SANGUIN = ['A', 'B', 'AB', 'O'];
const RHESUS         = ['Positif', 'Négatif'];
const STATUT_REANIM  = ['Autorisé', 'Non autorisé', 'Conditionnel'];

export default function PatientFileModalCritiques({ patientId, dossier, onClose, onSaved }: {
  patientId: string; dossier: any; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    groupeSanguinAbo:     dossier.groupeSanguinAbo ?? '',
    groupeSanguinRhesus:  dossier.groupeSanguinRhesus ?? '',
    statutReanimatoire:   dossier.statutReanimatoire ?? '',
    directivesAnticipees: dossier.directivesAnticipees,
  });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState(null as any);

  async function save() {
    setSaving(true); setErr(null);
    try {
      await patchDossier.updateCritiques(patientId, {
        groupeSanguinAbo:     form.groupeSanguinAbo     || undefined,
        groupeSanguinRhesus:  form.groupeSanguinRhesus  || undefined,
        statutReanimatoire:   form.statutReanimatoire   || undefined,
        directivesAnticipees: form.directivesAnticipees,
      });
      onSaved();
    } catch (e: any) { setErr(e?.message ?? 'Erreur.'); } finally { setSaving(false); }
  }

  return (
    <PatientFileModal title="Données critiques" onClose={onClose}>
      {err && <div className="adm-alert adm-alert-error" style={{ marginBottom: 12 }}>{err}</div>}
      <p style={{ margin: '0 0 12px', fontSize: 11, color: '#ef4444' }}>
        Le groupe sanguin ne remplace jamais la double détermination biologique avant toute transfusion.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div className="adm-form-field">
          <label className="adm-label">Groupe sanguin</label>
          <select className="adm-input" value={form.groupeSanguinAbo} onChange={e => setForm(f => ({ ...f, groupeSanguinAbo: e.target.value }))}>
            <option value="">— Sélectionner —</option>
            {GROUPE_SANGUIN.map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div className="adm-form-field">
          <label className="adm-label">Rhésus</label>
          <select className="adm-input" value={form.groupeSanguinRhesus} onChange={e => setForm(f => ({ ...f, groupeSanguinRhesus: e.target.value }))}>
            <option value="">— Sélectionner —</option>
            {RHESUS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>
      <div className="adm-form-field" style={{ marginBottom: 12 }}>
        <label className="adm-label">Directive réanimation</label>
        <select className="adm-input" value={form.statutReanimatoire} onChange={e => setForm(f => ({ ...f, statutReanimatoire: e.target.value }))}>
          <option value="">— Sélectionner —</option>
          {STATUT_REANIM.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <input type="checkbox" id="directives" checked={form.directivesAnticipees}
          onChange={e => setForm(f => ({ ...f, directivesAnticipees: e.target.checked }))} />
        <label htmlFor="directives" style={{ fontSize: 12, color: 'var(--c-t1)' }}>
          Directives anticipées renseignées
        </label>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid var(--c-bdr)', paddingTop: 12 }}>
        <button onClick={onClose} className="adm-btn" style={{ height: 34 }}>Annuler</button>
        <button onClick={save} disabled={saving} className="adm-btn adm-btn-primary" style={{ height: 34, gap: 6 }}>
          <Save size={13} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </PatientFileModal>
  );
}
