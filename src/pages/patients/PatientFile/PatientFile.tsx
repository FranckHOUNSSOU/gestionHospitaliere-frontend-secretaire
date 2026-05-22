import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigation } from '../../../context/NavigationContext';
import {
  AlertTriangle, Plus, ChevronLeft, Save,
  ShieldAlert, Pill, Building2, Phone, User, Loader2,
} from 'lucide-react';
import client from '../../../services/clients';
import { Section, Field, DelBtn } from './PatientFileComponents';

// ─── Types ───────────────────────────────────────────────────────────────────

type BloodGroup = 'A' | 'B' | 'AB' | 'O' | '';
type Rhesus     = 'POSITIF' | 'NEGATIF' | '';

interface PatientIdentite {
  id: string;
  numeroIpp: string;
  nom: string;
  prenom: string;
  sexe: 'M' | 'F' | 'Autre';
  dateNaissance: string;
  adresse: string | null;
  telephoneMobile: string | null;
  email: string | null;
  statutProfil: 'Complet' | 'Incomplet';
  contactsUrgence: { nom: string; prenom: string; lienParente: string; telephone: string }[];
}

interface Allergie       { id: string; allergene: string; dateDecouverte: string; }
interface TraitementAnt  { id: string; nomMedicament: string; typeMedicament: string; dose: string; }
interface CouvertureSoc  { id: string; nomOrganisme: string; dateCouverture: string; estActive: boolean; }
interface ContactUrgence { id: string; nom: string; prenom: string; lienParente: string; telephone: string; estPersonneDeConfiance: boolean; }

const uid = () => Math.random().toString(36).slice(2, 8);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR');
}

