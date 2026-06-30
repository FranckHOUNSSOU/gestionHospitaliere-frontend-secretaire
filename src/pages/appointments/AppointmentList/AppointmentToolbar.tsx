import { ChevronLeft, ChevronRight } from 'lucide-react';

const VIEW_LABELS: Record<string, string> = { month: 'Mois', week: 'Semaine', day: 'Jour', agenda: 'Agenda' };

export default function AppointmentToolbar({ label, view, views, onNavigate, onView }: {
  label: string; view: string; views: string[];
  onNavigate: (a: string) => void; onView: (v: string) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--c-bdr)', gap: 12, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button className="adm-btn" onClick={() => onNavigate('TODAY')} style={{ height: 30, fontSize: 12 }}>Aujourd'hui</button>
        <button className="adm-icon-btn" style={{ width: 30, height: 30 }} onClick={() => onNavigate('PREV')}><ChevronLeft size={14} /></button>
        <button className="adm-icon-btn" style={{ width: 30, height: 30 }} onClick={() => onNavigate('NEXT')}><ChevronRight size={14} /></button>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-t0)', marginLeft: 4 }}>{label}</span>
      </div>
      <div className="adm-view-toggle">
        {views.map((v) => (
          <button key={v} className={`adm-view-btn${view === v ? ' active' : ''}`} onClick={() => onView(v)}>{VIEW_LABELS[v] ?? v}</button>
        ))}
      </div>
    </div>
  );
}
