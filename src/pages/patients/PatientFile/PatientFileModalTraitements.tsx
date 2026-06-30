import { useState } from 'react';
import { Plus } from 'lucide-react';
import { postDossier } from '../../../services/postDossier';
import { deleteDossier } from '../../../services/deleteDossier';
import PatientFileModal from './PatientFileModal';
import PatientFileEntryRow from './PatientFileEntryRow';
import PatientFileDivider from './PatientFileDivider';

const NIVEAU_ALERTE_TRT = ['Faible', 'Modéré', 'Élevé', 'Critique'];

export default function PatientFileModalTraitements({ patientId, items, onClose, onChanged }: {
  patientId: string; items: any[]; onClose: () => void; onChanged: () => void;
}) {
  const [form, setForm] = useState({ nomMedicament: '', classe: '', posologieEnCours: '', niveauAlerte: '' });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState(null as any);

  async function add() {
    if (!form.nomMedicament.trim()) { setErr('Le médicament est obligatoire.'); return; }
    setSaving(true); setErr(null);
    try {
      await postDossier.createTraitement(patientId, {
        nomMedicament:    form.nomMedicament.trim(),
        classe:           form.classe            || undefined,
        posologieEnCours: form.posologieEnCours  || undefined,
        niveauAlerte:     form.niveauAlerte      || undefined,
      });
      setForm({ nomMedicament: '', classe: '', posologieEnCours: '', niveauAlerte: '' });
      onChanged();
    } catch (e: any) { setErr(e?.message ?? 'Erreur.'); } finally { setSaving(false); }
  }

  async function del(tid: string) {
    try { await deleteDossier.deleteTraitement(patientId, tid); onChanged(); } catch { /* silent */ }
  }

  return (
    <PatientFileModal title="Traitements à risque" onClose={onClose}>
      {items.length === 0
        ? <p style={{ fontSize: 12, color: 'var(--c-t3)', fontStyle: 'italic', marginBottom: 12 }}>Aucun traitement enregistré.</p>
        : items.map((t: any) => (
          <PatientFileEntryRow key={t.id}
            label={t.nomMedicament}
            sub={[t.classe, t.posologieEnCours, t.niveauAlerte].filter(Boolean).join(' · ')}
            onDelete={() => del(t.id)}
          />
        ))
      }
      <PatientFileDivider />
      <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, color: 'var(--c-t1)' }}>Ajouter un traitement</p>
      {err && <div className="adm-alert adm-alert-error" style={{ marginBottom: 10 }}>{err}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="adm-form-field">
          <label className="adm-label">Médicament *</label>
          <input className="adm-input" value={form.nomMedicament} onChange={e => setForm(f => ({ ...f, nomMedicament: e.target.value }))} />
        </div>
        <div className="adm-form-field">
          <label className="adm-label">Classe thérapeutique</label>
          <input className="adm-input" value={form.classe} onChange={e => setForm(f => ({ ...f, classe: e.target.value }))} />
        </div>
        <div className="adm-form-field">
          <label className="adm-label">Posologie en cours</label>
          <input className="adm-input" value={form.posologieEnCours} onChange={e => setForm(f => ({ ...f, posologieEnCours: e.target.value }))} />
        </div>
        <div className="adm-form-field">
          <label className="adm-label">Niveau d'alerte</label>
          <select className="adm-input" value={form.niveauAlerte} onChange={e => setForm(f => ({ ...f, niveauAlerte: e.target.value }))}>
            <option value="">—</option>
            {NIVEAU_ALERTE_TRT.map(n => <option key={n}>{n}</option>)}
          </select>
        </div>
      </div>
      <button onClick={add} disabled={saving} className="adm-btn adm-btn-primary" style={{ marginTop: 12, height: 34, gap: 6 }}>
        <Plus size={13} /> {saving ? 'Ajout…' : 'Ajouter'}
      </button>
    </PatientFileModal>
  );
}
