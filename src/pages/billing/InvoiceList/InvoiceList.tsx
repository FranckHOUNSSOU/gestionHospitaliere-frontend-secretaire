import { useState } from 'react';
import { Plus, Search, Eye, Download } from 'lucide-react';
import Badge, { statusBadge } from '../../../components/ui/Badge/Badge';
import { invoices } from '../../../services/mockData';
import { useNavigation } from '../../../context/NavigationContext';
import type { InvoiceStatus } from '../../../types/index';

export default function InvoiceList() {
  const { navigate } = useNavigation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase();
    const matchSearch = inv.patientName.toLowerCase().includes(q) || inv.invoiceNumber.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = invoices.reduce((s, i) => s + i.total, 0);
  const totalPaid    = invoices.reduce((s, i) => s + i.paid, 0);
  const totalPending = invoices.filter((i) => i.status === 'pending' || i.status === 'partial').reduce((s, i) => s + (i.total - i.paid), 0);
  const totalOverdue = invoices.filter((i) => i.status === 'overdue').reduce((s, i) => s + i.total, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {[
          { label: 'Total facturé', value: totalRevenue,  kpi: '' },
          { label: 'Encaissé',      value: totalPaid,     kpi: 'adm-kpi-green' },
          { label: 'En attente',    value: totalPending,  kpi: 'adm-kpi-orange' },
          { label: 'En retard',     value: totalOverdue,  kpi: 'adm-kpi-danger' },
        ].map((s) => (
          <div key={s.label} className={`adm-kpi ${s.kpi}`}>
            <p className="adm-kpi-lbl">{s.label}</p>
            <div className="adm-kpi-val" style={{ fontSize: '22px' }}>{(s.value / 1000).toFixed(0)}K</div>
            <p className="adm-kpi-note adm-note-neutral">GNF</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="adm-card">
        {/* Filters */}
        <div className="adm-card-head" style={{ gap: '10px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '8px', flex: 1, flexWrap: 'wrap' }}>
            <div className="adm-search" style={{ flex: 1, minWidth: '200px', maxWidth: '300px' }}>
              <span className="adm-search-icon"><Search size={14} /></span>
              <input type="text" placeholder="N° facture, patient..." value={search}
                onChange={(e) => setSearch(e.target.value)} className="adm-search-input" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'all')}
              className="adm-input" style={{ width: 'auto', padding: '6px 10px' }}>
              <option value="all">Tous les statuts</option>
              <option value="draft">Brouillon</option>
              <option value="pending">En attente</option>
              <option value="partial">Partielle</option>
              <option value="paid">Payée</option>
              <option value="overdue">En retard</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            <button className="adm-btn"><Download size={13} /> Exporter</button>
            <button onClick={() => navigate('billing-new')} className="adm-btn adm-btn-primary">
              <Plus size={13} /> Nouvelle facture
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>N° Facture</th>
                <th>Patient</th>
                <th>Date</th>
                <th>Échéance</th>
                <th style={{ textAlign: 'right' }}>Montant</th>
                <th style={{ textAlign: 'right' }}>Payé</th>
                <th style={{ textAlign: 'right' }}>Solde</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: 'var(--c-t3)' }}>Aucune facture trouvée</td></tr>
              ) : (
                filtered.map((inv) => {
                  const { variant, label } = statusBadge(inv.status);
                  const balance = inv.total - inv.paid;
                  return (
                    <tr key={inv.id}>
                      <td>
                        <button onClick={() => navigate('billing-detail', inv.id)} className="adm-link-btn"
                          style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11.5px' }}>
                          {inv.invoiceNumber}
                        </button>
                      </td>
                      <td>
                        <button onClick={() => navigate('patient-detail', inv.patientId)} className="adm-link-btn">
                          {inv.patientName}
                        </button>
                      </td>
                      <td><span className="adm-cell-mono">{new Date(inv.date).toLocaleDateString('fr-FR')}</span></td>
                      <td>
                        <span className="adm-cell-mono" style={{ color: inv.status === 'overdue' ? 'var(--c-red)' : undefined }}>
                          {new Date(inv.dueDate).toLocaleDateString('fr-FR')}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="adm-cell-name">{inv.total.toLocaleString('fr-FR')}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="adm-cell-mono" style={{ color: 'var(--c-green)', fontSize: '12px' }}>{inv.paid.toLocaleString('fr-FR')}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="adm-cell-mono" style={{ color: balance > 0 ? 'var(--c-red)' : 'var(--c-green)', fontSize: '12px' }}>
                          {balance.toLocaleString('fr-FR')}
                        </span>
                      </td>
                      <td><Badge variant={variant}>{label}</Badge></td>
                      <td>
                        <button onClick={() => navigate('billing-detail', inv.id)} className="adm-act">
                          <Eye size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="adm-card-footer">
          <span style={{ fontSize: '12px', color: 'var(--c-t2)' }}>{filtered.length} facture{filtered.length > 1 ? 's' : ''}</span>
          <span style={{ fontSize: '12px', color: 'var(--c-t2)' }}>
            Total affiché: {filtered.reduce((s, i) => s + i.total, 0).toLocaleString('fr-FR')} GNF
          </span>
        </div>
      </div>
    </div>
  );
}
