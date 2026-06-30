export default function InvoiceTHead({ cols, template = '3fr 1fr 1fr 1fr' }: { cols: string[]; template?: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: template, gap: 6, padding: '5px 10px', background: '#f1f5f9', fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {cols.map((c, i) => <span key={i} style={{ textAlign: i === 0 ? 'left' : 'right' }}>{c}</span>)}
    </div>
  );
}
