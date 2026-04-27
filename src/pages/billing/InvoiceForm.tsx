import { useState } from 'react';
import { ArrowLeft, Save, Plus, Trash2, Receipt } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { patients, admissions } from '../../services/mockData';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

const serviceCategories = [
  { label: 'Consultation médecin',       price: 50000 },
  { label: 'Consultation spécialiste',   price: 75000 },
  { label: 'Chambre standard (par jour)',price: 20000 },
  { label: 'Chambre privée (par jour)',  price: 35000 },
  { label: "Salle d'opération",          price: 200000 },
  { label: "Frais d'admission",          price: 50000 },
  { label: 'Examens biologiques',        price: 45000 },
  { label: 'Radiologie (radio)',         price: 40000 },
  { label: 'Radiologie (scanner)',       price: 80000 },
  { label: 'Radiologie (IRM)',           price: 150000 },
  { label: 'Médicaments',               price: 25000 },
  { label: 'Soins infirmiers',           price: 15000 },
  { label: 'Kinésithérapie (séance)',    price: 20000 },
  { label: 'Autre',                      price: 0 },
];

export default function InvoiceForm() {
  const { navigate } = useNavigation();
  const [form, setForm] = useState({
    patientId: '', admissionId: '', dueDate: '', paymentMethod: '', notes: '', discount: 0,
  });
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0 },
  ]);
  const [saved, setSaved] = useState(false);

  const selectedPatient = patients.find((p) => p.id === form.patientId);
  const patientAdmissions = admissions.filter((a) => a.patientId === form.patientId && a.status === 'active');

  function addItem() {
    setItems((prev) => [...prev, { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 }]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateItem(id: string, field: keyof LineItem, value: string | number) {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, [field]: value } : item));
  }

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const total = subtotal - form.discount;

  function handleSave() {
    setSaved(true);
    setTimeout(() => navigate('billing'), 1000);
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => navigate('billing')} className="adm-back-btn"><ArrowLeft size={16} /></button>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--c-t0)', margin: 0 }}>Nouvelle facture</p>
          <p style={{ fontSize: '12px', color: 'var(--c-t2)', margin: '2px 0 0' }}>Créer une facture pour un patient</p>
        </div>
      </div>

      {saved && (
        <div className="adm-alert adm-alert-success">
          <Receipt size={14} style={{ flexShrink: 0 }} />
          Facture créée avec succès !
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '14px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Informations de facturation */}
          <div className="adm-form-section">
            <div className="adm-form-section-head">
              <p className="adm-card-title">Informations de facturation</p>
            </div>
            <div className="adm-form-section-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="adm-form-field">
                <label className="adm-label">Patient *</label>
                <select value={form.patientId}
                  onChange={(e) => setForm((f) => ({ ...f, patientId: e.target.value, admissionId: '' }))}
                  className="adm-input">
                  <option value="">Sélectionner un patient</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                  ))}
                </select>
              </div>
              {form.patientId && patientAdmissions.length > 0 && (
                <div className="adm-form-field">
                  <label className="adm-label">Lier à une admission</label>
                  <select value={form.admissionId}
                    onChange={(e) => setForm((f) => ({ ...f, admissionId: e.target.value }))}
                    className="adm-input">
                    <option value="">Aucune admission</option>
                    {patientAdmissions.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.department} — {a.room} (entrée: {new Date(a.admissionDate).toLocaleDateString('fr-FR')})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="adm-form-grid adm-form-grid-2">
                <div className="adm-form-field">
                  <label className="adm-label">Date d'échéance</label>
                  <input type="date" value={form.dueDate}
                    onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                    className="adm-input" />
                </div>
                <div className="adm-form-field">
                  <label className="adm-label">Mode de paiement</label>
                  <select value={form.paymentMethod}
                    onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value }))}
                    className="adm-input">
                    <option value="">Sélectionner</option>
                    <option value="cash">Espèces</option>
                    <option value="card">Carte bancaire</option>
                    <option value="insurance">Assurance</option>
                    <option value="transfer">Virement</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Lignes de facturation */}
          <div className="adm-form-section">
            <div className="adm-form-section-head" style={{ justifyContent: 'space-between' }}>
              <p className="adm-card-title">Lignes de facturation</p>
              <button onClick={addItem} className="adm-btn adm-btn-primary" style={{ height: '28px', fontSize: '11.5px' }}>
                <Plus size={12} /> Ajouter
              </button>
            </div>
            <div className="adm-form-section-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {items.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', padding: '10px 12px', background: 'var(--c-surf2)', borderRadius: '8px', border: '1px solid var(--c-bdr)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1.2fr', gap: '8px', flex: 1 }}>
                    <div className="adm-form-field">
                      <label className="adm-label">Description</label>
                      <input type="text" value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        list={`presets-${item.id}`}
                        className="adm-input" placeholder="Prestation..." />
                      <datalist id={`presets-${item.id}`}>
                        {serviceCategories.map((p) => <option key={p.label} value={p.label} />)}
                      </datalist>
                    </div>
                    <div className="adm-form-field">
                      <label className="adm-label">Qté</label>
                      <input type="number" min="1" value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        className="adm-input" />
                    </div>
                    <div className="adm-form-field">
                      <label className="adm-label">Prix unitaire</label>
                      <input type="number" min="0" value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseInt(e.target.value) || 0)}
                        className="adm-input" />
                    </div>
                    <div className="adm-form-field">
                      <label className="adm-label">Total</label>
                      <div className="adm-input adm-input--ro" style={{ textAlign: 'right', fontWeight: 600 }}>
                        {(item.quantity * item.unitPrice).toLocaleString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.id)} disabled={items.length === 1}
                    className="adm-act adm-act-danger" style={{ marginBottom: '0', height: '34px', width: '34px', justifyContent: 'center' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}

              <div style={{ marginTop: '8px', paddingTop: '10px', borderTop: '1px solid var(--c-bdr)' }}>
                <div style={{ marginLeft: 'auto', maxWidth: '280px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div className="adm-summary-row">
                    <span className="adm-summary-k">Sous-total</span>
                    <span className="adm-summary-v">{subtotal.toLocaleString('fr-FR')} GNF</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px' }}>
                    <span style={{ color: 'var(--c-t2)' }}>Remise</span>
                    <input type="number" min="0" value={form.discount}
                      onChange={(e) => setForm((f) => ({ ...f, discount: parseInt(e.target.value) || 0 }))}
                      className="adm-input" style={{ width: '110px', textAlign: 'right', padding: '5px 8px' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--c-bdr)', paddingTop: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--c-t0)' }}>TOTAL</span>
                    <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--c-accent)' }}>{total.toLocaleString('fr-FR')} GNF</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="adm-form-section">
            <div className="adm-form-section-head">
              <p className="adm-card-title">Notes</p>
            </div>
            <div className="adm-form-section-body">
              <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={3} className="adm-input"
                placeholder="Informations complémentaires, modalités de paiement..." />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {selectedPatient && (
            <div style={{ background: 'var(--c-accent-bg)', border: '1px solid var(--c-accent-bd)', borderRadius: '10px', padding: '14px' }}>
              <p className="adm-sec-h" style={{ color: 'var(--c-accent)' }}>Patient</p>
              <p className="adm-cell-name" style={{ color: 'var(--c-accent)', fontSize: '13px' }}>
                {selectedPatient.firstName} {selectedPatient.lastName}
              </p>
              <p className="adm-cell-mono" style={{ color: 'var(--c-accent)' }}>{selectedPatient.insurance || 'Non assuré'}</p>
              <p className="adm-cell-mono" style={{ color: 'var(--c-accent)' }}>{selectedPatient.phone}</p>
            </div>
          )}

          <div className="adm-card">
            <div className="adm-card-head">
              <p className="adm-card-title">Résumé</p>
            </div>
            <div className="adm-card-body">
              {[
                { label: 'Lignes',    value: `${items.length}` },
                { label: 'Sous-total', value: `${subtotal.toLocaleString('fr-FR')} GNF` },
                ...(form.discount > 0 ? [{ label: 'Remise', value: `-${form.discount.toLocaleString('fr-FR')} GNF` }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="adm-summary-row">
                  <span className="adm-summary-k">{label}</span>
                  <span className="adm-summary-v">{value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--c-bdr)', paddingTop: '8px', marginTop: '4px' }}>
                <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--c-t0)' }}>Total</span>
                <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--c-accent)' }}>{total.toLocaleString('fr-FR')} GNF</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={handleSave} className="adm-btn adm-btn-primary" style={{ height: '38px', justifyContent: 'center', gap: '6px' }}>
              <Save size={14} /> Créer la facture
            </button>
            <button onClick={() => navigate('billing')} className="adm-btn" style={{ height: '38px', justifyContent: 'center' }}>
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
