import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight, List, CalendarDays } from 'lucide-react';
import Badge, { statusBadge } from '../../components/ui/Badge';
import { getRendezVous } from '../../services/appointmentService';
import { useNavigation } from '../../context/NavigationContext';
import type { Appointment, AppointmentStatus } from '../../types/index';

const DAYS   = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export default function AppointmentList() {
  const { navigate } = useNavigation();
  const [view, setView]               = useState<'list' | 'calendar'>('list');
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [currentDate, setCurrentDate] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading]         = useState(false);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getRendezVous();
      setAppointments(data);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAppointments(); }, [loadAppointments]);

  const filtered = appointments.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      a.patientName.toLowerCase().includes(q) ||
      a.doctorName.toLowerCase().includes(q) ||
      a.department.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const sorted = [...filtered].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  function getCalendarDays() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    const days: (number | null)[] = Array(startOffset).fill(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }

  function getApptForDay(day: number) {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return appointments.filter((a) => a.date === `${y}-${m}-${d}`);
  }

  const calendarDays = getCalendarDays();
  const today = new Date();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div className="adm-view-toggle">
          <button onClick={() => setView('list')} className={`adm-view-btn${view === 'list' ? ' active' : ''}`}>
            <List size={14} /> Liste
          </button>
          <button onClick={() => setView('calendar')} className={`adm-view-btn${view === 'calendar' ? ' active' : ''}`}>
            <CalendarDays size={14} /> Calendrier
          </button>
        </div>
        <button onClick={() => navigate('appointment-new')} className="adm-btn adm-btn-primary">
          <Plus size={13} /> Nouveau rendez-vous
        </button>
      </div>

      {view === 'list' ? (
        <div className="adm-card">
          {/* Filters */}
          <div className="adm-card-head" style={{ gap: '10px', flexWrap: 'wrap' }}>
            <div className="adm-search" style={{ flex: 1, minWidth: '200px' }}>
              <span className="adm-search-icon"><Search size={14} /></span>
              <input type="text" placeholder="Rechercher patient, médecin, service..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="adm-search-input" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | 'all')}
              className="adm-input" style={{ width: 'auto', padding: '6px 10px' }}>
              <option value="all">Tous les statuts</option>
              <option value="scheduled">Planifié</option>
              <option value="confirmed">Confirmé</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
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
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--c-t3)' }}>Chargement…</td></tr>
                ) : sorted.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--c-t3)' }}>Aucun rendez-vous trouvé</td></tr>
                ) : (
                  sorted.map((appt) => {
                    const { variant, label } = statusBadge(appt.status);
                    return (
                      <tr key={appt.id}>
                        <td>
                          <p className="adm-cell-name">{appt.time}</p>
                          <p className="adm-cell-mono">
                            {new Date(appt.date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })}
                          </p>
                        </td>
                        <td>
                          <button onClick={() => navigate('patient-detail', appt.patientId)} className="adm-link-btn">
                            {appt.patientName}
                          </button>
                        </td>
                        <td><span className="adm-cell-mono" style={{ fontSize: '12px', color: 'var(--c-t1)' }}>{appt.doctorName}</span></td>
                        <td><span className="adm-cell-mono" style={{ fontSize: '12px', color: 'var(--c-t1)' }}>{appt.department}</span></td>
                        <td><span className="adm-tag adm-t-gray">{appt.type}</span></td>
                        <td><Badge variant={variant}>{label}</Badge></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="adm-card">
          <div className="adm-card-head">
            <p className="adm-card-title">{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</p>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                className="adm-btn" style={{ padding: '0 8px', height: '30px' }}><ChevronLeft size={15} /></button>
              <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                className="adm-btn" style={{ padding: '0 8px', height: '30px' }}><ChevronRight size={15} /></button>
            </div>
          </div>
          <div className="adm-card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
              {DAYS.map((d) => (
                <div key={d} style={{ textAlign: 'center', fontSize: '10.5px', fontWeight: 700, color: 'var(--c-t3)', padding: '4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{d}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {calendarDays.map((day, i) => {
                if (!day) return <div key={i} style={{ minHeight: '76px' }} />;
                const dayAppts = getApptForDay(day);
                const isToday =
                  day === today.getDate() &&
                  currentDate.getMonth() === today.getMonth() &&
                  currentDate.getFullYear() === today.getFullYear();
                return (
                  <div key={i} className={`adm-cal-cell${isToday ? ' adm-cal-cell--today' : ''}`}>
                    <p className="adm-cal-day">{day}</p>
                    {dayAppts.slice(0, 2).map((a) => {
                      const cls = a.status === 'confirmed' ? 'adm-ce-blue' : a.status === 'completed' ? 'adm-ce-green' : a.status === 'cancelled' ? 'adm-ce-red' : 'adm-ce-gray';
                      return (
                        <div key={a.id} className={`adm-cal-event ${cls}`}>
                          {a.time} {a.patientName.split(' ')[0]}
                        </div>
                      );
                    })}
                    {dayAppts.length > 2 && (
                      <p style={{ fontSize: '9px', color: 'var(--c-t3)', margin: 0 }}>+{dayAppts.length - 2} autres</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
