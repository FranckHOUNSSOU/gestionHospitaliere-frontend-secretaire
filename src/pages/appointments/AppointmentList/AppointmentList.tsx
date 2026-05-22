import './AppointmentList.css';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Plus, List, CalendarDays, Search, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import Badge, { statusBadge } from '../../../components/ui/Badge/Badge';
import { getRendezVous } from '../../../services/appointmentService';
import { useNavigation } from '../../../context/NavigationContext';
import type { AppointmentStatus, Appointment } from '../../../types/index';

/* ── Localizer date-fns (semaine commence lundi) ─────────────── */
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales: { fr },
});

/* ── Traductions françaises ──────────────────────────────────── */
const FR_MESSAGES = {
  allDay: 'Toute la journée',
  previous: 'Précédent',
  next: 'Suivant',
  today: "Aujourd'hui",
  month: 'Mois',
  week: 'Semaine',
  day: 'Jour',
  agenda: 'Agenda',
  date: 'Date',
  time: 'Heure',
  event: 'Événement',
  noEventsInRange: 'Aucun rendez-vous sur cette période.',
  showMore: (total: number) => `+${total} autres`,
};

/* ── Couleurs par statut ─────────────────────────────────────── */
const STATUS_STYLE: Record<AppointmentStatus, { background: string; border: string }> = {
  scheduled: { background: '#64748b', border: '#475569' },
  confirmed:  { background: '#0ea5e9', border: '#0284c7' },
  completed:  { background: '#059669', border: '#047857' },
  cancelled:  { background: '#dc2626', border: '#b91c1c' },
  no_show:    { background: '#d97706', border: '#b45309' },
};

const LEGEND: { status: AppointmentStatus; label: string }[] = [
  { status: 'confirmed',  label: 'Confirmé' },
  { status: 'scheduled',  label: 'Planifié' },
  { status: 'completed',  label: 'Terminé' },
  { status: 'cancelled',  label: 'Annulé' },
  { status: 'no_show',    label: 'Non présenté' },
];

/* ── Type événement ──────────────────────────────────────────── */
type CalEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Appointment;
};

function toEvent(appt: Appointment): CalEvent {
  const [y, m, d] = appt.date.split('-').map(Number);
  const [h, min]  = appt.time.split(':').map(Number);
  const start     = new Date(y, m - 1, d, h, min);
  const end       = new Date(start.getTime() + appt.duration * 60_000);
  return { id: appt.id, title: `${appt.patientName} — ${appt.doctorName}`, start, end, resource: appt };
}

