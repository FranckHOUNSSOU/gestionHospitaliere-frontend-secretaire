import './AppointmentList.css';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Plus, List, CalendarDays, Search, Clock, MoreVertical } from 'lucide-react';
import Badge, { statusBadge } from '../../../components/ui/Badge/Badge';
import { getRendezVous } from '../../../services/getRendezVous';
import { patchRendezVous } from '../../../services/patchRendezVous';
import { deleteRendezVous } from '../../../services/deleteRendezVous';
import { useNavigation } from '../../../context/NavigationContext';
import AppointmentEventCard from './AppointmentEventCard';
import AppointmentToolbar from './AppointmentToolbar';
import AppointmentEditModal from './AppointmentEditModal';

type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
type StatusBackend = 'Confirme' | 'Annule' | 'Effectue' | 'Programme';

const BACKEND_TO_FRONTEND: Record<StatusBackend, AppointmentStatus> = {
  Programme: 'scheduled', Confirme: 'confirmed', Effectue: 'completed', Annule: 'cancelled',
};

const STATUS_ACTIONS: { value: StatusBackend; label: string; color: string }[] = [
  { value: 'Confirme',  label: 'Confirmer', color: '#0ea5e9' },
  { value: 'Programme', label: 'Planifier', color: '#64748b' },
  { value: 'Effectue',  label: 'Terminé',   color: '#059669' },
  { value: 'Annule',    label: 'Annuler',   color: '#dc2626' },
];

const localizer = dateFnsLocalizer({
  format, parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay, locales: { fr },
});

const FR_MESSAGES = {
  allDay: 'Toute la journée', previous: 'Précédent', next: 'Suivant',
  today: "Aujourd'hui", month: 'Mois', week: 'Semaine', day: 'Jour',
  agenda: 'Agenda', date: 'Date', time: 'Heure', event: 'Événement',
  noEventsInRange: 'Aucun rendez-vous sur cette période.',
  showMore: (total: number) => `+${total} autres`,
};

const STATUS_STYLE: Record<AppointmentStatus, { background: string; border: string }> = {
  scheduled: { background: '#64748b', border: '#475569' },
  confirmed:  { background: '#0ea5e9', border: '#0284c7' },
  completed:  { background: '#059669', border: '#047857' },
  cancelled:  { background: '#dc2626', border: '#b91c1c' },
  no_show:    { background: '#d97706', border: '#b45309' },
};

const LEGEND: { status: AppointmentStatus; label: string }[] = [
  { status: 'confirmed', label: 'Confirmé' },
  { status: 'scheduled', label: 'Planifié' },
  { status: 'completed', label: 'Terminé' },
  { status: 'cancelled', label: 'Annulé' },
  { status: 'no_show',   label: 'Non présenté' },
];

function toEvent(appt: any) {
  const [y, m, d] = appt.date.split('-').map(Number);
  const [h, min]  = appt.time.split(':').map(Number);
  const start = new Date(y, m - 1, d, h, min);
  const end   = new Date(start.getTime() + appt.duration * 60_000);
  return { id: appt.id, title: `${appt.patientName} — ${appt.doctorName}`, start, end, resource: appt };
}

