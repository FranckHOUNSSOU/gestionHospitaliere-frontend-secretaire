export default function InvoiceTRow({ cols, template = '3fr 1fr 1fr 1fr' }: { cols: (string | number)[]; template?: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: template, gap: 6, padding: '6px 10px', borderBottom: '1px solid #e2e8f0', fontSize: 11, color: '#334155' }}>
      {cols.map((c, i) => (
        <span key={i} style={{ textAlign: i === 0 ? 'left' : 'right', fontVariantNumeric: 'tabular-nums' }}>
          {typeof c === 'number' ? c.toLocaleString('fr-FR') : c}
        </span>
      ))}
    </div>
  );
}
