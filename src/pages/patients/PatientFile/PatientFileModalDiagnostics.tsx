import { useState } from 'react';
import { Plus, Stethoscope } from 'lucide-react';
import { postSejour } from '../../../services/postSejour';
import CIM10Input from '../../../components/CIM10Input/CIM10Input';
import PatientFileModal from './PatientFileModal';
import PatientFileDivider from './PatientFileDivider';

const STATUT_DIAGNOSTIC = ['Confirmé', 'Suspecté', 'Écarté'];

export default function PatientFileModalDiagnostics({ sejour, items, onClose, onChanged }: {
  sejour: any; items: any[]; onClose: () => void; onChanged: () => void;
}) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ codeCim10: '', libelle: '', statut: 'Suspecté' });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState(null as any);

  async function add() {
    if (!sejour) return;
    if (!form.codeCim10.trim() || !form.libelle.trim()) { setErr('Code CIM-10 et libellé sont obligatoires.'); return; }
    setSaving(true); setErr(null);
    try {
      await postSejour.createDiagnostic(sejour.id, {
        ...form,
        type: 'Principal',
        dateDiagnostic: today,
      });
      setForm({ codeCim10: '', libelle: '', statut: 'Suspecté' });
      onChanged();
    } catch (e: any) { setErr(e?.message ?? 'Erreur.'); } finally { setSaving(false); }
  }

  if (!sejour) return (
    <PatientFileModal title="Diagnostics" onClose={onClose}>
      <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--c-t3)' }}>
        <Stethoscope size={28} style={{ marginBottom: 8 }} />
        <p style={{ margin: 0, fontSize: 13 }}>Aucun séjour actif pour ce patient.</p>
        <p style={{ margin: '4px 0 0', fontSize: 11 }}>Un diagnostic doit être rattaché à un séjour en cours.</p>
      </div>
    </PatientFileModal>
  );

  return (
    <PatientFileModal title="Diagnostics" onClose={onClose}>
      <p style={{ margin: '0 0 10px', fontSize: 11, color: 'var(--c-t3)' }}>
        Séjour : <strong>{sejour.numeroSejour}</strong> · {sejour.typeSejour ?? 'Hospitalisation'} · Admis le {new Date(sejour.dateAdmission).toLocaleDateString('fr-FR')}
      </p>
      {items.length === 0
        ? <p style={{ fontSize: 12, color: 'var(--c-t3)', fontStyle: 'italic', marginBottom: 12 }}>Aucun diagnostic enregistré pour ce séjour.</p>
        : items.map((d: any) => (
          <div key={d.id} style={{ padding: '8px 12px', background: 'var(--c-surf2)', borderRadius: 8, marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace', color: 'var(--c-accent)' }}>{d.codeCim10}</span>
              <span style={{ fontSize: 10, background: 'var(--c-bdr)', borderRadius: 99, padding: '1px 7px', color: 'var(--c-t2)' }}>{d.statut}</span>
            </div>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--c-t1)' }}>{d.libelle}</p>
          </div>
        ))
      }
      <PatientFileDivider />
      <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, color: 'var(--c-t1)' }}>Saisir un diagnostic</p>
      {err && <div className="adm-alert adm-alert-error" style={{ marginBottom: 10 }}>{err}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
        <div className="adm-form-field">
          <label className="adm-label">Code CIM-10 *</label>
          <CIM10Input
            value={form.codeCim10}
            onChange={(v: any) => setForm(f => ({ ...f, codeCim10: v }))}
            onSelect={(entry: any) => setForm(f => ({ ...f, codeCim10: entry.code, libelle: entry.libelle }))}
            placeholder="F00-F99, K35, grippe…"
          />
        </div>
        <div className="adm-form-field">
          <label className="adm-label">Libellé *</label>
          <input className="adm-input" value={form.libelle} onChange={e => setForm(f => ({ ...f, libelle: e.target.value }))} />
        </div>
        <div className="adm-form-field" style={{ gridColumn: '1 / -1' }}>
          <label className="adm-label">Statut</label>
          <select className="adm-input" value={form.statut} onChange={e => setForm(f => ({ ...f, statut: e.target.value }))}>
            {STATUT_DIAGNOSTIC.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <button onClick={add} disabled={saving} className="adm-btn adm-btn-primary" style={{ marginTop: 12, height: 34, gap: 6 }}>
        <Plus size={13} /> {saving ? 'Enregistrement…' : 'Enregistrer le diagnostic'}
      </button>
    </PatientFileModal>
  );
}