function sexeLabel(s: string) {
  if (s === 'M') return 'Masculin';
  if (s === 'F') return 'Féminin';
  return 'Autre';
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function PatientFile() {
  const { id } = useParams<{ id: string }>();
  const { navigate } = useNavigation();

  // Chargement identité depuis l'API
  const [patient, setPatient] = useState<PatientIdentite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    client.get<PatientIdentite>(`/patients/${id}`)
      .then(res => setPatient(res.data))
      .catch(() => setError('Impossible de charger les données du patient.'))
      .finally(() => setLoading(false));
  }, [id]);

  // Données critiques
  const [groupeSanguin,     setGroupeSanguin]     = useState<BloodGroup>('');
  const [rhesus,            setRhesus]            = useState<Rhesus>('');
  const [statutReanimation, setStatutReanimation] = useState('');

  // Allergies
  const [allergies, setAllergies] = useState<Allergie[]>([]);
  const addAllergie    = () => setAllergies(p => [...p, { id: uid(), allergene: '', dateDecouverte: '' }]);
  const removeAllergie = (xid: string) => setAllergies(p => p.filter(a => a.id !== xid));
  const updateAllergie = (xid: string, f: keyof Allergie, v: string) =>
    setAllergies(p => p.map(a => a.id === xid ? { ...a, [f]: v } : a));

  // Traitements antérieurs
  const [traitements, setTraitements] = useState<TraitementAnt[]>([]);
  const addTraitement    = () => setTraitements(p => [...p, { id: uid(), nomMedicament: '', typeMedicament: '', dose: '' }]);
  const removeTraitement = (xid: string) => setTraitements(p => p.filter(t => t.id !== xid));
  const updateTraitement = (xid: string, f: keyof TraitementAnt, v: string) =>
    setTraitements(p => p.map(t => t.id === xid ? { ...t, [f]: v } : t));

  // Couverture sociale
  const [couvertures, setCouvertures] = useState<CouvertureSoc[]>([]);
  const addCouverture    = () => setCouvertures(p => [...p, { id: uid(), nomOrganisme: '', dateCouverture: '', estActive: true }]);
  const removeCouverture = (xid: string) => setCouvertures(p => p.filter(c => c.id !== xid));
  const updateCouverture = (xid: string, f: keyof CouvertureSoc, v: string | boolean) =>
    setCouvertures(p => p.map(c => c.id === xid ? { ...c, [f]: v } : c));

  // Contacts supplémentaires
  const [contacts, setContacts] = useState<ContactUrgence[]>([]);
  const addContact    = () => setContacts(p => [...p, { id: uid(), nom: '', prenom: '', lienParente: '', telephone: '', estPersonneDeConfiance: false }]);
  const removeContact = (xid: string) => setContacts(p => p.filter(c => c.id !== xid));
  const updateContact = (xid: string, f: keyof ContactUrgence, v: string | boolean) =>
    setContacts(p => p.map(c => c.id === xid ? { ...c, [f]: v } : c));

  const handleSave = () => {
    // TODO : PATCH /patients/:id/completer
    console.log({ id, groupeSanguin, rhesus, statutReanimation, allergies, traitements, couvertures, contacts });
    navigate('admissions');
  };

  // ─── États de chargement / erreur ────────────────────────────────────────

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '10px', color: 'var(--c-t3)' }}>
      <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
      <span>Chargement du dossier…</span>
    </div>
  );

  if (error || !patient) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '12px' }}>
      <AlertTriangle size={28} style={{ color: '#ef4444' }} />
      <p style={{ margin: 0, color: 'var(--c-t2)' }}>{error ?? 'Patient introuvable.'}</p>
      <button onClick={() => navigate('admissions')} className="adm-btn">← Retour</button>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => navigate('admissions')} className="adm-btn" style={{ padding: '6px 10px' }}>
          <ChevronLeft size={16} />
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--c-t1)' }}>
            Compléter le dossier patient
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--c-t3)' }}>{patient.numeroIpp}</p>
            {patient.statutProfil === 'Incomplet' && (
              <span style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', borderRadius: '99px', padding: '1px 8px', fontSize: '11px', fontWeight: 600 }}>
                Profil incomplet
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ══ 1. IDENTITÉ (lecture seule — données de la base) ══════════════ */}
      <div className="adm-card">
        <div className="adm-card-head" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={15} style={{ color: 'var(--c-primary)' }} />
            <p className="adm-card-title" style={{ margin: 0 }}>Identité enregistrée</p>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--c-t3)', fontStyle: 'italic' }}>
            Modifiable depuis la fiche patient
          </span>
        </div>
        <div className="adm-card-body">

          {/* Avatar + nom */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingBottom: '14px', borderBottom: '1px solid var(--c-bdr)' }}>
            <div className="adm-avatar-sm" style={{
              width: '48px', height: '48px', fontSize: '16px', flexShrink: 0,
              background: patient.sexe === 'F'
                ? 'linear-gradient(135deg,#f9a8d4,#ec4899)'
                : 'linear-gradient(135deg,#93c5fd,#3b82f6)',
            }}>
              {patient.prenom[0]}{patient.nom[0]}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '16px', color: 'var(--c-t1)' }}>
                {patient.prenom} {patient.nom}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--c-t3)' }}>
                {sexeLabel(patient.sexe)} · Né(e) le {formatDate(patient.dateNaissance)}
              </p>
            </div>
          </div>

          {/* Grille infos */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <Field label="N° IPP"            value={patient.numeroIpp} />
            <Field label="Sexe"              value={sexeLabel(patient.sexe)} />
            <Field label="Date de naissance" value={formatDate(patient.dateNaissance)} />
            <Field label="Téléphone mobile"  value={patient.telephoneMobile} />
            <Field label="Email"             value={patient.email} />
            <Field label="Adresse"           value={patient.adresse} />
          </div>

          {/* Contacts d'urgence déjà enregistrés */}
          {patient.contactsUrgence.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 600, color: 'var(--c-t3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Contact(s) d'urgence enregistré(s) à l'accueil
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {patient.contactsUrgence.map((c, i) => (
                  <div key={i} style={{ border: '1px solid var(--c-bdr)', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: 'var(--c-t2)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--c-t1)' }}>{c.prenom} {c.nom}</span>
                    <span style={{ margin: '0 6px', opacity: 0.4 }}>·</span>
                    {c.lienParente}
                    <span style={{ margin: '0 6px', opacity: 0.4 }}>·</span>
                    {c.telephone}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══ 2. DONNÉES CRITIQUES ══════════════════════════════════════════ */}
      <div className="adm-card" style={{ border: '2px solid #ef4444' }}>
        <div className="adm-card-head" style={{
          justifyContent: 'space-between',
          background: 'rgba(239,68,68,0.05)',
          borderBottom: '1px solid rgba(239,68,68,0.15)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={15} style={{ color: '#ef4444' }} />
            <p className="adm-card-title" style={{ margin: 0, color: '#ef4444' }}>Données critiques</p>
          </div>
        </div>
        <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ margin: 0, fontSize: '11px', color: '#ef4444', opacity: 0.85 }}>
            Le groupe sanguin ne remplace jamais la double détermination biologique avant toute transfusion.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            <div>
              <label className="adm-label">Groupe sanguin</label>
              <select value={groupeSanguin} onChange={e => setGroupeSanguin(e.target.value as BloodGroup)} className="adm-input">
                <option value="">— Sélectionner —</option>
                {['A', 'B', 'AB', 'O'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="adm-label">Rhésus</label>
              <select value={rhesus} onChange={e => setRhesus(e.target.value as Rhesus)} className="adm-input">
                <option value="">— Sélectionner —</option>
                <option value="POSITIF">Positif (+)</option>
                <option value="NEGATIF">Négatif (−)</option>
              </select>
            </div>
            <div>
              <label className="adm-label">Directive anticipée / Réanimation</label>
              <select value={statutReanimation} onChange={e => setStatutReanimation(e.target.value)} className="adm-input">
                <option value="">— Sélectionner —</option>
                <option value="PLEIN">Pleine réanimation</option>
                <option value="LIMITE">Soins limités</option>
                <option value="CONFORT">Soins de confort uniquement</option>
                <option value="DNR">Ne pas réanimer (DNR)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ══ 3. ALLERGIES ══════════════════════════════════════════════════ */}
      <Section
        icon={<ShieldAlert size={15} />} title="Allergies connues" color="#f97316"
        action={
          <button onClick={addAllergie} className="adm-btn adm-btn-primary" style={{ padding: '5px 10px', fontSize: '12px' }}>
            <Plus size={12} /> Ajouter
          </button>
        }
      >
        {allergies.length === 0 && <p style={{ color: 'var(--c-t3)', fontSize: '13px', margin: 0 }}>Aucune allergie enregistrée.</p>}
        {allergies.map(a => (
          <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
            <div>
              <label className="adm-label">Allergène</label>
              <input value={a.allergene} onChange={e => updateAllergie(a.id, 'allergene', e.target.value)}
                className="adm-input" placeholder="Ex : Pénicilline, Arachides, Latex" />
            </div>
            <div>
              <label className="adm-label">Date de découverte</label>
              <input type="date" value={a.dateDecouverte} onChange={e => updateAllergie(a.id, 'dateDecouverte', e.target.value)} className="adm-input" />
            </div>
            <DelBtn onClick={() => removeAllergie(a.id)} />
          </div>
        ))}
      </Section>

      {/* ══ 4. TRAITEMENTS ANTÉRIEURS ═════════════════════════════════════ */}
      <Section
        icon={<Pill size={15} />} title="Traitements antérieurs"
        action={
          <button onClick={addTraitement} className="adm-btn adm-btn-primary" style={{ padding: '5px 10px', fontSize: '12px' }}>
            <Plus size={12} /> Ajouter
          </button>
        }
      >
        {traitements.length === 0 && <p style={{ color: 'var(--c-t3)', fontSize: '13px', margin: 0 }}>Aucun traitement antérieur enregistré.</p>}
        {traitements.map(t => (
          <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
            <div>
              <label className="adm-label">Médicament</label>
              <input value={t.nomMedicament} onChange={e => updateTraitement(t.id, 'nomMedicament', e.target.value)}
                className="adm-input" placeholder="Nom du médicament" />
            </div>
            <div>
              <label className="adm-label">Type</label>
              <input value={t.typeMedicament} onChange={e => updateTraitement(t.id, 'typeMedicament', e.target.value)}
                className="adm-input" placeholder="Ex : Antibiotique" />
            </div>
            <div>
              <label className="adm-label">Dose / Posologie</label>
              <input value={t.dose} onChange={e => updateTraitement(t.id, 'dose', e.target.value)}
                className="adm-input" placeholder="Ex : 500 mg × 2/j" />
            </div>
            <DelBtn onClick={() => removeTraitement(t.id)} />
          </div>
        ))}
      </Section>

      {/* ══ 5. COUVERTURE SOCIALE ══════════════════════════════════════════ */}
      <Section
        icon={<Building2 size={15} />} title="Couverture sociale / Assurance"
        action={
          <button onClick={addCouverture} className="adm-btn adm-btn-primary" style={{ padding: '5px 10px', fontSize: '12px' }}>
            <Plus size={12} /> Ajouter
          </button>
        }
      >
        {couvertures.length === 0 && <p style={{ color: 'var(--c-t3)', fontSize: '13px', margin: 0 }}>Aucune couverture sociale enregistrée.</p>}
        {couvertures.map(c => (
          <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto auto', gap: '10px', alignItems: 'end' }}>
            <div>
              <label className="adm-label">Organisme</label>
              <input value={c.nomOrganisme} onChange={e => updateCouverture(c.id, 'nomOrganisme', e.target.value)}
                className="adm-input" placeholder="Ex : CNSS, RAMU, AMO" />
            </div>
            <div>
              <label className="adm-label">Date de couverture</label>
              <input type="date" value={c.dateCouverture} onChange={e => updateCouverture(c.id, 'dateCouverture', e.target.value)} className="adm-input" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <label className="adm-label">Active</label>
              <input type="checkbox" checked={c.estActive}
                onChange={e => updateCouverture(c.id, 'estActive', e.target.checked)}
                style={{ width: '16px', height: '16px', marginTop: '4px', cursor: 'pointer' }} />
            </div>
            <DelBtn onClick={() => removeCouverture(c.id)} />
          </div>
        ))}
      </Section>

      {/* ══ 6. CONTACTS D'URGENCE SUPPLÉMENTAIRES ═════════════════════════ */}
      <Section
        icon={<Phone size={15} />} title="Contacts d'urgence supplémentaires"
        action={
          <button onClick={addContact} className="adm-btn adm-btn-primary" style={{ padding: '5px 10px', fontSize: '12px' }}>
            <Plus size={12} /> Ajouter
          </button>
        }
      >
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--c-t3)' }}>
          Le contact principal a déjà été enregistré à l'accueil. Ajoutez ici des contacts supplémentaires.
        </p>
        {contacts.map(c => (
          <div key={c.id} style={{ border: '1px solid var(--c-bdr)', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
              <div>
                <label className="adm-label">Nom</label>
                <input value={c.nom} onChange={e => updateContact(c.id, 'nom', e.target.value)}
                  className="adm-input" placeholder="Nom de famille" />
              </div>
              <div>
                <label className="adm-label">Prénom</label>
                <input value={c.prenom} onChange={e => updateContact(c.id, 'prenom', e.target.value)}
                  className="adm-input" placeholder="Prénom" />
              </div>
              <div>
                <label className="adm-label">Lien de parenté</label>
                <input value={c.lienParente} onChange={e => updateContact(c.id, 'lienParente', e.target.value)}
                  className="adm-input" placeholder="Ex : Frère, Époux" />
              </div>
              <div>
                <label className="adm-label">Téléphone</label>
                <input value={c.telephone} onChange={e => updateContact(c.id, 'telephone', e.target.value)}
                  className="adm-input" placeholder="+229 ..." />
              </div>
              <DelBtn onClick={() => removeContact(c.id)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" id={`conf-${c.id}`} checked={c.estPersonneDeConfiance}
                onChange={e => updateContact(c.id, 'estPersonneDeConfiance', e.target.checked)}
                style={{ width: '15px', height: '15px', cursor: 'pointer' }} />
              <label htmlFor={`conf-${c.id}`} style={{ fontSize: '12px', color: 'var(--c-t2)', cursor: 'pointer' }}>
                Personne de confiance désignée par le patient
              </label>
            </div>
          </div>
        ))}
      </Section>

      {/* ══ ACTIONS ══════════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingBottom: '32px' }}>
        <button onClick={() => navigate('admissions')} className="adm-btn">Annuler</button>
        <button onClick={handleSave} className="adm-btn adm-btn-primary">
          <Save size={14} /> Enregistrer le dossier
        </button>
      </div>
    </div>
  );
}