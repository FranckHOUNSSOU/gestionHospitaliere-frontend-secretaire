import { useState, useEffect } from 'react';
import { BarChart3, Users, CalendarDays, BedDouble, Receipt, Download, Loader2 } from 'lucide-react';
import { getAdmission } from '../../../services/getAdmission';
import { getFacture } from '../../../services/getFacture';
import { BarGroup } from './BarGroup';

const monthlyPatients     = [12, 18, 15, 22, 8, 14, 19, 25, 17, 21, 16, 24];
const monthlyRevenue      = [1200, 1850, 1400, 2100, 800, 1600, 1900, 2400, 1700, 2000, 1500, 2300];
const monthlyAppointments = [45, 62, 55, 78, 38, 52, 65, 88, 60, 75, 58, 82];

const maxPatients = Math.max(...monthlyPatients);
const maxRevenue  = Math.max(...monthlyRevenue);
const maxAppts    = Math.max(...monthlyAppointments);

export default function Reports() {
  const [stats,     setStats]     = useState(null as any);
  const [invoices,  setInvoices]  = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      getAdmission.getStats(),
      getFacture.getFactures(),
    ]).then(([s, inv]: [any, any[]]) => {
      setStats(s);
      setInvoices(inv as any);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalRevenue   = (invoices as any[]).reduce((s: number, i: any) => s + (i.montantTotal ?? i.total ?? 0), 0);
  const totalPaid      = (invoices as any[]).reduce((s: number, i: any) => s + (i.montantPaye ?? i.paid ?? 0), 0);
  const collectionRate = totalRevenue > 0 ? Math.round((totalPaid / totalRevenue) * 100) : 0;

  const totalPatients = stats?.totalPatients ?? stats?.patients ?? 0;
  const totalAdmActifs = stats?.admissionsActives ?? stats?.actifs ?? 0;
  const totalRdv       = stats?.totalRendezVous ?? stats?.rdv ?? 0;
  const tauxOccupation = stats?.tauxOccupation ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--c-t0)', margin: 0 }}>Vue globale</p>
          <p style={{ fontSize: '12px', color: 'var(--c-t2)', margin: '2px 0 0' }}>Statistiques de l'activité hospitalière</p>
        </div>
        <button className="adm-btn"><Download size={13} /> Exporter le rapport</button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px', gap: '10px', color: 'var(--c-t3)', fontSize: '13px' }}>
          <Loader2 size={18} style={{ animation: 'spin 0.7s linear infinite' }} />
          Chargement des statistiques…
        </div>
      ) : (
        <>
          <div className="adm-kpi-grid">
            {[
              { label: 'Total patients',     value: totalPatients,    sub: 'Enregistrés',            icon: <Users size={16} />,       kpi: 'adm-kpi-blue' },
              { label: 'RDV ce mois',        value: totalRdv,         sub: 'Rendez-vous planifiés',  icon: <CalendarDays size={16} />, kpi: 'adm-kpi-blue' },
              { label: "Admissions actives", value: totalAdmActifs,   sub: 'Patients hospitalisés',  icon: <BedDouble size={16} />,    kpi: 'adm-kpi-orange' },
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            {[
              { title: 'Nouveaux patients / mois', sub: 'Tendance annuelle', values: monthlyPatients,     max: maxPatients, color: 'var(--c-accent)' },
              { title: 'Rendez-vous / mois',       sub: 'Tendance annuelle', values: monthlyAppointments, max: maxAppts,    color: 'var(--c-green)' },
              { title: 'Recettes (K GNF) / mois',  sub: 'Tendance annuelle', values: monthlyRevenue,      max: maxRevenue,  color: 'var(--c-amber)' },
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

          <div className="adm-card">
            <div className="adm-card-head">
              <p className="adm-card-title">Situation financière</p>
            </div>
            <div className="adm-card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
                {[
                  { label: 'Total facturé', value: totalRevenue,  color: 'var(--c-t0)' },
                  { label: 'Encaissé',      value: totalPaid,     color: 'var(--c-green)' },
                  {
                    label: 'En attente',
                    value: (invoices as any[]).filter((i: any) => (i.statut ?? i.status) === 'pending' || (i.statut ?? i.status) === 'partial').reduce((s: number, i: any) => s + ((i.montantTotal ?? i.total ?? 0) - (i.montantPaye ?? i.paid ?? 0)), 0),
                    color: 'var(--c-amber)',
                  },
                  {
                    label: 'En retard',
                    value: (invoices as any[]).filter((i: any) => (i.statut ?? i.status) === 'overdue').reduce((s: number, i: any) => s + (i.montantTotal ?? i.total ?? 0), 0),
                    color: 'var(--c-red)',
                  },
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
        </>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
