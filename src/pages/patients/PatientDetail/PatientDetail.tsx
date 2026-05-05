import './PatientDetail.css';
import { useState } from 'react';
import { ArrowLeft, CreditCard as Edit2, Phone, Mail, MapPin, AlertTriangle, Plus } from 'lucide-react';
import Badge, { statusBadge } from '../../../components/ui/Badge/Badge';
import { patients, appointments, admissions, invoices } from '../../../services/mockData';
import { useNavigation } from '../../../context/NavigationContext';
import { InfoRow } from './InfoRow';

const tabs = ['Aperçu', 'Rendez-vous', 'Admissions', 'Factures'];

export default function PatientDetail() {
  const { navigate, nav } = useNavigation();
  const [activeTab, setActiveTab] = useState(0);

  const patient = patients.find((p) => p.id === nav.selectedId);
  if (!patient) return <p style={{ color: 'var(--c-t2)' }}>Patient introuvable.</p>;

  const patientAppts = appointments.filter((a) => a.patientId === patient.id);
  const patientAdmissions = admissions.filter((a) => a.patientId === patient.id);
  const patientInvoices = invoices.filter((i) => i.patientId === patient.id);

  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
  const { variant, label } = statusBadge(patient.status);

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => navigate('patients')} className="adm-back-btn"><ArrowLeft size={16} /></button>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--c-t0)', margin: 0 }}>Dossier patient</p>
          <p style={{ fontSize: '12px', color: 'var(--c-t2)', margin: '2px 0 0' }}>Informations complètes et historique</p>
        </div>
        <button onClick={() => navigate('patient-edit', patient.id)} className="adm-btn">
          <Edit2 size={13} /> Modifier
        </button>
        <button onClick={() => navigate('appointment-new')} className="adm-btn adm-btn-primary">
          <Plus size={13} /> Nouveau RDV
        </button>
      </div>

      {/* Patient card */}
      <div className="adm-card">
        <div className="adm-card-body">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
            <div className="adm-avatar-lg" style={{ background: 'linear-gradient(135deg,#60a5fa,#06b6d4)' }}>
              {patient.firstName[0]}{patient.lastName[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <span style={{ fontSize: '17px', fontWeight: 700, color: 'var(--c-t0)' }}>
                  {patient.firstName} {patient.lastName}
                </span>
                <Badge variant={variant}>{label}</Badge>
                <span className="adm-tag adm-t-gray">Groupe {patient.bloodType}</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--c-t2)', marginBottom: '8px' }}>
                {age} ans · {patient.gender === 'M' ? 'Masculin' : 'Féminin'} · Enregistré le {new Date(patient.registrationDate).toLocaleDateString('fr-FR')}
              </p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--c-t2)' }}>
                  <Phone size={13} />{patient.phone}
                </span>
                {patient.email && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--c-t2)' }}>
                    <Mail size={13} />{patient.email}
                  </span>
                )}
                {patient.city && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--c-t2)' }}>
                    <MapPin size={13} />{patient.city}
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', flexShrink: 0 }}>
              {[
                { label: 'RDV',      value: patientAppts.length,      color: 'var(--c-accent)', bg: 'var(--c-accent-bg)' },
                { label: 'Séjours',  value: patientAdmissions.length, color: 'var(--c-amber)',  bg: 'var(--c-amber-bg)' },
                { label: 'Factures', value: patientInvoices.length,   color: 'var(--c-green)',  bg: 'var(--c-green-bg)' },
              ].map((stat) => (
                <div key={stat.label} style={{ background: stat.bg, borderRadius: '8px', padding: '10px 14px', textAlign: 'center', minWidth: '64px' }}>
                  <p style={{ fontSize: '20px', fontWeight: 700, color: stat.color, margin: '0 0 2px' }}>{stat.value}</p>
                  <p style={{ fontSize: '10px', color: stat.color, margin: 0, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs + Content */}
      <div className="adm-card">
        <div className="adm-tabs">
          {tabs.map((tab, i) => (
            <button key={tab} className={`adm-tab${activeTab === i ? ' active' : ''}`} onClick={() => setActiveTab(i)}>
              {tab}
            </button>
          ))}
        </div>

        <div className="adm-card-body">
          {activeTab === 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <div>
                <p className="adm-sec-h">Informations personnelles</p>
                <InfoRow label="Date de naissance" value={new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')} />
                <InfoRow label="Sexe" value={patient.gender === 'M' ? 'Masculin' : 'Féminin'} />
                <InfoRow label="Groupe sanguin" value={patient.bloodType} />
                <InfoRow label="Ville" value={patient.city} />
                <InfoRow label="Adresse" value={patient.address} />
              </div>
              <div>
                <p className="adm-sec-h">Contact</p>
                <InfoRow label="Téléphone" value={patient.phone} />
                <InfoRow label="Email" value={patient.email || '—'} />
                <p className="adm-sec-h" style={{ marginTop: '16px' }}>Contact d'urgence</p>
                <InfoRow label="Nom" value={patient.emergencyContact} />
                <InfoRow label="Téléphone" value={patient.emergencyPhone} />
              </div>
              <div>
                <p className="adm-sec-h">Assurance</p>
                <InfoRow label="Organisme" value={patient.insurance || 'Non assuré'} />
                {patient.insuranceNumber && <InfoRow label="N° police" value={patient.insuranceNumber} />}
                {patient.notes && (
                  <div style={{ marginTop: '16px' }}>
                    <p className="adm-sec-h">Notes</p>
                    <div className="adm-alert adm-alert-warning">
                      <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: '1px' }} />
                      <p style={{ margin: 0, fontSize: '12px' }}>{patient.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {patientAppts.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--c-t3)', padding: '24px 0' }}>Aucun rendez-vous</p>
              ) : (
                patientAppts.map((appt) => {
                  const { variant, label } = statusBadge(appt.status);
                  return (
                    <div key={appt.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: 'var(--c-surf2)', borderRadius: '8px', border: '1px solid var(--c-bdr)' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '8px', background: 'var(--c-accent-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--c-accent)', lineHeight: 1 }}>{appt.time}</span>
                        <span style={{ fontSize: '9px', color: 'var(--c-t3)', marginTop: '2px' }}>
                          {new Date(appt.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p className="adm-cell-name">{appt.type} · {appt.department}</p>
                        <p className="adm-cell-mono">{appt.doctorName}</p>
                      </div>
                      <Badge variant={variant}>{label}</Badge>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {patientAdmissions.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--c-t3)', padding: '24px 0' }}>Aucune admission</p>
              ) : (
                patientAdmissions.map((adm) => {
                  const { variant, label } = statusBadge(adm.status);
                  return (
                    <div key={adm.id} style={{ padding: '12px', background: 'var(--c-surf2)', borderRadius: '8px', border: '1px solid var(--c-bdr)' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div>
                          <p className="adm-cell-name">{adm.reason}</p>
                          <p className="adm-cell-mono">{adm.department} · Salle {adm.room}, Lit {adm.bed}</p>
                        </div>
                        <Badge variant={variant}>{label}</Badge>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <span className="adm-cell-mono">Entrée: {new Date(adm.admissionDate).toLocaleDateString('fr-FR')}</span>
                        {adm.actualDischargeDate && <span className="adm-cell-mono">Sortie: {new Date(adm.actualDischargeDate).toLocaleDateString('fr-FR')}</span>}
                        <span className="adm-cell-mono">Dr. {adm.doctorName}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {patientInvoices.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--c-t3)', padding: '24px 0' }}>Aucune facture</p>
              ) : (
                patientInvoices.map((inv) => {
                  const { variant, label } = statusBadge(inv.status);
                  return (
                    <div key={inv.id} onClick={() => navigate('billing-detail', inv.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: 'var(--c-surf2)', borderRadius: '8px', border: '1px solid var(--c-bdr)', cursor: 'pointer' }}>
                      <div style={{ flex: 1 }}>
                        <p className="adm-cell-name" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{inv.invoiceNumber}</p>
                        <p className="adm-cell-mono">Émise le {new Date(inv.date).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p className="adm-cell-name">{inv.total.toLocaleString('fr-FR')} GNF</p>
                        <p className="adm-cell-mono">Payé: {inv.paid.toLocaleString('fr-FR')} GNF</p>
                      </div>
                      <Badge variant={variant}>{label}</Badge>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

