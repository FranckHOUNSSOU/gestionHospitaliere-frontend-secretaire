import { Trash2 } from 'lucide-react';

// ─── Section ─────────────────────────────────────────────────────────────────

export function Section({
  icon, title, color = 'var(--c-primary)', border, action, children,
}: {
  icon: React.ReactNode; title: string; color?: string;
  border?: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="adm-card" style={border ? { border } : undefined}>
      <div className="adm-card-head" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color }}>{icon}</span>
          <p className="adm-card-title" style={{ margin: 0, color: border ? color : undefined }}>{title}</p>
        </div>
        {action}
      </div>
      <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {children}
      </div>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

export function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p style={{ margin: '0 0 3px', fontSize: '11px', fontWeight: 600, color: 'var(--c-t3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: '13px', color: 'var(--c-t1)', fontWeight: 500 }}>
        {value || <span style={{ color: 'var(--c-t3)', fontStyle: 'italic' }}>Non renseigné</span>}
      </p>
    </div>
  );
}

// ─── DelBtn ───────────────────────────────────────────────────────────────────

export function DelBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '8px', flexShrink: 0 }}>
      <Trash2 size={15} />
    </button>
  );
}
