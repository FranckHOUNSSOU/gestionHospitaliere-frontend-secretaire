import { useState, useEffect } from 'react';
import './DashboardAgent.css';
import { Users, CalendarDays, BedDouble, Receipt, ArrowRight, UserPlus } from 'lucide-react';
import StatCard from '../../components/ui/StatCard/StatCard';
import Badge, { statusBadge } from '../../components/ui/Badge/Badge';
import { invoices } from '../../services/mockData';
import { patientsData, type Patient } from '../../services/patients';
import { getRendezVous } from '../../services/appointmentService';
import type { Admission, Appointment } from '../../types/index';
import { useNavigation } from '../../context/NavigationContext';

function toAdmission(p: Patient): Admission | null {
  const sejours = p.sejours ?? [];
  if (sejours.length === 0) return null;
  const dernier    = sejours[sejours.length - 1];
  const dernierMvt = dernier.mouvements?.[dernier.mouvements.length - 1];
  return {
    id:            dernier.id,
    patientId:     p.id,
    patientName:   `${p.prenom} ${p.nom}`,
    admissionDate: dernier.dateAdmission,
    department:    dernierMvt?.serviceArrivee ?? dernier.modeEntree ?? '—',
    room:          dernierMvt?.numeroChambre  ?? '—',
    bed:           dernierMvt?.numeroLit      ?? '—',
    doctorId:      '',
    doctorName:    '—',
    reason:        dernier.motifHospitalisation ?? dernier.modeEntree ?? '—',
    status:        dernier.dateSortie ? 'discharged' : 'active',
    typeSejour:    (dernier as any).typeSejour ?? undefined,
  };
}

