export default function ProfilFieldRow({ label, value, editing, onChange, type = 'text', placeholder }: {
  label: string; value: string; editing: boolean;
  onChange: (e: any) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div>
      <p style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--c-t3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
        {label}
      </p>
      {editing ? (
        <input
          type={type} value={value} onChange={onChange} placeholder={placeholder}
          style={{
            width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 13,
            border: '1px solid var(--c-bdr)', background: 'var(--c-surf2)',
            color: 'var(--c-t0)', outline: 'none', fontFamily: 'Roboto, system-ui, sans-serif',
          }}
        />
      ) : (
        <p style={{ fontSize: 13, color: value ? 'var(--c-t0)' : 'var(--c-t3)' }}>
          {value || (placeholder ?? '—')}
        </p>
      )}
    </div>
  );
}