/* ── Composant event ─────────────────────────────────────────── */
function EventCard({ event }: { event: CalEvent }) {
  const a = event.resource;
  return (
    <div style={{ lineHeight: 1.3, overflow: 'hidden' }}>
      <div style={{ fontWeight: 600, fontSize: '10.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {a.time} · {a.patientName}
      </div>
      <div style={{ fontSize: '9.5px', opacity: 0.85, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {a.type} · {a.doctorName}
      </div>
    </div>
  );
}

/* ── Toolbar personnalisée ───────────────────────────────────── */
type RbcToolbarProps = {
  label: string;
  view: string;
  views: string[];
  onNavigate: (action: string) => void;
  onView: (view: string) => void;
};

const VIEW_LABELS: Record<string, string> = {
  month: 'Mois', week: 'Semaine', day: 'Jour', agenda: 'Agenda',
};

function CustomToolbar({ label, view, views, onNavigate, onView }: RbcToolbarProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', borderBottom: '1px solid var(--c-bdr)', gap: 12, flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button className="adm-btn" onClick={() => onNavigate('TODAY')} style={{ height: 30, fontSize: 12 }}>
          Aujourd'hui
        </button>
        <button className="adm-icon-btn" style={{ width: 30, height: 30 }} onClick={() => onNavigate('PREV')}>
          <ChevronLeft size={14} />
        </button>
        <button className="adm-icon-btn" style={{ width: 30, height: 30 }} onClick={() => onNavigate('NEXT')}>
          <ChevronRight size={14} />
        </button>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-t0)', marginLeft: 4 }}>{label}</span>
      </div>
      <div className="adm-view-toggle">
        {views.map((v) => (
          <button key={v} className={`adm-view-btn${view === v ? ' active' : ''}`} onClick={() => onView(v)}>
            {VIEW_LABELS[v] ?? v}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════════════════════════ */
export default function AppointmentList() {
  const { navigate } = useNavigation();
  const [view, setView] = useState<'list' | 'calendar'>('calendar');
  const [calView, setCalView] = useState<string>(Views.MONTH);
  const [calDate, setCalDate] = useState(new Date());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getRendezVous()
      .then(({ data }) => setAppointments(data))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, []);

  /* Données filtrées (vue liste) */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...appointments]
      .filter((a) => {
        const matchSearch =
          a.patientName.toLowerCase().includes(q) ||
          a.doctorName.toLowerCase().includes(q) ||
          a.department.toLowerCase().includes(q);
        const matchStatus = statusFilter === 'all' || a.status === statusFilter;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  }, [search, statusFilter, appointments]);

  /* Tous les événements calendrier */
  const events = useMemo(() => appointments.map(toEvent), [appointments]);

  /* Style par événement */
  const eventPropGetter = useCallback((event: CalEvent) => {
    const s = STATUS_STYLE[event.resource.status] ?? STATUS_STYLE.scheduled;
    return {
      style: {
        backgroundColor: s.background,
        borderColor: s.border,
        borderRadius: '5px',
        color: '#fff',
        border: `1px solid ${s.border}`,
        padding: '2px 5px',
      },
    };
  }, []);

  /* Style par jour */
  const dayPropGetter = useCallback((date: Date) => {
    const t = new Date();
    const isToday =
      date.getDate() === t.getDate() &&
      date.getMonth() === t.getMonth() &&
      date.getFullYear() === t.getFullYear();
    return isToday ? { style: { backgroundColor: 'rgba(14,165,233,0.07)' } } : {};
  }, []);

  const onSelectEvent = useCallback((e: CalEvent) => setSelected(e.resource), []);
  const onSelectSlot  = useCallback(() => navigate('appointment-new'), [navigate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── En-tête ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h1 className="adm-page-title">Rendez-vous</h1>
          <p className="adm-page-sub">Planifiez et gérez les rendez-vous médicaux</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="adm-view-toggle">
            <button onClick={() => setView('list')} className={`adm-view-btn${view === 'list' ? ' active' : ''}`}>
              <List size={14} /> Liste
            </button>
            <button onClick={() => setView('calendar')} className={`adm-view-btn${view === 'calendar' ? ' active' : ''}`}>
              <CalendarDays size={14} /> Calendrier
            </button>
          </div>
          <button onClick={() => navigate('appointment-new')} className="adm-btn adm-btn-primary">
            <Plus size={13} /> Nouveau RDV
          </button>
        </div>
      </div>

      {/* ── VUE LISTE ─────────────────────────────────────────── */}
      {view === 'list' && (
        <div className="adm-card">
          <div className="adm-card-head" style={{ gap: '10px', flexWrap: 'wrap' }}>
            <div className="adm-search" style={{ flex: 1, minWidth: '200px' }}>
              <span className="adm-search-icon"><Search size={14} /></span>
              <input
                type="text"
                placeholder="Rechercher patient, médecin, service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="adm-search-input"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | 'all')}
              className="adm-input"
              style={{ width: 'auto', padding: '6px 10px' }}
            >
              <option value="all">Tous les statuts</option>
              <option value="scheduled">Planifié</option>
              <option value="confirmed">Confirmé</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
              <option value="no_show">Non présenté</option>
            </select>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Date / Heure</th>
                  <th>Patient</th>
                  <th>Médecin</th>
                  <th>Service</th>
                  <th>Type</th>
                  <th>Durée</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--c-t3)' }}>
                      Chargement…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--c-t3)' }}>
                      Aucun rendez-vous trouvé
                    </td>
                  </tr>
                ) : (
                  filtered.map((appt) => {
                    const { variant, label } = statusBadge(appt.status);
                    return (
                      <tr key={appt.id}>
                        <td>
                          <p className="adm-cell-name">{appt.time}</p>
                          <p className="adm-cell-mono">
                            {new Date(appt.date).toLocaleDateString('fr-FR', {
                              weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
                            })}
                          </p>
                        </td>
                        <td>
                          <button onClick={() => navigate('patient-detail', appt.patientId)} className="adm-link-btn">
                            {appt.patientName}
                          </button>
                        </td>
                        <td><span style={{ fontSize: '12px', color: 'var(--c-t1)' }}>{appt.doctorName}</span></td>
                        <td><span className="adm-cell-mono" style={{ fontSize: '12px', color: 'var(--c-t1)' }}>{appt.department}</span></td>
                        <td><span className="adm-tag adm-t-gray">{appt.type}</span></td>
                        <td>
                          <span className="adm-cell-mono" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={11} /> {appt.duration} min
                          </span>
                        </td>
                        <td><Badge variant={variant}>{label}</Badge></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── VUE CALENDRIER ────────────────────────────────────── */}
      {view === 'calendar' && (
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>

          {/* Calendrier principal */}
          <div className="adm-card adm-rbc-wrap" style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <Calendar
              localizer={localizer}
              events={events}
              view={calView as any}
              date={calDate}
              onView={(v) => setCalView(v)}
              onNavigate={(d) => setCalDate(d)}
              selectable
              onSelectSlot={onSelectSlot}
              onSelectEvent={onSelectEvent as any}
              eventPropGetter={eventPropGetter as any}
              dayPropGetter={dayPropGetter}
              messages={FR_MESSAGES}
              culture="fr"
              components={{
                toolbar: CustomToolbar as any,
                event: EventCard as any,
              }}
              formats={{
                monthHeaderFormat: (date: Date) => format(date, 'MMMM yyyy', { locale: fr }),
                dayHeaderFormat: (date: Date) => format(date, 'EEEE d MMMM', { locale: fr }),
                dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
                  `${format(start, 'd MMM', { locale: fr })} – ${format(end, 'd MMM yyyy', { locale: fr })}`,
                agendaDateFormat: (date: Date) => format(date, 'EEE d MMM', { locale: fr }),
                agendaTimeFormat: (date: Date) => format(date, 'HH:mm', { locale: fr }),
                weekdayFormat: (date: Date) => format(date, 'EEE', { locale: fr }),
                timeGutterFormat: (date: Date) => format(date, 'HH:mm', { locale: fr }),
              }}
              style={{ height: 680 }}
              popup
              showMultiDayTimes
              step={15}
              timeslots={4}
            />
          </div>

          {/* Panneau latéral */}
          <div style={{ width: 248, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Légende */}
            <div className="adm-card">
              <div className="adm-card-head">
                <p className="adm-card-title">Légende</p>
              </div>
              <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {LEGEND.map(({ status, label }) => (
                  <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: 11, height: 11, borderRadius: 3,
                      background: STATUS_STYLE[status].background, flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 12, color: 'var(--c-t1)' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Filtre rapide */}
            <div className="adm-card">
              <div className="adm-card-head">
                <p className="adm-card-title">Filtre rapide</p>
              </div>
              <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {(['all', 'confirmed', 'scheduled', 'completed', 'cancelled'] as const).map((s) => {
                  const lbl: Record<string, string> = {
                    all: 'Tous', confirmed: 'Confirmés', scheduled: 'Planifiés',
                    completed: 'Terminés', cancelled: 'Annulés',
                  };
                  return (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      style={{
                        textAlign: 'left', padding: '6px 10px', borderRadius: 6,
                        border: '1px solid',
                        borderColor: statusFilter === s ? 'var(--c-accent)' : 'var(--c-bdr)',
                        background: statusFilter === s ? 'var(--c-accent-bg)' : 'var(--c-surf2)',
                        color: statusFilter === s ? 'var(--c-accent)' : 'var(--c-t1)',
                        cursor: 'pointer', fontSize: 12,
                        fontWeight: statusFilter === s ? 600 : 400,
                        fontFamily: 'Roboto, sans-serif', transition: 'all 0.15s',
                      }}
                    >
                      {lbl[s]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Détail événement sélectionné */}
            {selected && (
              <div className="adm-card">
                <div className="adm-card-head">
                  <p className="adm-card-title">Détail RDV</p>
                  <button className="adm-link-btn" style={{ fontSize: 11 }} onClick={() => setSelected(null)}>
                    ✕ Fermer
                  </button>
                </div>
                <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    { k: 'Patient',  v: selected.patientName },
                    { k: 'Médecin',  v: selected.doctorName },
                    { k: 'Service',  v: selected.department },
                    { k: 'Date',     v: new Date(selected.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) },
                    { k: 'Heure',    v: selected.time },
                    { k: 'Durée',    v: `${selected.duration} min` },
                    { k: 'Type',     v: selected.type },
                  ].map(({ k, v }) => (
                    <div key={k} className="adm-info-row">
                      <span className="adm-info-k">{k}</span>
                      <span className="adm-info-v">{v}</span>
                    </div>
                  ))}
                  {selected.notes && (
                    <div className="adm-info-row">
                      <span className="adm-info-k">Notes</span>
                      <span className="adm-info-v" style={{ fontWeight: 400, fontSize: 11.5 }}>{selected.notes}</span>
                    </div>
                  )}
                  <div style={{ marginTop: 6 }}>
                    {(() => { const { variant, label } = statusBadge(selected.status); return <Badge variant={variant}>{label}</Badge>; })()}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

