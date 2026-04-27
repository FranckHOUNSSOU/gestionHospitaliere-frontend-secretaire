interface BadgeProps {
  variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'blue';
  children: React.ReactNode;
  size?: 'sm' | 'md';
}

const variants: Record<BadgeProps['variant'], string> = {
  success: 'adm-t-green',
  warning: 'adm-t-amber',
  error:   'adm-t-red',
  info:    'adm-t-blue',
  neutral: 'adm-t-gray',
  blue:    'adm-t-blue',
};

export default function Badge({ variant, children }: BadgeProps) {
  return <span className={`adm-tag ${variants[variant]}`}>{children}</span>;
}

export function statusBadge(status: string) {
  const map: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    active:       { variant: 'success', label: 'Actif' },
    hospitalized: { variant: 'blue',    label: 'Hospitalisé' },
    discharged:   { variant: 'neutral', label: 'Sorti' },
    scheduled:    { variant: 'info',    label: 'Planifié' },
    confirmed:    { variant: 'blue',    label: 'Confirmé' },
    completed:    { variant: 'success', label: 'Terminé' },
    cancelled:    { variant: 'error',   label: 'Annulé' },
    no_show:      { variant: 'warning', label: 'Absent' },
    transferred:  { variant: 'warning', label: 'Transféré' },
    draft:        { variant: 'neutral', label: 'Brouillon' },
    pending:      { variant: 'warning', label: 'En attente' },
    paid:         { variant: 'success', label: 'Payée' },
    overdue:      { variant: 'error',   label: 'En retard' },
    partial:      { variant: 'info',    label: 'Partielle' },
  };
  return map[status] ?? { variant: 'neutral' as const, label: status };
}
