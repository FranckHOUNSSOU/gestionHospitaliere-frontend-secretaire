export default function PatientFileSectionCard({ icon, title, color, count, preview, onClick }: {
  icon: any; title: string; color: string; count: number; preview: string; onClick: () => void;
}) {
  return (
    <div className="adm-card" style={{ cursor: 'pointer', transition: 'box-shadow 0.15s' }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 0 2px ' + color + '60')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}>
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 32, height: 32, borderRadius: 8, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
            {icon}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--c-t0)' }}>{title}</p>
            {count > 0
              ? <p style={{ margin: 0, fontSize: 11, color: 'var(--c-t3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{preview}</p>
              : <p style={{ margin: 0, fontSize: 11, color: 'var(--c-t3)', fontStyle: 'italic' }}>Non renseigné</p>
            }
          </div>
          {count > 0 && (
            <span style={{ fontSize: 10, fontWeight: 700, background: color + '18', color, borderRadius: 99, padding: '2px 8px', flexShrink: 0 }}>{count}</span>
          )}
        </div>
        <button onClick={onClick} className="adm-btn" style={{ justifyContent: 'center', height: 30, fontSize: 11, borderColor: color, color }}>
          {count > 0 ? 'Gérer' : 'Ajouter'}
        </button>
      </div>
    </div>
  );
}
