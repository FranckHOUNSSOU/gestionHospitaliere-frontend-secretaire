import { useState } from 'react';
import { Search, Plus, Eye, CreditCard as Edit2, Download, Users } from 'lucide-react';
import Badge, { statusBadge } from '../../../components/ui/Badge/Badge';
import { patients as allPatients } from '../../../services/mockData';
import { useNavigation } from '../../../context/NavigationContext';
import type { PatientStatus } from '../../../types/index';

const avatarColors = [
  { from: '#60a5fa', to: '#06b6d4' },
  { from: '#34d399', to: '#14b8a6' },
  { from: '#a78bfa', to: '#6366f1' },
  { from: '#f472b6', to: '#fb7185' },
  { from: '#fbbf24', to: '#f97316' },
];

function getAvatarGradient(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  const c = avatarColors[Math.abs(hash) % avatarColors.length];
  return `linear-gradient(135deg, ${c.from}, ${c.to})`;
}

function calcAge(dob: string) {
  return new Date().getFullYear() - new Date(dob).getFullYear();
}

export default function PatientList() {
  const { navigate } = useNavigation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PatientStatus | 'all'>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'M' | 'F'>('all');

  const filtered = allPatients.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.insuranceNumber.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchGender = genderFilter === 'all' || p.gender === genderFilter;
    return matchSearch && matchStatus && matchGender;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--c-accent-bg)', border: '1px solid var(--c-accent-bd)', borderRadius: '8px', padding: '6px 12px' }}>
          <Users size={16} style={{ color: 'var(--c-accent)' }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--c-accent)' }}>{allPatients.length} patients enregistrés</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="adm-btn"><Download size={13} /> Exporter</button>
          <button onClick={() => navigate('patient-new')} className="adm-btn adm-btn-primary">
            <Plus size={13} /> Nouveau patient
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="adm-card">
        {/* Filters */}
        <div className="adm-card-head" style={{ gap: '10px', flexWrap: 'wrap' }}>
          <div className="adm-search" style={{ flex: 1, minWidth: '200px' }}>
            <span className="adm-search-icon"><Search size={14} /></span>
            <input
              type="text"
              placeholder="Rechercher par nom, téléphone, n° d'assurance..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="adm-search-input"
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as PatientStatus | 'all')}
              className="adm-input" style={{ width: 'auto', padding: '6px 10px' }}>
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="hospitalized">Hospitalisé</option>
              <option value="discharged">Sorti</option>
            </select>
            <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value as 'all' | 'M' | 'F')}
              className="adm-input" style={{ width: 'auto', padding: '6px 10px' }}>
              <option value="all">Tous</option>
              <option value="M">Hommes</option>
              <option value="F">Femmes</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Âge / Sexe</th>
                <th>Contact</th>
                <th>Assurance</th>
                <th>Enregistré</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--c-t3)' }}>Aucun patient trouvé</td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const { variant, label } = statusBadge(p.status);
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="adm-avatar-sm" style={{ background: getAvatarGradient(p.id) }}>
                            {p.firstName[0]}{p.lastName[0]}
                          </div>
                          <div>
                            <p className="adm-cell-name">{p.lastName} {p.firstName}</p>
                            <p className="adm-cell-mono">Groupe {p.bloodType}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--c-t0)', fontSize: '12.5px' }}>{calcAge(p.dateOfBirth)} ans</span>
                        <span style={{ color: 'var(--c-t3)', fontSize: '12px', marginLeft: '4px' }}>{p.gender === 'M' ? 'H' : 'F'}</span>
                      </td>
                      <td><span className="adm-cell-mono" style={{ fontSize: '12px' }}>{p.phone}</span></td>
                      <td>
                        <p className="adm-cell-name" style={{ fontWeight: 400 }}>{p.insurance || '—'}</p>
                        {p.insuranceNumber && <p className="adm-cell-mono">{p.insuranceNumber}</p>}
                      </td>
                      <td><span className="adm-cell-mono">{new Date(p.registrationDate).toLocaleDateString('fr-FR')}</span></td>
                      <td><Badge variant={variant}>{label}</Badge></td>
                      <td>
                        <div className="adm-act-row" style={{ justifyContent: 'flex-end' }}>
                          <button onClick={() => navigate('patient-detail', p.id)} title="Voir le dossier" className="adm-act">
                            <Eye size={13} />
                          </button>
                          <button onClick={() => navigate('patient-edit', p.id)} title="Modifier" className="adm-act">
                            <Edit2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="adm-card-footer">
          <span style={{ fontSize: '12px', color: 'var(--c-t2)' }}>
            {filtered.length} résultat{filtered.length > 1 ? 's' : ''} sur {allPatients.length}
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button className="adm-btn" disabled>Précédent</button>
            <button className="adm-btn adm-btn-primary" style={{ minWidth: '32px' }}>1</button>
            <button className="adm-btn">Suivant</button>
          </div>
        </div>
      </div>
    </div>
  );
}
