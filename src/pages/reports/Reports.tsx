import { BarChart3, Users, CalendarDays, BedDouble, Receipt, Download } from 'lucide-react';
import { patients, appointments, admissions, invoices, departments } from '../../services/mockData';
import { BarGroup } from './BarGroup';

const monthlyPatients     = [12, 18, 15, 22, 8, 14, 19, 25, 17, 21, 16, 24];
const monthlyRevenue      = [1200, 1850, 1400, 2100, 800, 1600, 1900, 2400, 1700, 2000, 1500, 2300];
const monthlyAppointments = [45, 62, 55, 78, 38, 52, 65, 88, 60, 75, 58, 82];

const maxPatients = Math.max(...monthlyPatients);
const maxRevenue  = Math.max(...monthlyRevenue);
const maxAppts    = Math.max(...monthlyAppointments);

export default function Reports() {
  const totalRevenue = invoices.reduce((s, i) => s + i.total, 0);
  const totalPaid    = invoices.reduce((s, i) => s + i.paid, 0);
  const collectionRate = totalRevenue > 0 ? Math.round((totalPaid / totalRevenue) * 100) : 0;

  const apptByDept = departments.map((d) => ({
    name: d.name,
    count: appointments.filter((a) => a.department === d.name).length,
  })).sort((a, b) => b.count - a.count);

  const maxDeptCount = Math.max(...apptByDept.map((d) => d.count), 1);

  const statusCounts = {
    active:       patients.filter((p) => p.status === 'active').length,
    hospitalized: patients.filter((p) => p.status === 'hospitalized').length,
    discharged:   patients.filter((p) => p.status === 'discharged').length,
  };

  const apptStatusCounts = {
    completed: appointments.filter((a) => a.status === 'completed').length,
    scheduled: appointments.filter((a) => a.status === 'scheduled').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--c-t0)', margin: 0 }}>Vue globale — Avril 2026</p>
          <p style={{ fontSize: '12px', color: 'var(--c-t2)', margin: '2px 0 0' }}>Statistiques de l'activité hospitalière</p>
        </div>
        <button className="adm-btn"><Download size={13} /> Exporter le rapport</button>
      </div>

      {/* KPI cards */}
      <div className="adm-kpi-grid">
        {[
          { label: 'Total patients',     value: patients.length,    sub: '+2 ce mois',                            icon: <Users size={16} />,       kpi: 'adm-kpi-blue' },
          { label: 'RDV ce mois',        value: appointments.length,sub: `${apptStatusCounts.completed} terminés`,icon: <CalendarDays size={16} />, kpi: 'adm-kpi-blue' },
          { label: "Taux d'occupation",  value: `${Math.round((departments.reduce((s, d) => s + d.occupiedBeds, 0) / departments.reduce((s, d) => s + d.beds, 0)) * 100)}%`,
            sub: `${departments.reduce((s, d) => s + d.occupiedBeds, 0)} lits occupés`, icon: <BedDouble size={16} />, kpi: 'adm-kpi-orange' },
          { label: 'Taux de recouvrement', value: `${collectionRate}%`, sub: `${(totalPaid / 1000).toFixed(0)}K GNF encaissés`, icon: <Receipt size={16} />, kpi: 'adm-kpi-green' },
        ].map((stat) => (
          <div key={stat.label} className={`adm-kpi ${stat.kpi}`}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
              <p className="adm-kpi-lbl" style={{ marginBottom: 0 }}>{stat.label}</p>
              <span style={{ opacity: 0.6 }}>{stat.icon}</span>
            </div>
            <div className="adm-kpi-val">{stat.value}</div>
            <p className="adm-kpi-note adm-note-neutral">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Bar charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        {[
          { title: 'Nouveaux patients / mois', sub: 'Année 2026', values: monthlyPatients, max: maxPatients, color: 'var(--c-accent)' },
          { title: 'Rendez-vous / mois',       sub: 'Année 2026', values: monthlyAppointments, max: maxAppts, color: 'var(--c-green)' },
          { title: 'Recettes (K GNF) / mois',  sub: 'Année 2026', values: monthlyRevenue,  max: maxRevenue,  color: 'var(--c-amber)' },
        ].map((chart) => (
          <div key={chart.title} className="adm-card">
            <div className="adm-card-head">
              <div>
                <p className="adm-card-title">{chart.title}</p>
                <p className="adm-card-sub">{chart.sub}</p>
              </div>
              <BarChart3 size={14} style={{ color: 'var(--c-t3)' }} />
            </div>
            <div className="adm-card-body">
              <BarGroup values={chart.values} max={chart.max} color={chart.color} />
            </div>
          </div>
        ))}
      </div>

      {/* RDV par service + Répartition patients */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div className="adm-card">
          <div className="adm-card-head">
            <p className="adm-card-title">RDV par service</p>
          </div>
          <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {apptByDept.filter((d) => d.count > 0).map((dep) => (
              <div key={dep.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--c-t1)' }}>{dep.name}</span>
                  <span className="adm-cell-mono">{dep.count}</span>
                </div>
                <div className="adm-progress">
                  <div className="adm-progress-fill adm-pf-blue" style={{ width: `${Math.round((dep.count / maxDeptCount) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="adm-card">
          <div className="adm-card-head">
            <p className="adm-card-title">Répartition des patients</p>
          </div>
          <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <p className="adm-sec-h">Par statut</p>
              {[
                { label: 'Actifs',        value: statusCounts.active,       fillCls: 'adm-pf-green' },
                { label: 'Hospitalisés',  value: statusCounts.hospitalized, fillCls: 'adm-pf-blue' },
                { label: 'Sortis',        value: statusCounts.discharged,   fillCls: 'adm-pf-amber' },
              ].map((s) => (
                <div key={s.label} style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--c-t2)' }}>{s.label}</span>
                    <span className="adm-cell-mono">{s.value} ({Math.round((s.value / patients.length) * 100)}%)</span>
                  </div>
                  <div className="adm-progress">
                    <div className={`adm-progress-fill ${s.fillCls}`} style={{ width: `${Math.round((s.value / patients.length) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ paddingTop: '10px', borderTop: '1px solid var(--c-bdr)' }}>
              <p className="adm-sec-h">Rendez-vous par statut</p>
              {[
                { label: 'Terminés',  value: apptStatusCounts.completed, dot: 'var(--c-green)' },
                { label: 'Confirmés', value: apptStatusCounts.confirmed,  dot: 'var(--c-accent)' },
                { label: 'Planifiés', value: apptStatusCounts.scheduled,  dot: 'var(--c-amber)' },
                { label: 'Annulés',   value: apptStatusCounts.cancelled,  dot: 'var(--c-red)' },
              ].map((s) => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', color: 'var(--c-t2)', flex: 1 }}>{s.label}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--c-t0)' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Financial summary */}
      <div className="adm-card">
        <div className="adm-card-head">
          <p className="adm-card-title">Situation financière</p>
        </div>
        <div className="adm-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
            {[
              { label: 'Total facturé', value: totalRevenue, color: 'var(--c-t0)' },
              { label: 'Encaissé',      value: totalPaid,    color: 'var(--c-green)' },
              { label: 'En attente',    value: invoices.filter((i) => i.status === 'pending' || i.status === 'partial').reduce((s, i) => s + (i.total - i.paid), 0), color: 'var(--c-amber)' },
              { label: 'En retard',     value: invoices.filter((i) => i.status === 'overdue').reduce((s, i) => s + i.total, 0), color: 'var(--c-red)' },
            ].map((s) => (
              <div key={s.label} style={{ background: 'var(--c-surf2)', border: '1px solid var(--c-bdr)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                <p style={{ fontSize: '18px', fontWeight: 700, color: s.color, margin: '0 0 4px' }}>{(s.value / 1000).toFixed(0)}K</p>
                <p className="adm-cell-mono" style={{ textAlign: 'center' }}>{s.label} (GNF)</p>
              </div>
            ))}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', color: 'var(--c-t2)' }}>Taux de recouvrement</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--c-t0)' }}>{collectionRate}%</span>
            </div>
            <div className="adm-progress" style={{ height: '10px' }}>
              <div className="adm-progress-fill adm-pf-green" style={{ width: `${collectionRate}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