export default function AppointmentList() {
  const { navigate } = useNavigation();
  const [view, setView]         = useState('calendar' as any);
  const [calView, setCalView]   = useState(Views.MONTH as any);
  const [calDate, setCalDate]   = useState(new Date());
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null as any);
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [updatingId,   setUpdatingId]   = useState(null as any);
  const [editingAppt,  setEditingAppt]  = useState(null as any);

  const [statusPopover, setStatusPopover] = useState(null as any);
  const [menuPopover,   setMenuPopover]   = useState(null as any);

  useEffect(() => {
    setLoading(true);
    getRendezVous.getRendezVous()
      .then(data => setAppointments(data))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function handleClick() { setStatusPopover(null); setMenuPopover(null); }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...(appointments as any[])]
      .filter((a) => {
        const matchSearch = a.patientName.toLowerCase().includes(q) || a.doctorName.toLowerCase().includes(q) || a.department.toLowerCase().includes(q);
        const matchStatus = statusFilter === 'all' || a.status === statusFilter;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  }, [search, statusFilter, appointments]);

  const events = useMemo(() => (appointments as any[]).map(toEvent), [appointments]);

  const eventPropGetter = useCallback((event: any) => {
    const s = STATUS_STYLE[event.resource.status as AppointmentStatus] ?? STATUS_STYLE.scheduled;
    return { style: { backgroundColor: s.background, borderColor: s.border, borderRadius: '5px', color: '#fff', border: `1px solid ${s.border}`, padding: '2px 5px' } };
  }, []);

  const dayPropGetter = useCallback((date: Date) => {
    const t = new Date();
    const isToday = date.getDate() === t.getDate() && date.getMonth() === t.getMonth() && date.getFullYear() === t.getFullYear();
    return isToday ? { style: { backgroundColor: 'rgba(14,165,233,0.07)' } } : {};
  }, []);

  const handleStatusChange = useCallback(async (id: string, statut: StatusBackend) => {
    setUpdatingId(id); setStatusPopover(null);
    try {
      await patchRendezVous.updateStatut(id, statut);
      const newStatus = BACKEND_TO_FRONTEND[statut];
      setAppointments(prev => (prev as any[]).map(a => a.id === id ? { ...a, status: newStatus } : a) as any);
      setSelected((prev: any) => prev?.id === id ? { ...prev, status: newStatus } : prev);
    } catch { /* silent */ } finally { setUpdatingId(null); }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('Supprimer ce rendez-vous ? Cette action est irréversible.')) return;
    setMenuPopover(null);
    try {
      await deleteRendezVous.deleteRendezVous(id);
      setAppointments(prev => (prev as any[]).filter(a => a.id !== id) as any);
      setSelected((prev: any) => prev?.id === id ? null : prev);
    } catch { /* silent */ }
  }, []);

  const handleSaved = useCallback((updated: any) => {
    setAppointments(prev => (prev as any[]).map(a => a.id === updated.id ? updated : a) as any);
    setSelected((prev: any) => prev?.id === updated.id ? updated : prev);
    setEditingAppt(null);
  }, []);

  const onSelectEvent = useCallback((e: any) => setSelected(e.resource), []);
  const onSelectSlot  = useCallback((slotInfo: any) => {
    const d = slotInfo.start instanceof Date ? slotInfo.start : new Date(slotInfo.start);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    navigate('appointment-new', undefined, { prefillDate: dateStr });
  }, [navigate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {editingAppt && <AppointmentEditModal appt={editingAppt} onClose={() => setEditingAppt(null)} onSaved={handleSaved} />}

      {statusPopover && (
        <div
          onMouseDown={e => e.stopPropagation()}
          style={{ position: 'fixed', top: statusPopover.top, left: statusPopover.left, zIndex: 500, background: 'var(--c-bg)', border: '1px solid var(--c-bdr)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.14)', minWidth: 150, overflow: 'hidden' }}
        >
          {STATUS_ACTIONS.map(({ value, label, color }) => (
            <button
              key={value}
              onClick={() => handleStatusChange(statusPopover.id, value)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 13px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--c-t1)', fontFamily: 'Roboto, sans-serif', textAlign: 'left' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--c-surf2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
              {label}
            </button>
          ))}
        </div>
      )}

      {menuPopover && (
        <div
          onMouseDown={e => e.stopPropagation()}
          style={{ position: 'fixed', top: menuPopover.top, right: menuPopover.right, zIndex: 500, background: 'var(--c-bg)', border: '1px solid var(--c-bdr)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.14)', minWidth: 140, overflow: 'hidden' }}
        >
          <button
            onClick={() => {
              const appt = (appointments as any[]).find(a => a.id === menuPopover.id);
              if (appt) setEditingAppt(appt);
              setMenuPopover(null);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--c-t1)', fontFamily: 'Roboto, sans-serif', textAlign: 'left' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--c-surf2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            Modifier
          </button>
          <button
            onClick={() => handleDelete(menuPopover.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#dc2626', fontFamily: 'Roboto, sans-serif', textAlign: 'left' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            Supprimer
          </button>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h1 className="adm-page-title">Rendez-vous</h1>
          <p className="adm-page-sub">Planifiez et gérez les rendez-vous médicaux</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="adm-view-toggle">
            <button onClick={() => setView('list')} className={`adm-view-btn${view === 'list' ? ' active' : ''}`}><List size={14} /> Liste</button>
            <button onClick={() => setView('calendar')} className={`adm-view-btn${view === 'calendar' ? ' active' : ''}`}><CalendarDays size={14} /> Calendrier</button>
          </div>
          <button onClick={() => navigate('appointment-new')} className="adm-btn adm-btn-primary">
            <Plus size={13} /> Nouveau RDV
          </button>
        </div>
      </div>

      {view === 'list' && (
        <div className="adm-card">
          <div className="adm-card-head" style={{ gap: '10px', flexWrap: 'wrap' }}>
            <div className="adm-search" style={{ flex: 1, minWidth: '200px' }}>
              <span className="adm-search-icon"><Search size={14} /></span>
              <input type="text" placeholder="Rechercher patient, médecin, service..." value={search}
                onChange={(e) => setSearch(e.target.value)} className="adm-search-input" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="adm-input" style={{ width: 'auto', padding: '6px 10px' }}>
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
                  <th style={{ width: 48, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--c-t3)' }}>Chargement…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--c-t3)' }}>Aucun rendez-vous trouvé</td></tr>
                ) : filtered.map((appt: any) => {
                  const { variant, label } = statusBadge(appt.status);
                  const isBusy = updatingId === appt.id;
                  return (
                    <tr key={appt.id}>
                      <td>
                        <p className="adm-cell-name">{appt.time}</p>
                        <p className="adm-cell-mono">{new Date(appt.date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      </td>
                      <td>
                        <button onClick={() => navigate('patient-detail', appt.patientId)} className="adm-link-btn">{appt.patientName}</button>
                      </td>
                      <td><span style={{ fontSize: '12px', color: 'var(--c-t1)' }}>{appt.doctorName}</span></td>
                      <td><span className="adm-cell-mono" style={{ fontSize: '12px', color: 'var(--c-t1)' }}>{appt.department}</span></td>
                      <td><span className="adm-tag adm-t-gray">{appt.type}</span></td>
                      <td>
                        <span className="adm-cell-mono" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={11} /> {appt.duration} min
                        </span>
                      </td>
                      <td>
                        {isBusy ? (
                          <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--c-bdr)', borderTopColor: 'var(--c-accent)', animation: 'spin 0.7s linear infinite' }} />
                        ) : (
                          <button
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              const rect = e.currentTarget.getBoundingClientRect();
                              setStatusPopover((prev: any) => prev?.id === appt.id ? null : { id: appt.id, top: rect.bottom + 4, left: rect.left });
                              setMenuPopover(null);
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          >
                            <Badge variant={variant}>{label}</Badge>
                          </button>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            setMenuPopover((prev: any) => prev?.id === appt.id ? null : { id: appt.id, top: rect.bottom + 4, right: window.innerWidth - rect.right });
                            setStatusPopover(null);
                          }}
                          className="adm-icon-btn"
                          style={{ width: 30, height: 30 }}
                        >
                          <MoreVertical size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === 'calendar' && (
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div className="adm-card adm-rbc-wrap" style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <Calendar
              localizer={localizer} events={events}
              view={calView as any} date={calDate}
              onView={(v) => setCalView(v)} onNavigate={(d) => setCalDate(d)}
              selectable onSelectSlot={onSelectSlot} onSelectEvent={onSelectEvent as any}
              eventPropGetter={eventPropGetter as any} dayPropGetter={dayPropGetter}
              messages={FR_MESSAGES} culture="fr"
              components={{ toolbar: AppointmentToolbar as any, event: AppointmentEventCard as any }}
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
              style={{ height: 680 }} popup showMultiDayTimes step={15} timeslots={4}
            />
          </div>

          <div style={{ width: 248, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="adm-card">
              <div className="adm-card-head"><p className="adm-card-title">Légende</p></div>
              <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {LEGEND.map(({ status, label }) => (
                  <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: 11, height: 11, borderRadius: 3, background: STATUS_STYLE[status].background, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--c-t1)' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="adm-card">
              <div className="adm-card-head"><p className="adm-card-title">Filtre rapide</p></div>
              <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {(['all','confirmed','scheduled','completed','cancelled'] as const).map((s) => {
                  const lbl: Record<string, string> = { all: 'Tous', confirmed: 'Confirmés', scheduled: 'Planifiés', completed: 'Terminés', cancelled: 'Annulés' };
                  return (
                    <button key={s} onClick={() => setStatusFilter(s)} style={{
                      textAlign: 'left', padding: '6px 10px', borderRadius: 6, border: '1px solid',
                      borderColor: statusFilter === s ? 'var(--c-accent)' : 'var(--c-bdr)',
                      background: statusFilter === s ? 'var(--c-accent-bg)' : 'var(--c-surf2)',
                      color: statusFilter === s ? 'var(--c-accent)' : 'var(--c-t1)',
                      cursor: 'pointer', fontSize: 12, fontWeight: statusFilter === s ? 600 : 400,
                      fontFamily: 'Roboto, sans-serif', transition: 'all 0.15s',
                    }}>{lbl[s]}</button>
                  );
                })}
              </div>
            </div>

            {selected && (
              <div className="adm-card">
                <div className="adm-card-head">
                  <p className="adm-card-title">Détail RDV</p>
                  <button className="adm-link-btn" style={{ fontSize: 11 }} onClick={() => setSelected(null)}>✕ Fermer</button>
                </div>
                <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    { k: 'Patient', v: selected.patientName },
                    { k: 'Médecin', v: selected.doctorName },
                    { k: 'Service', v: selected.department },
                    { k: 'Date',    v: new Date(selected.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) },
                    { k: 'Heure',   v: selected.time },
                    { k: 'Durée',   v: `${selected.duration} min` },
                    { k: 'Type',    v: selected.type },
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
                  <div style={{ marginTop: 10, borderTop: '1px solid var(--c-bdr)', paddingTop: 10 }}>
                    <p style={{ fontSize: 10.5, color: 'var(--c-t3)', marginBottom: 6 }}>Changer le statut</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {STATUS_ACTIONS.map(({ value, label, color }) => (
                        <button key={value} disabled={updatingId === selected.id}
                          onClick={() => handleStatusChange(selected.id, value)}
                          style={{ fontSize: 11, padding: '4px 9px', borderRadius: 5, border: `1px solid ${color}`, background: 'transparent', color, cursor: 'pointer', fontFamily: 'Roboto, sans-serif', opacity: updatingId === selected.id ? 0.5 : 1 }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                    <button onClick={() => setEditingAppt(selected)} className="adm-btn" style={{ flex: 1, height: 32, fontSize: 11, justifyContent: 'center' }}>
                      Modifier
                    </button>
                    <button onClick={() => handleDelete(selected.id)} style={{ flex: 1, height: 32, fontSize: 11, borderRadius: 6, border: '1px solid #dc2626', background: 'transparent', color: '#dc2626', cursor: 'pointer', fontFamily: 'Roboto, sans-serif' }}>
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
