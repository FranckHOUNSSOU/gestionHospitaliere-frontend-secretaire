import axios from 'axios';
import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';

const BASE = import.meta.env.VITE_API_URL ?? '/api';
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}` });

export default function AdmissionListModalConfirmSuppr({ adm, onClose, onDone }: {
  adm: any; onClose: () => void; onDone: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [err, setErr]           = useState(null as any);

  async function confirm() {
    setDeleting(true); setErr(null);
    try {
      await axios.delete(`${BASE}/sejours/${adm.id}`, { headers: auth() });
      onDone();
    } catch (e: any) { setErr(e?.message ?? 'Erreur.'); }
    finally { setDeleting(false); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'var(--c-bg)', borderRadius: 12, width: '100%', maxWidth: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', padding: '24px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Trash2 size={20} color="#dc2626" />
          </div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: 'var(--c-t0)' }}>Supprimer cette admission ?</p>
          <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--c-t3)' }}>
            {adm.patientName} — cette action est irreversible.
          </p>
        </div>
        {err && <div className="adm-alert adm-alert-error" style={{ marginBottom: 12 }}>{err}</div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} className="adm-btn" style={{ flex: 1, height: 36, justifyContent: 'center' }}>Annuler</button>
          <button onClick={confirm} disabled={deleting} className="adm-btn" style={{ flex: 1, height: 36, justifyContent: 'center', background: '#dc2626', color: '#fff', border: 'none', gap: 6 }}>
            {deleting ? <><Loader2 size={13} style={{ animation: 'spin 0.7s linear infinite' }} /> Suppression...</> : <><Trash2 size={13} /> Supprimer</>}
          </button>
        </div>
      </div>
    </div>
  );
}
