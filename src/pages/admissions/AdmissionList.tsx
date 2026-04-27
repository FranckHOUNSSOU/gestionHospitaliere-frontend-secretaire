import { useState } from 'react';
import { Plus, Search, BedDouble, CheckCircle2, ArrowRight } from 'lucide-react';
import Badge, { statusBadge } from '../../components/ui/Badge';
import { admissions, departments } from '../../services/mockData';
import { useNavigation } from '../../context/NavigationContext';
import type { AdmissionStatus } from '../../types/index';

export default function AdmissionList() {
  const { navigate } = useNavigation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdmissionStatus | 'all'>('all');

  const filtered = admissions.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      a.patientName.toLowerCase().includes(q) ||
      a.department.toLowerCase().includes(q) ||
      a.room.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const active = admissions.filter((a) => a.status === 'active');
  const discharged = admissions.filter((a) => a.status === 'discharged');
  const transferred = admissions.filter((a) => a.status === 'transferred');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {[
          { label: 'Admissions actives', value: active.length,     icon: <BedDouble size={16} />,     kpi: 'adm-kpi-blue' },
          { label: 'Sorties récentes',   value: discharged.length,  icon: <CheckCircle2 size={16} />,  kpi: 'adm-kpi-green' },
          { label: 'Transférés',         value: transferred.length, icon: <ArrowRight size={16} />,    kpi: 'adm-kpi-orange' },
        ].map((s) => (
          <div key={s.label} className={`adm-kpi ${s.kpi}`}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <p className="adm-kpi-lbl" style={{ marginBottom: 0 }}>{s.label}</p>
              <span style={{ opacity: 0.6 }}>{s.icon}</span>
            </div>
            <div className="adm-kpi-val">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="adm-card">
        {/* Filters */}
        <div className="adm-card-head" style={{ gap: '10px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '8px', flex: 1, flexWrap: 'wrap' }}>
            <div className="adm-search" style={{ flex: 1, minWidth: '200px', maxWidth: '320px' }}>
              <span className="adm-search-icon"><Search size={14} /></span>
              <input type="text" placeholder="Patient, service, salle..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="adm-search-input" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as AdmissionStatus | 'all')}
              className="adm-input" style={{ width: 'auto', padding: '6px 10px' }}>
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="discharged">Sorti</option>
              <option value="transferred">Transféré</option>
            </select>
          </div>
          <button onClick={() => navigate('admission-new')} className="adm-btn adm-btn-primary">
            <Plus size={13} /> Nouvelle admission
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Service / Salle</th>
                <th>Médecin</th>
                <th>Entrée</th>
                <th>Sortie prévue</th>
                <th>Motif</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--c-t3)' }}>Aucune admission trouvée</td></tr>
              ) : (
                filtered.map((adm) => {
                  const { variant, label } = statusBadge(adm.status);
                  const days = adm.status === 'active'
                    ? Math.floor((new Date().getTime() - new Date(adm.admissionDate).getTime()) / 86400000)
                    : null;
                  return (
                    <tr key={adm.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="adm-avatar-sm" style={{ background: 'linear-gradient(135deg,#fbbf24,#f97316)' }}>
                            {adm.patientName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <button onClick={() => navigate('patient-detail', adm.patientId)} className="adm-link-btn">
                              {adm.patientName}
                            </button>
                            {days !== null && <p className="adm-cell-mono">{days} jour{days > 1 ? 's' : ''}</p>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <p className="adm-cell-name">{adm.department}</p>
                        <p className="adm-cell-mono">Salle {adm.room} · Lit {adm.bed}</p>
                      </td>
                      <td><span className="adm-cell-mono" style={{ fontSize: '12px', color: 'var(--c-t1)' }}>{adm.doctorName}</span></td>
                      <td><span className="adm-cell-mono">{new Date(adm.admissionDate).toLocaleDateString('fr-FR')}</span></td>
                      <td>
                        <span className="adm-cell-mono">
                          {adm.expectedDischargeDate ? new Date(adm.expectedDischargeDate).toLocaleDateString('fr-FR') : '—'}
                        </span>
                      </td>
                      <td>
                        <span className="adm-cell-mono adm-text-truncate" style={{ maxWidth: '140px', display: 'block' }}>
                          {adm.reason}
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

      {/* Bed occupation */}
      <div className="adm-card">
        <div className="adm-card-head">
          <p className="adm-card-title">Occupation des lits par service</p>
        </div>
        <div className="adm-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {departments.map((dep) => {
              const pct = Math.round((dep.occupiedBeds / dep.beds) * 100);
              const tagCls = pct >= 90 ? 'adm-t-red' : pct >= 70 ? 'adm-t-amber' : 'adm-t-green';
              const fillCls = pct >= 90 ? 'adm-pf-red' : pct >= 70 ? 'adm-pf-amber' : 'adm-pf-green';
              return (
                <div key={dep.id} style={{ border: '1px solid var(--c-bdr)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <p className="adm-cell-name adm-text-truncate" style={{ flex: 1, paddingRight: '6px' }}>{dep.name}</p>
                    <span className={`adm-tag ${tagCls}`}>{pct}%</span>
                  </div>
                  <div className="adm-progress" style={{ marginBottom: '6px' }}>
                    <div className={`adm-progress-fill ${fillCls}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="adm-cell-mono">{dep.occupiedBeds} / {dep.beds} lits</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
