export default function PatientFileSyntheseRow({ label, value }: {
  label: string; value?: string | null;
}) {
  return (
    <div style={{ display: 'flex', gap: 8, padding: '5px 0', borderBottom: '1px solid var(--c-bdr)' }}>
      <p style={{ margin: 0, fontSize: 11, color: 'var(--c-t3)', width: 140, flexShrink: 0 }}>{label}</p>
      <p style={{ margin: 0, fontSize: 11, color: value ? 'var(--c-t1)' : 'var(--c-t3)', fontStyle: value ? 'normal' : 'italic', fontWeight: value ? 500 : 400 }}>
        {value || 'Non renseigné'}
      </p>
    </div>
  );
}
