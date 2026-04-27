import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  color: 'blue' | 'emerald' | 'amber' | 'red' | 'cyan' | 'slate';
  trend?: { value: string; up: boolean };
}

const colorKpiMap: Record<string, string> = {
  blue:    'adm-kpi-blue',
  emerald: 'adm-kpi-green',
  amber:   'adm-kpi-orange',
  red:     'adm-kpi-danger',
  cyan:    'adm-kpi-blue',
  slate:   '',
};

const iconColorMap: Record<string, string> = {
  blue:    'var(--c-accent)',
  emerald: 'var(--c-green)',
  amber:   'var(--c-amber)',
  red:     'var(--c-red)',
  cyan:    'var(--c-accent)',
  slate:   'var(--c-t2)',
};

export default function StatCard({ title, value, subtitle, icon, color, trend }: StatCardProps) {
  return (
    <div className={`adm-kpi ${colorKpiMap[color]}`}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
        <p className="adm-kpi-lbl" style={{ marginBottom: 0 }}>{title}</p>
        <div style={{ color: iconColorMap[color], opacity: 0.7, flexShrink: 0 }}>{icon}</div>
      </div>
      <div className="adm-kpi-val">{value}</div>
      {subtitle && <p className="adm-kpi-note adm-note-neutral">{subtitle}</p>}
      {trend && (
        <p className={`adm-kpi-note ${trend.up ? 'adm-note-up' : 'adm-note-down'}`}>
          {trend.up ? '▲' : '▼'} {trend.value}
        </p>
      )}
    </div>
  );
}
