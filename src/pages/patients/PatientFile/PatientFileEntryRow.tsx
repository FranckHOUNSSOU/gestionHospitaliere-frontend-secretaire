import { Trash2 } from 'lucide-react';

export default function PatientFileEntryRow({ label, sub, onDelete }: {
  label: string; sub?: string; onDelete: () => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--c-surf2)', borderRadius: 8, marginBottom: 6 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--c-t1)' }}>{label}</p>
        {sub && <p style={{ margin: 0, fontSize: 11, color: 'var(--c-t3)' }}>{sub}</p>}
      </div>
      <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', display: 'flex', padding: 4, flexShrink: 0 }}>
        <Trash2 size={13} />
      </button>
    </div>
  );
}
