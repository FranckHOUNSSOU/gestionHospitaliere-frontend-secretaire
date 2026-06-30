export default function PatientFileSyntheseSection({ icon, title, color, count, children }: {
  icon: any; title: string; color: string; count: number; children: any;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 26, height: 26, borderRadius: 7, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
          {icon}
        </span>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--c-t0)', flex: 1 }}>{title}</p>
        {count > 0 && (
          <span style={{ fontSize: 10, fontWeight: 700, background: color + '18', color, borderRadius: 99, padding: '1px 8px' }}>{count}</span>
        )}
      </div>
      {children}
    </div>
  );
}
