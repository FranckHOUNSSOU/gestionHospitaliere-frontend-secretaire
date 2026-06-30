export default function ProfilAlert({ type, message, onClose }: {
  type: 'error' | 'success'; message: string; onClose: () => void;
}) {
  const isErr = type === 'error';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px', borderRadius: 8, marginBottom: 16,
      background: isErr ? 'var(--c-red-bg)' : 'var(--c-green-bg)',
      color: isErr ? 'var(--c-red)' : 'var(--c-green)',
      fontSize: 12, border: `1px solid ${isErr ? 'var(--c-red)' : 'var(--c-green-bd)'}`,
    }}>
      {isErr
        ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
      }
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 16, lineHeight: 1, padding: '2px 4px' }}>×</button>
    </div>
  );
}
