export default function InvoiceInfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ margin: 0, fontSize: 9, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
      <p style={{ margin: '2px 0 0', fontSize: 11, fontWeight: 600, color: '#1e293b' }}>{value || '—'}</p>
    </div>
  );
}
