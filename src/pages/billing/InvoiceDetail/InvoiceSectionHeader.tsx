function fmt(n: number) { return n.toLocaleString('fr-FR') + ' FCFA'; }

export default function InvoiceSectionHeader({ color, title, total }: { color: string; title: string; total: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 12px', background: color + '15', borderLeft: `3px solid ${color}`, marginBottom: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color }}>{fmt(total)}</span>
    </div>
  );
}
