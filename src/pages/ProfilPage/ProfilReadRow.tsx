export default function ProfilReadRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--c-t3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
        {label}
      </p>
      <p style={{ fontSize: 13, color: 'var(--c-t0)' }}>{value}</p>
    </div>
  );
}
