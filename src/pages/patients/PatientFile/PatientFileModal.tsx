import { X } from 'lucide-react';

export default function PatientFileModal({ title, onClose, children }: {
  title: string; onClose: () => void; children: any;
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'var(--c-bg)', borderRadius: 12, width: '100%', maxWidth: 580, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--c-bdr)', flexShrink: 0 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--c-t0)' }}>{title}</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-t3)', display: 'flex' }}><X size={18} /></button>
        </div>
        <div style={{ overflowY: 'auto', padding: '16px 20px', flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}
