import { useState, useEffect } from 'react';
import { Search, Eye, Loader2 } from 'lucide-react';
import { useNavigation } from '../../../context/NavigationContext';
import client from '../../../services/clients';

interface Facture {
  id: string;
  numeroFacture: string;
  patientId: string;
  patientNom: string;
  patientPrenom: string;
  montantTotal: number;
  statut: 'Émise' | 'Payée' | 'Annulée';
  createdAt: string;
}

const STATUT_STYLE: Record<string, { bg: string; color: string }> = {
  'Émise':   { bg: '#fef3c7', color: '#92400e' },
  'Payée':   { bg: '#dcfce7', color: '#166534' },
  'Annulée': { bg: '#fee2e2', color: '#991b1b' },
};

export default function InvoiceList() {
  const { navigate } = useNavigation();
  const [factures,  setFactures]  = useState<Facture[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [erreur,    setErreur]    = useState<string | null>(null);
  const [search,    setSearch]    = useState('');
  const [filtre,    setFiltre]    = useState('');

  useEffect(() => {
    client.get<Facture[]>('/facturation/factures')
      .then(r => setFactures(r.data))
      .catch(() => setErreur('Impossible de charger les factures.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = factures.filter(f => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      f.numeroFacture.toLowerCase().includes(q) ||
      f.patientNom.toLowerCase().includes(q) ||
      f.patientPrenom.toLowerCase().includes(q);
    const matchStatut = !filtre || f.statut === filtre;
    return matchSearch && matchStatut;
  });

  const totalEmis  = factures.reduce((s, f) => s + Number(f.montantTotal), 0);
  const totalPaye  = factures.filter(f => f.statut === 'Payée').reduce((s, f) => s + Number(f.montantTotal), 0);
  const totalAttente = factures.filter(f => f.statut === 'Émise').reduce((s, f) => s + Number(f.montantTotal), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Total facturé', value: totalEmis,    kpi: '' },
          { label: 'Encaissé',      value: totalPaye,    kpi: 'adm-kpi-green' },
          { label: 'En attente',    value: totalAttente, kpi: 'adm-kpi-orange' },
        ].map(s => (
          <div key={s.label} className={`adm-kpi ${s.kpi}`}>
            <p className="adm-kpi-lbl">{s.label}</p>
            <div className="adm-kpi-val" style={{ fontSize: 22 }}>
              {loading ? '…' : (s.value / 1000).toFixed(0) + 'K'}
            </div>
            <p className="adm-kpi-note adm-note-neutral">FCFA</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="adm-card">
        <div className="adm-card-head" style={{ gap: 10, flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8, flex: 1, flexWrap: 'wrap' }}>
            <div className="adm-search" style={{ flex: 1, minWidth: 200, maxWidth: 300 }}>
              <span className="adm-search-icon"><Search size={14} /></span>
              <input type="text" placeholder="N° facture, patient…" value={search}
                onChange={e => setSearch(e.target.value)} className="adm-search-input" />
            </div>
            <select value={filtre} onChange={e => setFiltre(e.target.value)}
              className="adm-input" style={{ width: 'auto', padding: '6px 10px' }}>
              <option value="">Tous les statuts</option>
              <option value="Émise">Émise</option>
              <option value="Payée">Payée</option>
              <option value="Annulée">Annulée</option>
            </select>
          </div>
          <button onClick={() => navigate('billing-new')} className="adm-btn adm-btn-primary">
            + Nouvelle facture
          </button>
        </div>

        {erreur && <div className="adm-alert adm-alert-error" style={{ margin: '0 16px 12px' }}>{erreur}</div>}

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 32, color: 'var(--c-t3)', justifyContent: 'center' }}>
            <Loader2 size={18} style={{ animation: 'spin 0.7s linear infinite' }} /> Chargement…
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>N° Facture</th>
                  <th>Patient</th>
                  <th>Date d'émission</th>
                  <th style={{ textAlign: 'right' }}>Montant</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--c-t3)' }}>
                    Aucune facture trouvée.
                  </td></tr>
                ) : filtered.map(f => {
                  const st = STATUT_STYLE[f.statut] ?? { bg: '#f1f5f9', color: '#64748b' };
                  return (
                    <tr key={f.id}>
                      <td>
                        <button onClick={() => navigate('billing-detail', f.patientId)} className="adm-link-btn"
                          style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11.5 }}>
                          {f.numeroFacture}
                        </button>
                      </td>
                      <td>
                        <button onClick={() => navigate('billing-detail', f.patientId)} className="adm-link-btn">
                          {f.patientPrenom} {f.patientNom}
                        </button>
                      </td>
                      <td><span className="adm-cell-mono">{new Date(f.createdAt).toLocaleDateString('fr-FR')}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="adm-cell-name">{Number(f.montantTotal).toLocaleString('fr-FR')}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 99, background: st.bg, color: st.color }}>
                          {f.statut}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => navigate('billing-detail', f.patientId)} className="adm-act">
                          <Eye size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="adm-card-footer">
          <span style={{ fontSize: 12, color: 'var(--c-t2)' }}>{filtered.length} facture{filtered.length > 1 ? 's' : ''}</span>
          <span style={{ fontSize: 12, color: 'var(--c-t2)' }}>
            Total affiché : {filtered.reduce((s, f) => s + Number(f.montantTotal), 0).toLocaleString('fr-FR')} FCFA
          </span>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}