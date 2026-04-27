import { ArrowLeft, Printer, CheckCircle2, Receipt } from 'lucide-react';
import Badge, { statusBadge } from '../../components/ui/Badge';
import { invoices, patients } from '../../services/mockData';
import { useNavigation } from '../../context/NavigationContext';

export default function InvoiceDetail() {
  const { navigate, nav } = useNavigation();
  const invoice = invoices.find((i) => i.id === nav.selectedId);
  if (!invoice) return <p style={{ color: 'var(--c-t2)' }}>Facture introuvable.</p>;

  const patient = patients.find((p) => p.id === invoice.patientId);
  const { variant, label } = statusBadge(invoice.status);
  const balance = invoice.total - invoice.paid;

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => navigate('billing')} className="adm-back-btn"><ArrowLeft size={16} /></button>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--c-t0)', margin: 0 }}>{invoice.invoiceNumber}</p>
          <p style={{ fontSize: '12px', color: 'var(--c-t2)', margin: '2px 0 0' }}>Détail de la facture</p>
        </div>
        <button className="adm-btn"><Printer size={13} /> Imprimer</button>
        {invoice.status !== 'paid' && (
          <button className="adm-btn" style={{ background: 'var(--c-green)', color: '#fff', borderColor: 'var(--c-green)' }}>
            <CheckCircle2 size={13} /> Marquer payée
          </button>
        )}
      </div>

      <div className="adm-card" style={{ overflow: 'hidden' }}>
        {/* Header gradient */}
        <div className="adm-invoice-hdr">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Receipt size={18} />
                <span style={{ fontWeight: 700, fontSize: '15px' }}>HôpitalGH</span>
              </div>
              <p style={{ fontSize: '12px', opacity: 0.8, margin: 0 }}>Système de gestion hospitalière</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '15px', margin: '0 0 4px' }}>
                {invoice.invoiceNumber}
              </p>
              <p style={{ fontSize: '12px', opacity: 0.8, margin: '0 0 8px' }}>
                Émise le {new Date(invoice.date).toLocaleDateString('fr-FR')}
              </p>
              <Badge variant={variant}>{label}</Badge>
            </div>
          </div>
        </div>

        <div className="adm-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <p className="adm-sec-h">Facturé à</p>
              <p className="adm-cell-name" style={{ fontSize: '13px', marginBottom: '4px' }}>{invoice.patientName}</p>
              {patient && (
                <>
                  <p className="adm-cell-mono">{patient.phone}</p>
                  <p className="adm-cell-mono">{patient.city}</p>
                  {patient.insurance && <p className="adm-cell-mono">Assurance: {patient.insurance}</p>}
                  {patient.insuranceNumber && <p className="adm-cell-mono">{patient.insuranceNumber}</p>}
                </>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <p className="adm-sec-h">Détails</p>
              <p className="adm-cell-mono" style={{ textAlign: 'right', marginBottom: '3px' }}>
                Date: <strong style={{ color: 'var(--c-t0)', fontWeight: 600 }}>{new Date(invoice.date).toLocaleDateString('fr-FR')}</strong>
              </p>
              <p className="adm-cell-mono" style={{ textAlign: 'right', marginBottom: '3px' }}>
                Échéance: <strong style={{ color: invoice.status === 'overdue' ? 'var(--c-red)' : 'var(--c-t0)', fontWeight: 600 }}>
                  {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                </strong>
              </p>
              {invoice.paymentMethod && (
                <p className="adm-cell-mono" style={{ textAlign: 'right' }}>
                  Paiement: <strong style={{ color: 'var(--c-t0)', fontWeight: 600 }}>{invoice.paymentMethod}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Items table */}
          <div style={{ border: '1px solid var(--c-bdr)', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style={{ textAlign: 'center' }}>Qté</th>
                  <th style={{ textAlign: 'right' }}>Prix unit.</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td style={{ color: 'var(--c-t1)' }}>{item.description}</td>
                    <td style={{ textAlign: 'center', color: 'var(--c-t2)' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right', color: 'var(--c-t2)' }}>{item.unitPrice.toLocaleString('fr-FR')} GNF</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--c-t0)' }}>{item.total.toLocaleString('fr-FR')} GNF</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '256px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span className="adm-cell-mono" style={{ color: 'var(--c-t2)' }}>Sous-total</span>
                <span className="adm-cell-name" style={{ fontWeight: 500 }}>{invoice.subtotal.toLocaleString('fr-FR')} GNF</span>
              </div>
              {invoice.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span className="adm-cell-mono" style={{ color: 'var(--c-green)' }}>Remise</span>
                  <span style={{ fontSize: '12px', color: 'var(--c-green)' }}>-{invoice.discount.toLocaleString('fr-FR')} GNF</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--c-bdr)', paddingTop: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--c-t0)' }}>Total</span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--c-t0)' }}>{invoice.total.toLocaleString('fr-FR')} GNF</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span className="adm-cell-mono" style={{ color: 'var(--c-green)' }}>Montant payé</span>
                <span style={{ fontSize: '12px', color: 'var(--c-green)', fontWeight: 600 }}>{invoice.paid.toLocaleString('fr-FR')} GNF</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--c-bdr)', paddingTop: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: balance > 0 ? 'var(--c-red)' : 'var(--c-green)' }}>Solde restant</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: balance > 0 ? 'var(--c-red)' : 'var(--c-green)' }}>{balance.toLocaleString('fr-FR')} GNF</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--c-bdr)' }}>
              <p className="adm-sec-h">Notes</p>
              <p className="adm-cell-mono" style={{ fontSize: '12px', color: 'var(--c-t1)' }}>{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
