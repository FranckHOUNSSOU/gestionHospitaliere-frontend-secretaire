import { useState } from 'react';
import { Plus, Activity } from 'lucide-react';
import { postSejour } from '../../../services/postSejour';
import PatientFileModal from './PatientFileModal';
import PatientFileDivider from './PatientFileDivider';

export default function PatientFileModalSoins({ sejour, items, onClose, onChanged }: {
  sejour: any; items: any[]; onClose: () => void; onChanged: () => void;
}) {
  const today = new Date().toISOString().slice(0, 16);
  const [form, setForm] = useState({ cible: '', donneesObservees: '', actionsRealisees: '', resultatsObtenus: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState(null as any);

  async function add() {
    if (!sejour) return;
    if (!form.cible.trim()) { setErr('La cible est obligatoire.'); return; }
    setSaving(true); setErr(null);
    try {
      await postSejour.createSoin(sejour.id, {
        cible:             form.cible.trim(),
        donneesObservees:  form.donneesObservees  || undefined,
        actionsRealisees:  form.actionsRealisees  || undefined,
        resultatsObtenus:  form.resultatsObtenus  || undefined,
        dateHeure:         new Date(today).toISOString(),
        typeAuteur:        'Infirmier',
      });
      setForm({ cible: '', donneesObservees: '', actionsRealisees: '', resultatsObtenus: '' });
      onChanged();
    } catch (e: any) { setErr(e?.message ?? 'Erreur.'); }
    finally { setSaving(false); }
  }

  if (!sejour) return (
    <PatientFileModal title="Soins infirmiers" onClose={onClose}>
      <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--c-t3)' }}>
        <Activity size={28} style={{ marginBottom: 8 }} />
        <p style={{ margin: 0, fontSize: 13 }}>Aucun séjour actif pour ce patient.</p>
      </div>
    </PatientFileModal>
  );

  return (
    <PatientFileModal title="Soins infirmiers" onClose={onClose}>
      <p style={{ margin: '0 0 10px', fontSize: 11, color: 'var(--c-t3)' }}>
        Séjour : <strong>{sejour.numeroSejour}</strong> · Admis le {new Date(sejour.dateAdmission).toLocaleDateString('fr-FR')}
      </p>

      {items.length === 0
        ? <p style={{ fontSize: 12, color: 'var(--c-t3)', fontStyle: 'italic', marginBottom: 12 }}>Aucun soin enregistré pour ce séjour.</p>
        : items.map((s: any) => (
          <div key={s.id} style={{ padding: '8px 12px', background: 'var(--c-surf2)', borderRadius: 8, marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-t0)' }}>{s.cible}</span>
              <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 99, background: s.valide ? '#dcfce7' : '#fef3c7', color: s.valide ? '#166534' : '#92400e', fontWeight: 600 }}>
                {s.valide ? 'Validé' : 'En attente'}
              </span>
            </div>
            {s.donneesObservees && <p style={{ margin: '2px 0', fontSize: 11, color: 'var(--c-t2)' }}>Obs : {s.donneesObservees}</p>}
            {s.actionsRealisees && <p style={{ margin: '2px 0', fontSize: 11, color: 'var(--c-t2)' }}>Actions : {s.actionsRealisees}</p>}
            {s.resultatsObtenus && <p style={{ margin: '2px 0', fontSize: 11, color: 'var(--c-t2)' }}>Résultats : {s.resultatsObtenus}</p>}
            <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, color: 'var(--c-t3)' }}>{new Date(s.dateHeure).toLocaleDateString('fr-FR')}</span>
              {s.saisiParNom && <span style={{ fontSize: 10, color: 'var(--c-t3)' }}>Saisi par <strong>{s.saisiParNom}</strong></span>}
              {s.valide && s.valideParNom && <span style={{ fontSize: 10, color: '#059669' }}>Validé par <strong>{s.valideParNom}</strong>{s.dateValidation ? ` le ${new Date(s.dateValidation).toLocaleDateString('fr-FR')}` : ''}</span>}
            </div>
          </div>
        ))
      }

      <PatientFileDivider />
      <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, color: 'var(--c-t1)' }}>Enregistrer un soin</p>
      {err && <div className="adm-alert adm-alert-error" style={{ marginBottom: 10 }}>{err}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="adm-form-field">
          <label className="adm-label">Cible (problème traité) *</label>
          <input className="adm-input" value={form.cible}
            onChange={e => setForm(f => ({ ...f, cible: e.target.value }))} />
        </div>
        <div className="adm-form-field">
          <label className="adm-label">Données observées</label>
          <input className="adm-input" value={form.donneesObservees}
            onChange={e => setForm(f => ({ ...f, donneesObservees: e.target.value }))} />
        </div>
        <div className="adm-form-field">
          <label className="adm-label">Actions réalisées</label>
          <input className="adm-input" value={form.actionsRealisees}
            onChange={e => setForm(f => ({ ...f, actionsRealisees: e.target.value }))} />
        </div>
        <div className="adm-form-field">
          <label className="adm-label">Résultats obtenus</label>
          <input className="adm-input" value={form.resultatsObtenus}
            onChange={e => setForm(f => ({ ...f, resultatsObtenus: e.target.value }))} />
        </div>
      </div>

      <button onClick={add} disabled={saving} className="adm-btn adm-btn-primary" style={{ marginTop: 12, height: 34, gap: 6 }}>
        <Plus size={13} /> {saving ? 'Enregistrement…' : 'Enregistrer le soin'}
      </button>
    </PatientFileModal>
  );
}
