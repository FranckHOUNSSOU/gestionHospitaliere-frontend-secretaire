import './PatientDetail.css';
import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard as Edit2, Phone, Mail, MapPin, AlertTriangle, Plus, Loader2 } from 'lucide-react';
import Badge, { statusBadge } from '../../../components/ui/Badge/Badge';
import { getPatient } from '../../../services/getPatient';
import { getDossier } from '../../../services/getDossier';
import { getRendezVous } from '../../../services/getRendezVous';
import { getFacture } from '../../../services/getFacture';
import { useNavigation } from '../../../context/NavigationContext';
import { InfoRow } from './InfoRow';

const tabs = ['Aperçu', 'Rendez-vous', 'Séjours', 'Factures'];

export default function PatientDetail() {
  const { navigate, nav } = useNavigation();
  const patId = nav.selectedId ?? '';
  const [activeTab, setActiveTab] = useState(0);

  const [patient,  setPatient]  = useState(null as any);
  const [dossier,  setDossier]  = useState(null as any);
  const [rdvList,  setRdvList]  = useState<any[]>([]);
  const [factures, setFactures] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!patId) return;
    Promise.all([
      getPatient.findOne(patId),
      getDossier.getDossier(patId),
      getRendezVous.getRendezVous(),
      getFacture.getApercuFacture(patId),
    ]).then(([p, d, rdv, inv]: [any, any, any[], any]) => {
      setPatient(p);
      setDossier(d);
      setRdvList((rdv ?? []).filter((a: any) => a.patientId === patId || a.patient?.id === patId) as any);
      setFactures((Array.isArray(inv) ? inv : inv?.factures ?? []) as any);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [patId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', gap: '10px', color: 'var(--c-t3)', fontSize: '13px' }}>
        <Loader2 size={18} style={{ animation: 'spin 0.7s linear infinite' }} />
        Chargement du dossier…
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!patient) {
    return <p style={{ color: 'var(--c-t2)', padding: '24px' }}>Patient introuvable.</p>;
  }

  const prenom  = patient.prenom   ?? patient.firstName ?? '';
  const nom     = patient.nom      ?? patient.lastName  ?? '';
  const dob     = patient.dateNaissance ?? patient.dateOfBirth ?? '';
  const sexe    = patient.sexe     ?? patient.genre ?? patient.gender ?? '';
  const groupe  = patient.groupeSanguin ?? patient.bloodType ?? '—';
  const statut  = patient.statutProfil  ?? patient.status ?? 'active';
  const tel     = patient.telephoneMobile ?? patient.telephone ?? patient.phone ?? '—';
  const email   = patient.email ?? '';
  const ville   = patient.ville ?? patient.city ?? '';
  const adresse = patient.adresse ?? patient.address ?? '';
  const createdAt = patient.createdAt ?? patient.registrationDate ?? '';
  const notes   = patient.notes ?? '';

  const age = dob ? new Date().getFullYear() - new Date(dob).getFullYear() : null;
  const { variant, label } = statusBadge(statut);

  const sejours = dossier?.sejours ?? [];

  const contacts   = dossier?.contacts   ?? [];
  const couvertures = dossier?.couvertures ?? [];
  const urgence    = contacts.find((c: any) => c.typeContact === 'Urgence' || c.lien) ?? null;
  const assurance  = couvertures[0] ?? null;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => navigate('patients')} className="adm-back-btn"><ArrowLeft size={16} /></button>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--c-t0)', margin: 0 }}>Dossier patient</p>
          <p style={{ fontSize: '12px', color: 'var(--c-t2)', margin: '2px 0 0' }}>Informations complètes et historique</p>
        </div>
        <button onClick={() => navigate('patient-edit', patId)} className="adm-btn">
          <Edit2 size={13} /> Modifier
        </button>
        <button onClick={() => navigate('appointment-new')} className="adm-btn adm-btn-primary">
          <Plus size={13} /> Nouveau RDV
        </button>
      </div>

      <div className="adm-card">
        <div className="adm-card-body">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
            <div className="adm-avatar-lg" style={{ background: 'linear-gradient(135deg,#60a5fa,#06b6d4)' }}>
              {prenom[0]}{nom[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <span style={{ fontSize: '17px', fontWeight: 700, color: 'var(--c-t0)' }}>{prenom} {nom}</span>
                <Badge variant={variant}>{label}</Badge>
                {groupe !== '—' && <span className="adm-tag adm-t-gray">Groupe {groupe}</span>}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--c-t2)', marginBottom: '8px' }}>
                {age ? `${age} ans · ` : ''}{sexe === 'M' ? 'Masculin' : sexe === 'F' ? 'Féminin' : sexe}
                {createdAt ? ` · Enregistré le ${new Date(createdAt).toLocaleDateString('fr-FR')}` : ''}
              </p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {tel !== '—' && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--c-t2)' }}>
                    <Phone size={13} />{tel}
                  </span>
                )}
                {email && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--c-t2)' }}>
                    <Mail size={13} />{email}
                  </span>
                )}
                {ville && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--c-t2)' }}>
                    <MapPin size={13} />{ville}
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', flexShrink: 0 }}>
              {[
                { label: 'RDV',     value: rdvList.length,   color: 'var(--c-accent)', bg: 'var(--c-accent-bg)' },
                { label: 'Séjours', value: sejours.length,   color: 'var(--c-amber)',  bg: 'var(--c-amber-bg)' },
                { label: 'Factures',value: factures.length,  color: 'var(--c-green)',  bg: 'var(--c-green-bg)' },
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
                {dob && <InfoRow label="Date de naissance" value={new Date(dob).toLocaleDateString('fr-FR')} />}
                <InfoRow label="Sexe"          value={sexe === 'M' ? 'Masculin' : sexe === 'F' ? 'Féminin' : '—'} />
                <InfoRow label="Groupe sanguin" value={groupe} />
                <InfoRow label="Ville"          value={ville || '—'} />
                <InfoRow label="Adresse"        value={adresse || '—'} />
              </div>
              <div>
                <p className="adm-sec-h">Contact</p>
                <InfoRow label="Téléphone" value={tel} />
                <InfoRow label="Email"     value={email || '—'} />
                {urgence && (
                  <>
                    <p className="adm-sec-h" style={{ marginTop: '16px' }}>Contact d'urgence</p>
                    <InfoRow label="Nom"      value={urgence.nom ?? urgence.nomComplet ?? '—'} />
                    <InfoRow label="Téléphone" value={urgence.telephone ?? '—'} />
                    <InfoRow label="Lien"     value={urgence.lien ?? '—'} />
                  </>
                )}
              </div>
              <div>
                {assurance && (
                  <>
                    <p className="adm-sec-h">Assurance</p>
                    <InfoRow label="Organisme"  value={assurance.organisme ?? assurance.typeAssurance ?? '—'} />
                    <InfoRow label="N° police"  value={assurance.numero ?? assurance.numeroPolice ?? '—'} />
                    {assurance.dateExpiration && (
                      <InfoRow label="Expiration" value={new Date(assurance.dateExpiration).toLocaleDateString('fr-FR')} />
                    )}
                  </>
                )}
                {notes && (
                  <div style={{ marginTop: assurance ? '16px' : 0 }}>
                    <p className="adm-sec-h">Notes</p>
                    <div className="adm-alert adm-alert-warning">
                      <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: '1px' }} />
                      <p style={{ margin: 0, fontSize: '12px' }}>{notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {rdvList.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--c-t3)', padding: '24px 0' }}>Aucun rendez-vous</p>
              ) : (
                (rdvList as any[]).map((appt: any) => {
                  const dateHeure = appt.dateHeure ?? appt.date ?? '';
                  const heure     = dateHeure ? dateHeure.slice(11, 16) : appt.time ?? '—';
                  const dateStr   = dateHeure ? new Date(dateHeure).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—';
                  const { variant: v, label: l } = statusBadge(appt.statut ?? appt.status ?? '');
                  return (
                    <div key={appt.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: 'var(--c-surf2)', borderRadius: '8px', border: '1px solid var(--c-bdr)' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '8px', background: 'var(--c-accent-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--c-accent)', lineHeight: 1 }}>{heure}</span>
                        <span style={{ fontSize: '9px', color: 'var(--c-t3)', marginTop: '2px' }}>{dateStr}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p className="adm-cell-name">{appt.type ?? appt.typeConsultation} · {appt.department ?? appt.service?.nom ?? '—'}</p>
                        <p className="adm-cell-mono">{appt.doctorName ?? appt.medecin?.user?.prenom ?? ''} {appt.medecin?.user?.nom ?? ''}</p>
                      </div>
                      <Badge variant={v}>{l}</Badge>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sejours.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--c-t3)', padding: '24px 0' }}>Aucun séjour</p>
              ) : (
                sejours.map((s: any) => {
                  const { variant: v, label: l } = statusBadge(s.dateSortie ? 'discharged' : 'active');
                  const mvt = s.mouvements?.[s.mouvements.length - 1];
                  return (
                    <div key={s.id} style={{ padding: '12px', background: 'var(--c-surf2)', borderRadius: '8px', border: '1px solid var(--c-bdr)' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div>
                          <p className="adm-cell-name">{s.motifHospitalisation ?? s.modeEntree ?? '—'}</p>
                          <p className="adm-cell-mono">
                            {mvt?.serviceArrivee ?? '—'} · Salle {mvt?.numeroChambre ?? '—'}, Lit {mvt?.numeroLit ?? '—'}
                          </p>
                        </div>
                        <Badge variant={v}>{l}</Badge>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {s.dateAdmission && <span className="adm-cell-mono">Entrée : {new Date(s.dateAdmission).toLocaleDateString('fr-FR')}</span>}
                        {s.dateSortie    && <span className="adm-cell-mono">Sortie : {new Date(s.dateSortie).toLocaleDateString('fr-FR')}</span>}
                        {s.medecinResponsable?.user && (
                          <span className="adm-cell-mono">
                            Dr. {s.medecinResponsable.user.prenom} {s.medecinResponsable.user.nom}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {factures.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--c-t3)', padding: '24px 0' }}>Aucune facture</p>
              ) : (
                (factures as any[]).map((inv: any) => {
                  const { variant: v, label: l } = statusBadge(inv.statut ?? inv.status ?? '');
                  return (
                    <div key={inv.id} onClick={() => navigate('billing-detail', inv.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: 'var(--c-surf2)', borderRadius: '8px', border: '1px solid var(--c-bdr)', cursor: 'pointer' }}>
                      <div style={{ flex: 1 }}>
                        <p className="adm-cell-name" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          {inv.numeroFacture ?? inv.invoiceNumber ?? inv.id}
                        </p>
                        <p className="adm-cell-mono">
                          Émise le {inv.dateEmission ?? inv.date ? new Date(inv.dateEmission ?? inv.date).toLocaleDateString('fr-FR') : '—'}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p className="adm-cell-name">{((inv.montantTotal ?? inv.total ?? 0)).toLocaleString('fr-FR')} GNF</p>
                        <p className="adm-cell-mono">Payé : {((inv.montantPaye ?? inv.paid ?? 0)).toLocaleString('fr-FR')} GNF</p>
                      </div>
                      <Badge variant={v}>{l}</Badge>
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
