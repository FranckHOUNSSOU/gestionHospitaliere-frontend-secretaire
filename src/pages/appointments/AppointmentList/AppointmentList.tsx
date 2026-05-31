import './AppointmentList.css';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Plus, List, CalendarDays, Search, ChevronLeft, ChevronRight, Clock, MoreVertical, X, Save } from 'lucide-react';
import Badge, { statusBadge } from '../../../components/ui/Badge/Badge';
import { getRendezVous, updateStatutRendezVous, updateRendezVous, deleteRendezVous } from '../../../services/appointmentService';
import { useNavigation } from '../../../context/NavigationContext';
import type { AppointmentStatus, Appointment } from '../../../types/index';

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

const TIME_SLOTS = [
  '07:30','08:00','08:30','09:00','09:30','10:00','10:30','11:00',
  '11:30','12:00','14:00','14:30','15:00','15:30','16:00','16:30','17:00',
];

const APPOINTMENT_TYPES = ['Consultation','Suivi','Contrôle','Examen','Pré-opératoire','Urgence','Vaccination','Autre'];

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

type CalEvent = { id: string; title: string; start: Date; end: Date; resource: Appointment };

function toEvent(appt: Appointment): CalEvent {
  const [y, m, d] = appt.date.split('-').map(Number);
  const [h, min]  = appt.time.split(':').map(Number);
  const start = new Date(y, m - 1, d, h, min);
  const end   = new Date(start.getTime() + appt.duration * 60_000);
  return { id: appt.id, title: `${appt.patientName} — ${appt.doctorName}`, start, end, resource: appt };
}

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

type RbcToolbarProps = { label: string; view: string; views: string[]; onNavigate: (a: string) => void; onView: (v: string) => void };
const VIEW_LABELS: Record<string, string> = { month: 'Mois', week: 'Semaine', day: 'Jour', agenda: 'Agenda' };

