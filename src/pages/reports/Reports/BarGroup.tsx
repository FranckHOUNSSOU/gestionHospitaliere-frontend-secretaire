const monthLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

export function BarGroup({ values, max, color }: { values: number[]; max: number; color: string }) {
  return (
    <div className="adm-bars" style={{ height: '100px' }}>
      {values.map((v, i) => (
        <div key={i} className="adm-bar-col">
          <div
            className="adm-bar"
            style={{ height: `${Math.round((v / max) * 100)}%`, background: color }}
            title={`${monthLabels[i]}: ${v}`}
          />
          <span className="adm-bar-lbl">{monthLabels[i]}</span>
        </div>
      ))}
    </div>
  );
}
