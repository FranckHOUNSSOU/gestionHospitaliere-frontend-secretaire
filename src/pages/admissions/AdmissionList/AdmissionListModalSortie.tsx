import { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { patchSejour } from '../../../services/patchSejour';

const MODES_SORTIE = ['Domicile', 'Transfert', 'Décès', 'Fugue', 'Autre'] as const;

export default function AdmissionListModalSortie({ sejourId, patientName, onClose, onDone }: {
  sejourId: string; patientName: string; onClose: () => void; onDone: () => void;
}) {
  const now = new Date(); now.setSeconds(0, 0);
  const [form, setForm]     = useState({ dateSortie: now.toISOString().slice(0, 16), modeSortie: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState(null as any);

  async function save() {
    if (!form.modeSortie) { setErr('Sélectionnez un type de sortie.'); return; }
    setSaving(true); setErr(null);
    try {
      await patchSejour.cloturer(sejourId, {
        dateSortie: new Date(form.dateSortie).toISOString(),
        modeSortie: form.modeSortie,
      });
      onDone();
    } catch (e: any) { setErr(e?.message ?? 'Erreur.'); }
    finally { setSaving(false); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'var(--c-bg)', borderRadius: 12, width: '100%', maxWidth: 440, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--c-bdr)' }}>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--c-t0)' }}>Enregistrer la sortie</p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--c-t3)' }}>{patientName}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-t3)', display: 'flex' }}><X size={18} /></button>
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {err && <div className="adm-alert adm-alert-error">{err}</div>}
          <div className="adm-form-field">
            <label className="adm-label">Date et heure de sortie *</label>
            <input type="datetime-local" className="adm-input" value={form.dateSortie}
              onChange={e => setForm(f => ({ ...f, dateSortie: e.target.value }))} />
          </div>
          <div className="adm-form-field">
            <label className="adm-label">Type de sortie *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {MODES_SORTIE.map(m => (
                <button key={m} type="button" onClick={() => setForm(f => ({ ...f, modeSortie: m }))}
                  style={{ padding: '8px 6px', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontWeight: 600, textAlign: 'center',
                    border: form.modeSortie === m ? '2px solid var(--c-primary)' : '1px solid var(--c-bdr)',
                    background: form.modeSortie === m ? 'var(--c-accent-bg)' : 'var(--c-surf2)',
                    color: form.modeSortie === m ? 'var(--c-primary)' : 'var(--c-t1)',
                  }}>
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', padding: '12px 20px', borderTop: '1px solid var(--c-bdr)' }}>
          <button onClick={onClose} className="adm-btn" style={{ height: 34 }}>Annuler</button>
          <button onClick={save} disabled={saving} className="adm-btn adm-btn-primary" style={{ height: 34, gap: 6 }}>
            {saving ? <><Loader2 size={13} style={{ animation: 'spin 0.7s linear infinite' }} /> Enregistrement…</> : <><Save size={13} /> Confirmer la sortie</>}
          </button>
        </div>
      </div>
    </div>
  );
}
