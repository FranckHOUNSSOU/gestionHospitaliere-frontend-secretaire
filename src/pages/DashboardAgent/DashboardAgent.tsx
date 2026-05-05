import './DashboardAgent.css';
import {
  Users, CalendarDays, BedDouble, Receipt, AlertCircle, ArrowRight, UserPlus,
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard/StatCard';
import Badge, { statusBadge } from '../../components/ui/Badge/Badge';
import { patients, appointments, admissions, invoices } from '../../services/mockData';
import { useNavigation } from '../../context/NavigationContext';

export default function DashboardAgent() {
  const { navigate } = useNavigation();

  const today = '2026-04-17';
  const todayAppts = appointments.filter((a) => a.date === today);
  const activeAdmissions = admissions.filter((a) => a.status === 'active');
  const pendingInvoices = invoices.filter((i) => i.status === 'pending' || i.status === 'overdue');
  const totalRevenue = invoices.reduce((s, i) => s + i.paid, 0);

  const upcomingAppts = appointments
    .filter((a) => a.date >= today && a.status !== 'cancelled' && a.status !== 'completed')
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .slice(0, 5);

  const recentPatients = [...patients]
    .sort((a, b) => b.registrationDate.localeCompare(a.registrationDate))
    .slice(0, 5);

  const overdueInvoices = invoices.filter((i) => i.status === 'overdue');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* KPI Cards */}
      <div className="adm-kpi-grid">
        <StatCard title="Patients enregistrés" value={patients.length} subtitle="Total dans le système"
          icon={<Users size={18} />} color="blue" trend={{ value: '2 ce mois', up: true }} />
        <StatCard title="RDV aujourd'hui" value={todayAppts.length}
          subtitle={`${todayAppts.filter((a) => a.status === 'confirmed').length} confirmés`}
          icon={<CalendarDays size={18} />} color="cyan" />
        <StatCard title="Admissions actives" value={activeAdmissions.length} subtitle="Patients hospitalisés"
          icon={<BedDouble size={18} />} color="amber" />
        <StatCard title="Recettes (GNF)" value={`${(totalRevenue / 1000).toFixed(0)}K`}
          subtitle={`${pendingInvoices.length} factures en attente`}
          icon={<Receipt size={18} />} color="emerald" trend={{ value: '12% vs mois dernier', up: true }} />
      </div>

      {/* Appointments + Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 290px', gap: '16px', alignItems: 'start' }}>
        <div className="adm-card">
          <div className="adm-card-head">
            <div>
              <p className="adm-card-title">Rendez-vous du jour</p>
              <p className="adm-card-sub">{todayAppts.length} rendez-vous planifiés</p>
            </div>
            <button onClick={() => navigate('appointments')} className="adm-btn" style={{ gap: '4px' }}>
              Voir tout <ArrowRight size={13} />
            </button>
          </div>
          {todayAppts.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--c-t3)', fontSize: '12px' }}>
              Aucun rendez-vous aujourd'hui
            </div>
          ) : (
            todayAppts.map((appt) => {
              const { variant, label } = statusBadge(appt.status);
              return (
                <div key={appt.id} className="adm-list-row">
                  <div style={{ width: 42, height: 42, borderRadius: '8px', background: 'var(--c-accent-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--c-accent)', lineHeight: 1 }}>{appt.time}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="adm-cell-name adm-text-truncate">{appt.patientName}</p>
                    <p className="adm-cell-mono">{appt.doctorName} · {appt.department}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <Badge variant={variant}>{label}</Badge>
                    <p className="adm-cell-mono" style={{ marginTop: '3px' }}>{appt.type}</p>
                  </div>
                </div>
              );
            })
          )}
          <div style={{ padding: '10px 16px', borderTop: '1px solid var(--c-bdr)' }}>
            <button onClick={() => navigate('appointment-new')} className="adm-btn" style={{ width: '100%', justifyContent: 'center', gap: '6px' }}>
              <UserPlus size={14} /> Ajouter un rendez-vous
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Occupation */}
          <div className="adm-card">
            <div className="adm-card-head">
              <p className="adm-card-title">Occupation des services</p>
            </div>
            <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { name: 'Médecine interne', occ: 28, total: 35 },
                { name: 'Pédiatrie',        occ: 22, total: 30 },
                { name: 'Chirurgie',        occ: 18, total: 25 },
                { name: 'Cardiologie',      occ: 14, total: 20 },
                { name: 'Gynécologie',      occ: 11, total: 20 },
              ].map((dep) => {
                const pct = Math.round((dep.occ / dep.total) * 100);
                const fillColor = pct >= 90 ? 'adm-pf-red' : pct >= 70 ? 'adm-pf-amber' : 'adm-pf-green';
                return (
                  <div key={dep.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11.5px', color: 'var(--c-t1)' }}>{dep.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--c-t3)' }}>{dep.occ}/{dep.total}</span>
                    </div>
                    <div className="adm-progress">
                      <div className={`adm-progress-fill ${fillColor}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alertes */}
          <div className="adm-card">
            <div className="adm-card-head">
              <p className="adm-card-title">Alertes</p>
            </div>
            <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {overdueInvoices.map((inv) => (
                <div key={inv.id} className="adm-alert adm-alert-danger">
                  <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <div>
                    <p style={{ fontWeight: 600, marginBottom: '1px', fontSize: '12px' }}>{inv.invoiceNumber}</p>
                    <p style={{ fontSize: '11px', margin: 0 }}>{inv.patientName} · {(inv.total / 1000).toFixed(0)}K GNF</p>
                  </div>
                </div>
              ))}
              {activeAdmissions.map((adm) => (
                <div key={adm.id} className="adm-alert adm-alert-info">
                  <BedDouble size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <div>
                    <p style={{ fontWeight: 600, marginBottom: '1px', fontSize: '12px' }}>{adm.patientName}</p>
                    <p style={{ fontSize: '11px', margin: 0 }}>{adm.department} · {adm.room}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Patients + Upcoming Appointments */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="adm-card">
          <div className="adm-card-head">
            <p className="adm-card-title">Patients récents</p>
            <button onClick={() => navigate('patient-new')} className="adm-btn adm-btn-primary">
              <UserPlus size={13} /> Nouveau
            </button>
          </div>
          {recentPatients.map((p) => {
            const { variant, label } = statusBadge(p.status);
            return (
              <div key={p.id} className="adm-list-row adm-list-row--clickable"
                onClick={() => navigate('patient-detail', p.id)}>
                <div className="adm-avatar-sm" style={{ background: 'linear-gradient(135deg,#60a5fa,#06b6d4)' }}>
                  {p.firstName[0]}{p.lastName[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="adm-cell-name">{p.firstName} {p.lastName}</p>
                  <p className="adm-cell-mono">{p.phone}</p>
                </div>
                <Badge variant={variant}>{label}</Badge>
              </div>
            );
          })}
        </div>

        <div className="adm-card">
          <div className="adm-card-head">
            <p className="adm-card-title">Prochains rendez-vous</p>
            <button onClick={() => navigate('appointments')} className="adm-btn" style={{ gap: '4px' }}>
              Tous <ArrowRight size={13} />
            </button>
          </div>
          {upcomingAppts.map((appt) => {
            const { variant, label } = statusBadge(appt.status);
            return (
              <div key={appt.id} className="adm-list-row">
                <div style={{ width: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '10px', color: 'var(--c-t3)' }}>
                    {new Date(appt.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--c-accent)' }}>{appt.time}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="adm-cell-name adm-text-truncate">{appt.patientName}</p>
                  <p className="adm-cell-mono">{appt.doctorName}</p>
                </div>
                <Badge variant={variant}>{label}</Badge>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        {[
          { bg: 'linear-gradient(135deg,#2563eb,#1d4ed8)', btnColor: '#1e40af', label: 'Enregistrer', sub: 'un patient', btnText: 'Nouveau patient', action: 'patient-new', icon: <UserPlus size={18} /> },
          { bg: 'linear-gradient(135deg,#0891b2,#0e7490)', btnColor: '#164e63', label: 'Planifier', sub: 'un rendez-vous', btnText: 'Nouveau RDV', action: 'appointment-new', icon: <CalendarDays size={18} /> },
          { bg: 'linear-gradient(135deg,#059669,#047857)', btnColor: '#065f46', label: 'Créer', sub: 'une facture', btnText: 'Nouvelle facture', action: 'billing-new', icon: <Receipt size={18} /> },
        ].map((card) => (
          <div key={card.action} style={{ background: card.bg, borderRadius: '12px', padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: 38, height: 38, borderRadius: '8px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                {card.icon}
              </div>
              <div>
                <p style={{ fontWeight: 600, color: '#fff', fontSize: '13px', margin: 0 }}>{card.label}</p>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', margin: 0 }}>{card.sub}</p>
              </div>
            </div>
            <button onClick={() => navigate(card.action as any)}
              style={{ width: '100%', padding: '7px 0', borderRadius: '7px', border: 'none', background: '#fff', color: card.btnColor, fontWeight: 600, fontSize: '12px', cursor: 'pointer', fontFamily: 'Roboto, sans-serif' }}>
              {card.btnText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
