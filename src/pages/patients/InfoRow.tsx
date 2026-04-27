export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="adm-info-row">
      <span className="adm-info-k">{label}</span>
      <span className="adm-info-v">{value}</span>
    </div>
  );
}