export default function DashboardAgent() {
  const { navigate } = useNavigation();

  const [allAdmissions,  setAllAdmissions]  = useState<Admission[]>([]);
  const [appointments,   setAppointments]   = useState<Appointment[]>([]);
  const [patientCount,   setPatientCount]   = useState(0);
  const [dataLoading,    setDataLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      patientsData.findAll(),
      getRendezVous().then(r => r.data),
    ]).then(([patients, appts]) => {
      setPatientCount(patients.length);
      const adms = patients
        .map(toAdmission)
        .filter((a): a is Admission => a !== null);
      setAllAdmissions(adms);
      setAppointments(appts);
    }).catch(() => {}).finally(() => setDataLoading(false));
  }, []);

  const today            = new Date().toISOString().slice(0, 10);
  const todayAppts       = appointments.filter((a) => a.date === today);
  const activeAdmissions = allAdmissions.filter((a) => a.status === 'active');
  const todayAdmissions  = allAdmissions.filter((a) => a.admissionDate && a.admissionDate.slice(0, 10) === today);
  const pendingInvoices  = invoices.filter((i) => i.status === 'pending' || i.status === 'overdue');
  const totalRevenue     = invoices.reduce((s, i) => s + i.paid, 0);

  const consultationsOubliees = allAdmissions.filter((a) =>
    a.status === 'active' &&
    a.typeSejour === 'Consultation' &&
    (Date.now() - new Date(a.admissionDate).getTime()) > 12 * 3_600_000,
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* KPI Cards */}
      <div className="adm-kpi-grid">
        <StatCard title="Patients enregistrés" value={dataLoading ? '…' : patientCount} subtitle="Total dans le système"
          icon={<Users size={18} />} color="blue" trend={{ value: '2 ce mois', up: true }} />
        <StatCard title="RDV aujourd'hui" value={dataLoading ? '…' : todayAppts.length}
          subtitle={`${todayAppts.filter((a) => a.status === 'confirmed').length} confirmés`}
          icon={<CalendarDays size={18} />} color="cyan" />
        <StatCard title="Admissions actives" value={dataLoading ? '…' : activeAdmissions.length} subtitle="Patients hospitalisés"
          icon={<BedDouble size={18} />} color="amber" />
        <StatCard title="Recettes (GNF)" value={`${(totalRevenue / 1000).toFixed(0)}K`}
          subtitle={`${pendingInvoices.length} factures en attente`}
          icon={<Receipt size={18} />} color="emerald" trend={{ value: '12% vs mois dernier', up: true }} />
      </div>

      {/* Consultations à vérifier */}
      {consultationsOubliees.length > 0 && (
        <div className="adm-card" style={{ borderLeft: '3px solid #f59e0b' }}>
          <div className="adm-card-head">
            <div>
              <p className="adm-card-title" style={{ color: '#92400e' }}>
                ⚠ Consultations — sortie non enregistrée
              </p>
              <p className="adm-card-sub">
                {consultationsOubliees.length} consultation{consultationsOubliees.length > 1 ? 's' : ''} ouverte{consultationsOubliees.length > 1 ? 's' : ''} depuis plus de 12h
              </p>
            </div>
          </div>
          <div style={{ padding: '0 0 8px' }}>
            {consultationsOubliees.map((adm) => {
              const heures = Math.floor((Date.now() - new Date(adm.admissionDate).getTime()) / 3_600_000);
              return (
                <div key={adm.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--c-bdr)' }}>
                  <div className="adm-avatar-sm" style={{ background: '#f59e0b', flexShrink: 0 }}>
                    {adm.patientName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--c-t0)' }}>{adm.patientName}</p>
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--c-t3)' }}>
                      Admis le {new Date(adm.admissionDate).toLocaleDateString('fr-FR')} — <strong style={{ color: '#92400e' }}>{heures}h sans sortie</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('admissions')}
                    className="adm-btn"
                    style={{ fontSize: 11, height: 28, borderColor: '#f59e0b', color: '#92400e' }}
                  >
                    Enregistrer la sortie <ArrowRight size={11} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rendez-vous du jour */}
      <div className="adm-card">
        <div className="adm-card-head">
          <div>
            <p className="adm-card-title">Rendez-vous du jour</p>
            <p className="adm-card-sub">{todayAppts.length} rendez-vous planifiés</p>
          </div>
          <button onClick={() => navigate('appointments')} className="adm-btn" style={{ gap: '4px' }}>
            Voir tout <ArrowRight size={13} />
          </button>
        </div>
        {dataLoading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--c-t3)', fontSize: '12px' }}>
            Chargement…
          </div>
        ) : todayAppts.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--c-t3)', fontSize: '12px' }}>
            Aucun rendez-vous aujourd'hui
          </div>
        ) : (
          todayAppts.map((appt) => {
            const { variant, label } = statusBadge(appt.status);
            return (
              <div key={appt.id} className="adm-list-row">
                <div style={{ width: 42, height: 42, borderRadius: '8px', background: 'var(--c-accent-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--c-accent)', lineHeight: 1 }}>{appt.time}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="adm-cell-name adm-text-truncate">{appt.patientName}</p>
                  <p className="adm-cell-mono">{appt.doctorName} · {appt.department}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <Badge variant={variant}>{label}</Badge>
                  <p className="adm-cell-mono" style={{ marginTop: '3px' }}>{appt.type}</p>
                </div>
              </div>
            );
          })
        )}
        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--c-bdr)' }}>
          <button onClick={() => navigate('appointment-new')} className="adm-btn" style={{ width: '100%', justifyContent: 'center', gap: '6px' }}>
            <UserPlus size={14} /> Ajouter un rendez-vous
          </button>
        </div>
      </div>

      {/* Admissions du jour */}
      <div className="adm-card">
        <div className="adm-card-head">
          <div>
            <p className="adm-card-title">Admissions du jour</p>
            <p className="adm-card-sub">{todayAdmissions.length} admission(s) aujourd'hui</p>
          </div>
          <button onClick={() => navigate('admissions')} className="adm-btn" style={{ gap: '4px' }}>
            Voir tout <ArrowRight size={13} />
          </button>
        </div>
        {dataLoading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--c-t3)', fontSize: '12px' }}>
            Chargement…
          </div>
        ) : todayAdmissions.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--c-t3)', fontSize: '12px' }}>
            Aucune admission aujourd'hui
          </div>
        ) : (
          todayAdmissions.map((adm) => (
            <div key={adm.id} className="adm-list-row">
              <div style={{ width: 42, height: 42, borderRadius: '8px', background: 'var(--c-accent-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--c-accent)', lineHeight: 1 }}>
                  {adm.admissionDate.slice(11, 16) || '--:--'}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="adm-cell-name adm-text-truncate">{adm.patientName}</p>
                <p className="adm-cell-mono">{adm.department} · Salle {adm.room} · Lit {adm.bed}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <Badge variant={statusBadge(adm.status).variant}>{statusBadge(adm.status).label}</Badge>
              </div>
            </div>
          ))
        )}
        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--c-bdr)' }}>
          <button onClick={() => navigate('admission-new')} className="adm-btn" style={{ width: '100%', justifyContent: 'center', gap: '6px' }}>
            <UserPlus size={14} /> Nouvelle admission
          </button>
        </div>
      </div>
    </div>
  );
}