function CustomToolbar({ label, view, views, onNavigate, onView }: RbcToolbarProps) {
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

/* ── Modal de modification ─────────────────────────────────────────────────── */
interface EditModalProps {
  appt: Appointment;
  onClose: () => void;
  onSaved: (updated: Appointment) => void;
}

function EditModal({ appt, onClose, onSaved }: EditModalProps) {
  const [form, setForm] = useState({
    date:     appt.date,
    time:     appt.time,
    duration: String(appt.duration),
    type:     appt.type,
    notes:    appt.notes ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  function handleChange(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!form.date || !form.time) { setError('Date et heure obligatoires.'); return; }
    setSaving(true); setError(null);
    try {
      await updateRendezVous(appt.id, {
        dateHeure:    `${form.date}T${form.time}:00`,
        dureeMinutes: Number(form.duration),
        type:         form.type,
        motif:        form.notes || undefined,
      });
      onSaved({
        ...appt,
        date:     form.date,
        time:     form.time,
        duration: Number(form.duration),
        type:     form.type,
        notes:    form.notes || undefined,
      });
    } catch (e: any) {
      setError(e?.message ?? 'Erreur lors de la modification.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)' }}
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'var(--c-bg)', borderRadius: 12, width: '100%', maxWidth: 520, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--c-bdr)' }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: 'var(--c-t0)' }}>Modifier le rendez-vous</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-t3)', display: 'flex' }}><X size={18} /></button>
        </div>

        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Infos non modifiables */}
          <div style={{ background: 'var(--c-surf2)', borderRadius: 8, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { k: 'Patient',  v: appt.patientName },
              { k: 'Médecin',  v: appt.doctorName },
              { k: 'Service',  v: appt.department },
            ].map(({ k, v }) => (
              <div key={k} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                <span style={{ fontSize: 11, color: 'var(--c-t3)', minWidth: 60 }}>{k}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-t1)' }}>{v || '—'}</span>
              </div>
            ))}
          </div>

          {error && <div className="adm-alert adm-alert-error">{error}</div>}

          {/* Date + Durée */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="adm-form-field">
              <label className="adm-label">Date *</label>
              <input type="date" className="adm-input" value={form.date} onChange={e => handleChange('date', e.target.value)} />
            </div>
            <div className="adm-form-field">
              <label className="adm-label">Durée</label>
              <select className="adm-input" value={form.duration} onChange={e => handleChange('duration', e.target.value)}>
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">1 heure</option>
                <option value="90">1h30</option>
                <option value="120">2 heures</option>
              </select>
            </div>
          </div>

          {/* Créneaux horaires */}
          <div className="adm-form-field">
            <label className="adm-label">Créneau horaire *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5 }}>
              {TIME_SLOTS.map((t) => (
                <button key={t} type="button" onClick={() => handleChange('time', t)}
                  className={form.time === t ? 'adm-btn adm-btn-primary' : 'adm-btn'}
                  style={{ justifyContent: 'center', height: 28, fontSize: 11 }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div className="adm-form-field">
            <label className="adm-label">Type de consultation</label>
            <select className="adm-input" value={form.type} onChange={e => handleChange('type', e.target.value)}>
              {APPOINTMENT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* Notes */}
          <div className="adm-form-field">
            <label className="adm-label">Notes / Motif</label>
            <textarea className="adm-input" rows={2} value={form.notes}
              onChange={e => handleChange('notes', e.target.value)}
              placeholder="Motif de consultation…" />
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 8, padding: '12px 20px', borderTop: '1px solid var(--c-bdr)', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="adm-btn" style={{ height: 36 }}>Annuler</button>
          <button onClick={handleSave} disabled={saving} className="adm-btn adm-btn-primary" style={{ height: 36, gap: 6 }}>
            <Save size={13} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════════════════════════ */
export default function AppointmentList() {
  const { navigate } = useNavigation();
  const [view, setView]         = useState<'list' | 'calendar'>('calendar');
  const [calView, setCalView]   = useState<string>(Views.MONTH);
  const [calDate, setCalDate]   = useState(new Date());
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Popover statut (liste)
  const [openStatusId, setOpenStatusId] = useState<string | null>(null);
  // Menu ⋮ (liste)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  // Modal édition
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);

  const statusPopoverRef = useRef<HTMLDivElement>(null);
  const menuPopoverRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    getRendezVous()
      .then(({ data }) => setAppointments(data))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, []);

  // Fermer les popovers au clic extérieur
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (statusPopoverRef.current && !statusPopoverRef.current.contains(e.target as Node)) setOpenStatusId(null);
      if (menuPopoverRef.current   && !menuPopoverRef.current.contains(e.target as Node))   setOpenMenuId(null);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...appointments]
      .filter((a) => {
        const matchSearch = a.patientName.toLowerCase().includes(q) || a.doctorName.toLowerCase().includes(q) || a.department.toLowerCase().includes(q);
        const matchStatus = statusFilter === 'all' || a.status === statusFilter;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  }, [search, statusFilter, appointments]);

  const events = useMemo(() => appointments.map(toEvent), [appointments]);

  const eventPropGetter = useCallback((event: CalEvent) => {
    const s = STATUS_STYLE[event.resource.status] ?? STATUS_STYLE.scheduled;
    return { style: { backgroundColor: s.background, borderColor: s.border, borderRadius: '5px', color: '#fff', border: `1px solid ${s.border}`, padding: '2px 5px' } };
  }, []);

  const dayPropGetter = useCallback((date: Date) => {
    const t = new Date();
    const isToday = date.getDate() === t.getDate() && date.getMonth() === t.getMonth() && date.getFullYear() === t.getFullYear();
    return isToday ? { style: { backgroundColor: 'rgba(14,165,233,0.07)' } } : {};
  }, []);

  const handleStatusChange = useCallback(async (id: string, statut: StatusBackend) => {
    setUpdatingId(id); setOpenStatusId(null);
    try {
      await updateStatutRendezVous(id, statut);
      const newStatus = BACKEND_TO_FRONTEND[statut];
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
      setSelected(prev => prev?.id === id ? { ...prev, status: newStatus } : prev);
    } catch { /* silent */ } finally { setUpdatingId(null); }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('Supprimer ce rendez-vous ? Cette action est irréversible.')) return;
    setOpenMenuId(null);
    try {
      await deleteRendezVous(id);
      setAppointments(prev => prev.filter(a => a.id !== id));
      setSelected(prev => prev?.id === id ? null : prev);
    } catch { /* silent */ }
  }, []);

  const handleSaved = useCallback((updated: Appointment) => {
    setAppointments(prev => prev.map(a => a.id === updated.id ? updated : a));
    setSelected(prev => prev?.id === updated.id ? updated : prev);
    setEditingAppt(null);
  }, []);

  const onSelectEvent = useCallback((e: CalEvent) => setSelected(e.resource), []);
  const onSelectSlot  = useCallback((slotInfo: { start: Date | string }) => {
    const d = slotInfo.start instanceof Date ? slotInfo.start : new Date(slotInfo.start);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    navigate('appointment-new', undefined, { prefillDate: dateStr });
  }, [navigate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Modal d'édition */}
      {editingAppt && (
        <EditModal appt={editingAppt} onClose={() => setEditingAppt(null)} onSaved={handleSaved} />
      )}

      {/* ── En-tête ── */}
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

      {/* ── VUE LISTE ── */}
      {view === 'list' && (
        <div className="adm-card">
          <div className="adm-card-head" style={{ gap: '10px', flexWrap: 'wrap' }}>
            <div className="adm-search" style={{ flex: 1, minWidth: '200px' }}>
              <span className="adm-search-icon"><Search size={14} /></span>
              <input type="text" placeholder="Rechercher patient, médecin, service..." value={search}
                onChange={(e) => setSearch(e.target.value)} className="adm-search-input" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | 'all')}
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
                ) : (
                  filtered.map((appt) => {
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

                        {/* ── Statut cliquable ── */}
                        <td>
                          {isBusy ? (
                            <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--c-bdr)', borderTopColor: 'var(--c-accent)', animation: 'spin 0.7s linear infinite' }} />
                          ) : (
                            <div style={{ position: 'relative', display: 'inline-block' }} ref={openStatusId === appt.id ? statusPopoverRef : undefined}>
                              <button
                                onClick={() => setOpenStatusId(prev => prev === appt.id ? null : appt.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                              >
                                <Badge variant={variant}>{label}</Badge>
                              </button>
                              {openStatusId === appt.id && (
                                <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 200, marginTop: 4, background: 'var(--c-bg)', border: '1px solid var(--c-bdr)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', minWidth: 140, overflow: 'hidden' }}>
                                  {STATUS_ACTIONS.map(({ value, label: lbl, color }) => (
                                    <button
                                      key={value}
                                      onClick={() => handleStatusChange(appt.id, value)}
                                      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--c-t1)', fontFamily: 'Roboto, sans-serif', textAlign: 'left' }}
                                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--c-surf2)')}
                                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                                    >
                                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                                      {lbl}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* ── Menu ⋮ ── */}
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ position: 'relative', display: 'inline-block' }} ref={openMenuId === appt.id ? menuPopoverRef : undefined}>
                            <button
                              onClick={() => setOpenMenuId(prev => prev === appt.id ? null : appt.id)}
                              className="adm-icon-btn"
                              style={{ width: 30, height: 30 }}
                            >
                              <MoreVertical size={14} />
                            </button>
                            {openMenuId === appt.id && (
                              <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 200, marginTop: 4, background: 'var(--c-bg)', border: '1px solid var(--c-bdr)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', minWidth: 130, overflow: 'hidden' }}>
                                <button
                                  onClick={() => { setEditingAppt(appt); setOpenMenuId(null); }}
                                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--c-t1)', fontFamily: 'Roboto, sans-serif', textAlign: 'left' }}
                                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--c-surf2)')}
                                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                                >
                                  ✏️ Modifier
                                </button>
                                <button
                                  onClick={() => handleDelete(appt.id)}
                                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#dc2626', fontFamily: 'Roboto, sans-serif', textAlign: 'left' }}
                                  onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
                                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                                >
                                  🗑️ Supprimer
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── VUE CALENDRIER ── */}
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
              components={{ toolbar: CustomToolbar as any, event: EventCard as any }}
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

          {/* Panneau latéral */}
          <div style={{ width: 248, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Légende */}
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

            {/* Filtre rapide */}
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
                    }}>
                      {lbl[s]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Détail RDV sélectionné */}
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
                  {/* Changement de statut */}
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
                  {/* Actions */}
                  <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                    <button onClick={() => setEditingAppt(selected)} className="adm-btn" style={{ flex: 1, height: 32, fontSize: 11, justifyContent: 'center' }}>
                      ✏️ Modifier
                    </button>
                    <button onClick={() => handleDelete(selected.id)} style={{ flex: 1, height: 32, fontSize: 11, borderRadius: 6, border: '1px solid #dc2626', background: 'transparent', color: '#dc2626', cursor: 'pointer', fontFamily: 'Roboto, sans-serif' }}>
                      🗑️ Supprimer
                    </button>
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
