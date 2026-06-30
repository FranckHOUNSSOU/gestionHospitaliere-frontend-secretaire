import { HeartPulse, AlertTriangle, Pill, Phone, Building2, Stethoscope, Activity } from 'lucide-react';
import PatientFileModal from './PatientFileModal';
import PatientFileSyntheseSection from './PatientFileSyntheseSection';
import PatientFileSyntheseRow from './PatientFileSyntheseRow';
import PatientFileSyntheseItem from './PatientFileSyntheseItem';

export default function PatientFileModalSynthese({ dossier, sejour, diagList, soinsList, onClose }: {
  dossier: any; sejour: any; diagList: any[]; soinsList: any[]; onClose: () => void;
}) {
  const age = Math.floor((Date.now() - new Date(dossier.dateNaissance).getTime()) / (365.25 * 24 * 3600 * 1000));

  return (
    <PatientFileModal title={`Synthèse — ${dossier.prenom} ${dossier.nom}`} onClose={onClose}>

      <div style={{ background: 'var(--c-surf2)', borderRadius: 8, padding: '10px 12px', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 9, flexShrink: 0,
            background: dossier.sexe === 'F' ? 'linear-gradient(135deg,#f9a8d4,#ec4899)' : 'linear-gradient(135deg,#93c5fd,#3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff',
          }}>
            {dossier.prenom[0]}{dossier.nom[0]}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--c-t0)' }}>{dossier.prenom} {dossier.nom}</p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--c-t3)' }}>
              {dossier.numeroIpp} · {dossier.sexe === 'M' ? 'Masculin' : dossier.sexe === 'F' ? 'Féminin' : 'Autre'} · {age} ans
            </p>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
            background: dossier.statutProfil === 'Complet' ? '#dcfce7' : '#fef3c7',
            color: dossier.statutProfil === 'Complet' ? '#166534' : '#92400e',
          }}>
            {dossier.statutProfil}
          </span>
        </div>
        {sejour && (
          <p style={{ margin: '8px 0 0', fontSize: 10, color: '#1d4ed8', background: '#eff6ff', borderRadius: 5, padding: '3px 8px', display: 'inline-block' }}>
            Séjour actif · {sejour.numeroSejour} · Admis le {new Date(sejour.dateAdmission).toLocaleDateString('fr-FR')}
          </p>
        )}
      </div>

      <PatientFileSyntheseSection icon={<HeartPulse size={13} />} title="Données critiques" color="#ef4444" count={dossier.groupeSanguinAbo ? 1 : 0}>
        <PatientFileSyntheseRow label="Groupe sanguin"
          value={dossier.groupeSanguinAbo
            ? `${dossier.groupeSanguinAbo} ${dossier.groupeSanguinRhesus === 'Positif' ? '+' : dossier.groupeSanguinRhesus === 'Négatif' ? '−' : ''}`
            : null}
        />
        <PatientFileSyntheseRow label="Directive réanimation" value={dossier.statutReanimatoire} />
        <PatientFileSyntheseRow label="Directives anticipées" value={dossier.directivesAnticipees ? 'Oui — renseignées' : 'Non renseignées'} />
      </PatientFileSyntheseSection>

      <PatientFileSyntheseSection icon={<AlertTriangle size={13} />} title="Allergies connues" color="#f97316" count={dossier.allergies.length}>
        {dossier.allergies.length === 0
          ? <p style={{ fontSize: 11, color: 'var(--c-t3)', fontStyle: 'italic', margin: 0 }}>Aucune allergie enregistrée.</p>
          : dossier.allergies.map((a: any) => (
            <PatientFileSyntheseItem key={a.id}>
              <span style={{ fontWeight: 600 }}>{a.allergene}</span>
              {a.severite && <> · <span style={{ color: '#f97316' }}>{a.severite}</span></>}
              {a.typeReaction && <> · {a.typeReaction}</>}
              {a.dateDecouverte && <> · {new Date(a.dateDecouverte).toLocaleDateString('fr-FR')}</>}
            </PatientFileSyntheseItem>
          ))
        }
      </PatientFileSyntheseSection>

      <PatientFileSyntheseSection icon={<Pill size={13} />} title="Traitements à risque" color="#8b5cf6" count={dossier.traitementsARisque.length}>
        {dossier.traitementsARisque.length === 0
          ? <p style={{ fontSize: 11, color: 'var(--c-t3)', fontStyle: 'italic', margin: 0 }}>Aucun traitement enregistré.</p>
          : dossier.traitementsARisque.map((t: any) => (
            <PatientFileSyntheseItem key={t.id}>
              <span style={{ fontWeight: 600 }}>{t.nomMedicament}</span>
              {t.classe && <> · {t.classe}</>}
              {t.posologieEnCours && <> · {t.posologieEnCours}</>}
              {t.niveauAlerte && <> · <span style={{ color: '#8b5cf6' }}>{t.niveauAlerte}</span></>}
            </PatientFileSyntheseItem>
          ))
        }
      </PatientFileSyntheseSection>

      <PatientFileSyntheseSection icon={<Phone size={13} />} title="Contacts d'urgence" color="#0ea5e9" count={dossier.contactsUrgence.length}>
        {dossier.contactsUrgence.length === 0
          ? <p style={{ fontSize: 11, color: 'var(--c-t3)', fontStyle: 'italic', margin: 0 }}>Aucun contact enregistré.</p>
          : dossier.contactsUrgence.map((c: any) => (
            <PatientFileSyntheseItem key={c.id}>
              <span style={{ fontWeight: 600 }}>{c.prenom} {c.nom}</span>
              {c.estPersonneConfiance && <span style={{ marginLeft: 4, fontSize: 10, color: '#0ea5e9' }}>★ Personne de confiance</span>}
              <> · {c.lienParente} · {c.telephone}</>
            </PatientFileSyntheseItem>
          ))
        }
      </PatientFileSyntheseSection>

      <PatientFileSyntheseSection icon={<Building2 size={13} />} title="Couverture sociale" color="#059669" count={dossier.couverturesSociales.length}>
        {dossier.couverturesSociales.length === 0
          ? <p style={{ fontSize: 11, color: 'var(--c-t3)', fontStyle: 'italic', margin: 0 }}>Aucune couverture enregistrée.</p>
          : dossier.couverturesSociales.map((c: any) => (
            <PatientFileSyntheseItem key={c.id}>
              <span style={{ fontWeight: 600 }}>{c.nomOrganisme}</span>
              {' · '}{c.typeCouverture}{' · N°'}{c.numeroAssure}{' · '}{c.statut}
              {' · '}
              <span style={{ color: c.estActive ? '#059669' : '#64748b' }}>{c.estActive ? 'Active' : 'Inactive'}</span>
            </PatientFileSyntheseItem>
          ))
        }
      </PatientFileSyntheseSection>

      <PatientFileSyntheseSection icon={<Stethoscope size={13} />} title="Diagnostics du séjour actif" color="#1e3a5f" count={diagList.length}>
        {!sejour
          ? <p style={{ fontSize: 11, color: 'var(--c-t3)', fontStyle: 'italic', margin: 0 }}>Aucun séjour actif.</p>
          : diagList.length === 0
            ? <p style={{ fontSize: 11, color: 'var(--c-t3)', fontStyle: 'italic', margin: 0 }}>Aucun diagnostic enregistré pour ce séjour.</p>
            : diagList.map((d: any) => (
              <PatientFileSyntheseItem key={d.id}>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--c-accent)', marginRight: 6 }}>{d.codeCim10}</span>
                <span style={{ fontWeight: 600 }}>{d.libelle}</span>
                {' · '}<span style={{ color: 'var(--c-t3)' }}>{d.type}</span>
                {' · '}<span style={{ color: 'var(--c-t3)' }}>{d.statut}</span>
              </PatientFileSyntheseItem>
            ))
        }
      </PatientFileSyntheseSection>

      <PatientFileSyntheseSection icon={<Activity size={13} />} title="Soins infirmiers" color="#0891b2" count={soinsList.length}>
        {!sejour
          ? <p style={{ fontSize: 11, color: 'var(--c-t3)', fontStyle: 'italic', margin: 0 }}>Aucun séjour actif.</p>
          : soinsList.length === 0
            ? <p style={{ fontSize: 11, color: 'var(--c-t3)', fontStyle: 'italic', margin: 0 }}>Aucun soin enregistré pour ce séjour.</p>
            : soinsList.map((s: any) => (
              <PatientFileSyntheseItem key={s.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontWeight: 600 }}>{s.cible}</span>
                  <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 99, background: s.valide ? '#dcfce7' : '#fef3c7', color: s.valide ? '#166534' : '#92400e', fontWeight: 600 }}>
                    {s.valide ? 'Validé' : 'En attente'}
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--c-t3)' }}>
                    {new Date(s.dateHeure).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {s.donneesObservees && <div style={{ fontSize: 11, color: 'var(--c-t2)' }}>Obs : {s.donneesObservees}</div>}
                {s.actionsRealisees && <div style={{ fontSize: 11, color: 'var(--c-t2)' }}>Actions : {s.actionsRealisees}</div>}
                {s.resultatsObtenus && <div style={{ fontSize: 11, color: 'var(--c-t2)' }}>Résultats : {s.resultatsObtenus}</div>}
                <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                  {s.saisiParNom && <span style={{ fontSize: 10, color: 'var(--c-t3)' }}>Saisi par <strong>{s.saisiParNom}</strong></span>}
                  {s.valide && s.valideParNom && <span style={{ fontSize: 10, color: '#059669' }}>Validé par <strong>{s.valideParNom}</strong>{s.dateValidation ? ` le ${new Date(s.dateValidation).toLocaleDateString('fr-FR')}` : ''}</span>}
                </div>
              </PatientFileSyntheseItem>
            ))
        }
      </PatientFileSyntheseSection>

      <div style={{ borderTop: '1px solid var(--c-bdr)', paddingTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={onClose} className="adm-btn adm-btn-primary" style={{ height: 34, fontSize: 12 }}>Fermer</button>
      </div>
    </PatientFileModal>
  );
}
