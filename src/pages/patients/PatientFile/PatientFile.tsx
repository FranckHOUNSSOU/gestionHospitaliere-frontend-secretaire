import './PatientFile.css';
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useNavigation } from '../../../context/NavigationContext';
import {
  ArrowLeft, X, Plus, Trash2, Save, Loader2,
  AlertTriangle, Pill, Phone, Building2, Stethoscope, HeartPulse, FileText, Activity,
} from 'lucide-react';
import client from '../../../services/clients';
import CIM10Input from '../../../components/CIM10Input/CIM10Input';
import type { CIM10Entry } from '../../../data/cim10';

// ── Enums ────────────────────────────────────────────────────────────────────

const SEVERITE_ALLERGIE = ['Légère', 'Modérée', 'Sévère', 'Mortelle'];
const NIVEAU_ALERTE_TRT = ['Faible', 'Modéré', 'Élevé', 'Critique'];
const STATUT_COUVERTURE = ['Assuré principal', 'Ayant droit'];
const STATUT_DIAGNOSTIC = ['Confirmé', 'Suspecté', 'Écarté'];
const GROUPE_SANGUIN    = ['A', 'B', 'AB', 'O'];
const RHESUS            = ['Positif', 'Négatif'];
const STATUT_REANIM     = ['Autorisé', 'Non autorisé', 'Conditionnel'];

// ── Types ────────────────────────────────────────────────────────────────────

interface DossierPatient {
  id: string; numeroIpp: string; nom: string; prenom: string;
  dateNaissance: string; sexe: 'M' | 'F' | 'Autre';
  telephoneMobile: string | null; email: string | null; adresse: string | null;
  groupeSanguinAbo: string | null; groupeSanguinRhesus: string | null;
  statutReanimatoire: string | null; directivesAnticipees: boolean;
  statutProfil: 'Complet' | 'Incomplet';
  allergies: Allergie[];
  traitementsARisque: Traitement[];
  contactsUrgence: Contact[];
  couverturesSociales: Couverture[];
}

interface Allergie  { id: string; allergene: string; typeReaction?: string; severite?: string; dateDecouverte?: string; }
interface Traitement{ id: string; nomMedicament: string; classe?: string; posologieEnCours?: string; niveauAlerte?: string; }
interface Contact   { id: string; nom: string; prenom: string; lienParente: string; telephone: string; estPersonneConfiance?: boolean; }
interface Couverture{ id: string; typeCouverture: string; nomOrganisme: string; numeroAssure: string; statut: string; dateDebut: string; estActive: boolean; }
interface Diagnostic{ id: string; codeCim10: string; libelle: string; type: string; statut: string; }
interface SoinInfirmier { id: string; cible: string; donneesObservees?: string | null; actionsRealisees?: string | null; resultatsObtenus?: string | null; dateHeure: string; valide: boolean; saisiParNom?: string | null; valideParNom?: string | null; dateValidation?: string | null; }
interface Sejour    { id: string; numeroSejour: string; dateAdmission: string; typeSejour?: string; }

// ── Composant Modal générique ─────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'var(--c-bg)', borderRadius: 12, width: '100%', maxWidth: 580, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--c-bdr)', flexShrink: 0 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--c-t0)' }}>{title}</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-t3)', display: 'flex' }}><X size={18} /></button>
        </div>
        <div style={{ overflowY: 'auto', padding: '16px 20px', flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

// ── Carte de section ──────────────────────────────────────────────────────────

function SectionCard({ icon, title, color, count, preview, onClick }: {
  icon: React.ReactNode; title: string; color: string;
  count: number; preview: string; onClick: () => void;
}) {
  return (
    <div className="adm-card" style={{ cursor: 'pointer', transition: 'box-shadow 0.15s' }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 0 2px ' + color + '60')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}>
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 32, height: 32, borderRadius: 8, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
            {icon}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--c-t0)' }}>{title}</p>
            {count > 0
              ? <p style={{ margin: 0, fontSize: 11, color: 'var(--c-t3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{preview}</p>
              : <p style={{ margin: 0, fontSize: 11, color: 'var(--c-t3)', fontStyle: 'italic' }}>Non renseigné</p>
            }
          </div>
          {count > 0 && (
            <span style={{ fontSize: 10, fontWeight: 700, background: color + '18', color, borderRadius: 99, padding: '2px 8px', flexShrink: 0 }}>{count}</span>
          )}
        </div>
        <button onClick={onClick} className="adm-btn" style={{ justifyContent: 'center', height: 30, fontSize: 11, borderColor: color, color }}>
          {count > 0 ? 'Gérer' : 'Ajouter'}
        </button>
      </div>
    </div>
  );
}

// ── Tag d'entrée existante ────────────────────────────────────────────────────

function EntryRow({ label, sub, onDelete }: { label: string; sub?: string; onDelete: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--c-surf2)', borderRadius: 8, marginBottom: 6 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--c-t1)' }}>{label}</p>
        {sub && <p style={{ margin: 0, fontSize: 11, color: 'var(--c-t3)' }}>{sub}</p>}
      </div>
      <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', display: 'flex', padding: 4, flexShrink: 0 }}>
        <Trash2 size={13} />
      </button>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--c-bdr)', margin: '14px 0' }} />;
}

// ══════════════════════════════════════════════════════════════════════════════
// MODAL — Synthèse complète (lecture seule)
// ══════════════════════════════════════════════════════════════════════════════

function SyntheseSection({ icon, title, color, count, children }: {
  icon: React.ReactNode; title: string; color: string; count: number; children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 26, height: 26, borderRadius: 7, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
          {icon}
        </span>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--c-t0)', flex: 1 }}>{title}</p>
        {count > 0 && (
          <span style={{ fontSize: 10, fontWeight: 700, background: color + '18', color, borderRadius: 99, padding: '1px 8px' }}>{count}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function SyntheseRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div style={{ display: 'flex', gap: 8, padding: '5px 0', borderBottom: '1px solid var(--c-bdr)' }}>
      <p style={{ margin: 0, fontSize: 11, color: 'var(--c-t3)', width: 140, flexShrink: 0 }}>{label}</p>
      <p style={{ margin: 0, fontSize: 11, color: value ? 'var(--c-t1)' : 'var(--c-t3)', fontStyle: value ? 'normal' : 'italic', fontWeight: value ? 500 : 400 }}>
        {value || 'Non renseigné'}
      </p>
    </div>
  );
}

function SyntheseItem({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '7px 10px', background: 'var(--c-surf2)', borderRadius: 7, marginBottom: 5, fontSize: 11, color: 'var(--c-t1)' }}>
      {children}
    </div>
  );
}

function ModalSynthese({ dossier, sejour, diagList, soinsList, onClose }: {
  dossier: DossierPatient; sejour: Sejour | null;
  diagList: Diagnostic[]; soinsList: SoinInfirmier[]; onClose: () => void;
}) {
  const age = Math.floor((Date.now() - new Date(dossier.dateNaissance).getTime()) / (365.25 * 24 * 3600 * 1000));

  return (
    <Modal title={`Synthèse — ${dossier.prenom} ${dossier.nom}`} onClose={onClose}>

      {/* Identité */}
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

      {/* Données critiques */}
      <SyntheseSection icon={<HeartPulse size={13} />} title="Données critiques" color="#ef4444" count={dossier.groupeSanguinAbo ? 1 : 0}>
        <SyntheseRow label="Groupe sanguin"
          value={dossier.groupeSanguinAbo
            ? `${dossier.groupeSanguinAbo} ${dossier.groupeSanguinRhesus === 'Positif' ? '+' : dossier.groupeSanguinRhesus === 'Négatif' ? '−' : ''}`
            : null}
        />
        <SyntheseRow label="Directive réanimation" value={dossier.statutReanimatoire} />
        <SyntheseRow label="Directives anticipées" value={dossier.directivesAnticipees ? 'Oui — renseignées' : 'Non renseignées'} />
      </SyntheseSection>

      {/* Allergies */}
      <SyntheseSection icon={<AlertTriangle size={13} />} title="Allergies connues" color="#f97316" count={dossier.allergies.length}>
        {dossier.allergies.length === 0
          ? <p style={{ fontSize: 11, color: 'var(--c-t3)', fontStyle: 'italic', margin: 0 }}>Aucune allergie enregistrée.</p>
          : dossier.allergies.map(a => (
            <SyntheseItem key={a.id}>
              <span style={{ fontWeight: 600 }}>{a.allergene}</span>
              {a.severite && <> · <span style={{ color: '#f97316' }}>{a.severite}</span></>}
              {a.typeReaction && <> · {a.typeReaction}</>}
              {a.dateDecouverte && <> · {new Date(a.dateDecouverte).toLocaleDateString('fr-FR')}</>}
            </SyntheseItem>
          ))
        }
      </SyntheseSection>

      {/* Traitements */}
      <SyntheseSection icon={<Pill size={13} />} title="Traitements à risque" color="#8b5cf6" count={dossier.traitementsARisque.length}>
        {dossier.traitementsARisque.length === 0
          ? <p style={{ fontSize: 11, color: 'var(--c-t3)', fontStyle: 'italic', margin: 0 }}>Aucun traitement enregistré.</p>
          : dossier.traitementsARisque.map(t => (
            <SyntheseItem key={t.id}>
              <span style={{ fontWeight: 600 }}>{t.nomMedicament}</span>
              {t.classe && <> · {t.classe}</>}
              {t.posologieEnCours && <> · {t.posologieEnCours}</>}
              {t.niveauAlerte && <> · <span style={{ color: '#8b5cf6' }}>{t.niveauAlerte}</span></>}
            </SyntheseItem>
          ))
        }
      </SyntheseSection>

      {/* Contacts d'urgence */}
      <SyntheseSection icon={<Phone size={13} />} title="Contacts d'urgence" color="#0ea5e9" count={dossier.contactsUrgence.length}>
        {dossier.contactsUrgence.length === 0
          ? <p style={{ fontSize: 11, color: 'var(--c-t3)', fontStyle: 'italic', margin: 0 }}>Aucun contact enregistré.</p>
          : dossier.contactsUrgence.map(c => (
            <SyntheseItem key={c.id}>
              <span style={{ fontWeight: 600 }}>{c.prenom} {c.nom}</span>
              {c.estPersonneConfiance && <span style={{ marginLeft: 4, fontSize: 10, color: '#0ea5e9' }}>★ Personne de confiance</span>}
              <> · {c.lienParente} · {c.telephone}</>
            </SyntheseItem>
          ))
        }
      </SyntheseSection>

      {/* Couverture sociale */}
      <SyntheseSection icon={<Building2 size={13} />} title="Couverture sociale" color="#059669" count={dossier.couverturesSociales.length}>
        {dossier.couverturesSociales.length === 0
          ? <p style={{ fontSize: 11, color: 'var(--c-t3)', fontStyle: 'italic', margin: 0 }}>Aucune couverture enregistrée.</p>
          : dossier.couverturesSociales.map(c => (
            <SyntheseItem key={c.id}>
              <span style={{ fontWeight: 600 }}>{c.nomOrganisme}</span>
              {' · '}{c.typeCouverture}{' · N°'}{c.numeroAssure}{' · '}{c.statut}
              {' · '}
              <span style={{ color: c.estActive ? '#059669' : '#64748b' }}>{c.estActive ? 'Active' : 'Inactive'}</span>
            </SyntheseItem>
          ))
        }
      </SyntheseSection>

      {/* Diagnostics */}
      <SyntheseSection icon={<Stethoscope size={13} />} title="Diagnostics du séjour actif" color="#1e3a5f" count={diagList.length}>
        {!sejour
          ? <p style={{ fontSize: 11, color: 'var(--c-t3)', fontStyle: 'italic', margin: 0 }}>Aucun séjour actif.</p>
          : diagList.length === 0
            ? <p style={{ fontSize: 11, color: 'var(--c-t3)', fontStyle: 'italic', margin: 0 }}>Aucun diagnostic enregistré pour ce séjour.</p>
            : diagList.map(d => (
              <SyntheseItem key={d.id}>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--c-accent)', marginRight: 6 }}>{d.codeCim10}</span>
                <span style={{ fontWeight: 600 }}>{d.libelle}</span>
                {' · '}<span style={{ color: 'var(--c-t3)' }}>{d.type}</span>
                {' · '}<span style={{ color: 'var(--c-t3)' }}>{d.statut}</span>
              </SyntheseItem>
            ))
        }
      </SyntheseSection>

      {/* Soins infirmiers */}
      <SyntheseSection icon={<Activity size={13} />} title="Soins infirmiers" color="#0891b2" count={soinsList.length}>
        {!sejour
          ? <p style={{ fontSize: 11, color: 'var(--c-t3)', fontStyle: 'italic', margin: 0 }}>Aucun séjour actif.</p>
          : soinsList.length === 0
            ? <p style={{ fontSize: 11, color: 'var(--c-t3)', fontStyle: 'italic', margin: 0 }}>Aucun soin enregistré pour ce séjour.</p>
            : soinsList.map(s => (
              <SyntheseItem key={s.id}>
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
              </SyntheseItem>
            ))
        }
      </SyntheseSection>

      <div style={{ borderTop: '1px solid var(--c-bdr)', paddingTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={onClose} className="adm-btn adm-btn-primary" style={{ height: 34, fontSize: 12 }}>Fermer</button>
      </div>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODAL — Soins infirmiers
// ══════════════════════════════════════════════════════════════════════════════

function ModalSoins({ sejour, items, onClose, onChanged }: {
  sejour: Sejour | null; items: SoinInfirmier[]; onClose: () => void; onChanged: () => void;
}) {
  const today = new Date().toISOString().slice(0, 16);
  const [form, setForm] = useState({ cible: '', donneesObservees: '', actionsRealisees: '', resultatsObtenus: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState<string | null>(null);

  async function add() {
    if (!sejour) return;
    if (!form.cible.trim()) { setErr('La cible est obligatoire.'); return; }
    setSaving(true); setErr(null);
    try {
      await client.post(`/sejours/${sejour.id}/soins`, {
        cible:             form.cible.trim(),
        donneesObservees:  form.donneesObservees  || undefined,
        actionsRealisees:  form.actionsRealisees  || undefined,
        resultatsObtenus:  form.resultatsObtenus  || undefined,
        dateHeure:         new Date(today).toISOString(),
        typeAuteur:        'Infirmier',
      });
      setForm({ cible: '', donneesObservees: '', actionsRealisees: '', resultatsObtenus: '' });
      onChanged();
    } catch (e: any) { setErr(e?.message ?? 'Erreur.'); }
    finally { setSaving(false); }
  }

  if (!sejour) return (
    <Modal title="Soins infirmiers" onClose={onClose}>
      <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--c-t3)' }}>
        <Activity size={28} style={{ marginBottom: 8 }} />
        <p style={{ margin: 0, fontSize: 13 }}>Aucun séjour actif pour ce patient.</p>
      </div>
    </Modal>
  );

  return (
    <Modal title="Soins infirmiers" onClose={onClose}>
      <p style={{ margin: '0 0 10px', fontSize: 11, color: 'var(--c-t3)' }}>
        Séjour : <strong>{sejour.numeroSejour}</strong> · Admis le {new Date(sejour.dateAdmission).toLocaleDateString('fr-FR')}
      </p>

      {/* Liste existante */}
      {items.length === 0
        ? <p style={{ fontSize: 12, color: 'var(--c-t3)', fontStyle: 'italic', marginBottom: 12 }}>Aucun soin enregistré pour ce séjour.</p>
        : items.map(s => (
          <div key={s.id} style={{ padding: '8px 12px', background: 'var(--c-surf2)', borderRadius: 8, marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-t0)' }}>{s.cible}</span>
              <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 99, background: s.valide ? '#dcfce7' : '#fef3c7', color: s.valide ? '#166534' : '#92400e', fontWeight: 600 }}>
                {s.valide ? 'Validé' : 'En attente'}
              </span>
            </div>
            {s.donneesObservees && <p style={{ margin: '2px 0', fontSize: 11, color: 'var(--c-t2)' }}>Obs : {s.donneesObservees}</p>}
            {s.actionsRealisees && <p style={{ margin: '2px 0', fontSize: 11, color: 'var(--c-t2)' }}>Actions : {s.actionsRealisees}</p>}
            {s.resultatsObtenus && <p style={{ margin: '2px 0', fontSize: 11, color: 'var(--c-t2)' }}>Résultats : {s.resultatsObtenus}</p>}
            <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, color: 'var(--c-t3)' }}>{new Date(s.dateHeure).toLocaleDateString('fr-FR')}</span>
              {s.saisiParNom && <span style={{ fontSize: 10, color: 'var(--c-t3)' }}>Saisi par <strong>{s.saisiParNom}</strong></span>}
              {s.valide && s.valideParNom && <span style={{ fontSize: 10, color: '#059669' }}>Validé par <strong>{s.valideParNom}</strong>{s.dateValidation ? ` le ${new Date(s.dateValidation).toLocaleDateString('fr-FR')}` : ''}</span>}
            </div>
          </div>
        ))
      }

      <Divider />
      <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, color: 'var(--c-t1)' }}>Enregistrer un soin</p>
      {err && <div className="adm-alert adm-alert-error" style={{ marginBottom: 10 }}>{err}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="adm-form-field">
          <label className="adm-label">Cible (problème traité) *</label>
          <input className="adm-input" value={form.cible}
            onChange={e => setForm(f => ({ ...f, cible: e.target.value }))} />
        </div>
        <div className="adm-form-field">
          <label className="adm-label">Données observées</label>
          <input className="adm-input" value={form.donneesObservees}
            onChange={e => setForm(f => ({ ...f, donneesObservees: e.target.value }))} />
        </div>
        <div className="adm-form-field">
          <label className="adm-label">Actions réalisées</label>
          <input className="adm-input" value={form.actionsRealisees}
            onChange={e => setForm(f => ({ ...f, actionsRealisees: e.target.value }))} />
        </div>
        <div className="adm-form-field">
          <label className="adm-label">Résultats obtenus</label>
          <input className="adm-input" value={form.resultatsObtenus}
            onChange={e => setForm(f => ({ ...f, resultatsObtenus: e.target.value }))} />
        </div>
      </div>

      <button onClick={add} disabled={saving} className="adm-btn adm-btn-primary" style={{ marginTop: 12, height: 34, gap: 6 }}>
        <Plus size={13} /> {saving ? 'Enregistrement…' : 'Enregistrer le soin'}
      </button>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════

export default function PatientFile() {
  const { id } = useParams<{ id: string }>();
  const { navigate } = useNavigation();
  const location = useLocation();
  const autoSynthese = (location.state as any)?.synthese === true;

  const [dossier,  setDossier]  = useState<DossierPatient | null>(null);
  const [sejour,   setSejour]   = useState<Sejour | null>(null);
  const [diagList, setDiagList] = useState<Diagnostic[]>([]);
  const [soinsList, setSoinsList] = useState<SoinInfirmier[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  type ModalType = 'critiques' | 'allergies' | 'traitements' | 'contacts' | 'couvertures' | 'diagnostics' | 'soins' | 'synthese' | null;
  const [openModal, setOpenModal] = useState<ModalType>(null);

  const loadDossier = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await client.get<DossierPatient>(`/patients/${id}/dossier`);
      setDossier(data);
    } catch {
      setError('Impossible de charger le dossier.');
    }
  }, [id]);

  const loadSejour = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await client.get<Sejour>(`/sejours/patient/${id}/actif`);
      setSejour(data);
      if (data?.id) {
        const { data: detail } = await client.get<{ diagnostics: Diagnostic[]; soinsInfirmiers: SoinInfirmier[] }>(`/sejours/${data.id}`);
        setDiagList(detail.diagnostics ?? []);
        setSoinsList(detail.soinsInfirmiers ?? []);
      }
    } catch { setSejour(null); }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadDossier(), loadSejour()]).finally(() => {
      setLoading(false);
      if (autoSynthese) setOpenModal('synthese');
    });
  }, [loadDossier, loadSejour]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 32, color: 'var(--c-t3)' }}>
      <Loader2 size={18} style={{ animation: 'spin 0.7s linear infinite' }} /> Chargement du dossier…
    </div>
  );
  if (error || !dossier) return (
    <div>
      <button onClick={() => navigate('admissions')} className="adm-back-btn" style={{ marginBottom: 16 }}><ArrowLeft size={16} /></button>
      <div className="adm-alert adm-alert-error">{error ?? 'Patient introuvable.'}</div>
    </div>
  );

  const age = Math.floor((Date.now() - new Date(dossier.dateNaissance).getTime()) / (365.25 * 24 * 3600 * 1000));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 900, margin: '0 auto' }}>

      {/* ── Barre de navigation ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate('admissions')} className="adm-back-btn"><ArrowLeft size={16} /></button>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: 'var(--c-t0)' }}>Dossier patient</p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--c-t2)' }}>Compléter et gérer les informations médicales</p>
        </div>
        <button onClick={() => setOpenModal('synthese')} className="adm-btn adm-btn-primary" style={{ gap: 6, height: 34, fontSize: 12 }}>
          <FileText size={14} /> Synthèse
        </button>
      </div>

      {/* ── En-tête patient (toujours visible) ── */}
      <div className="adm-card">
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 12, flexShrink: 0,
              background: dossier.sexe === 'F' ? 'linear-gradient(135deg,#f9a8d4,#ec4899)' : 'linear-gradient(135deg,#93c5fd,#3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff',
            }}>
              {dossier.prenom[0]}{dossier.nom[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: 'var(--c-t0)' }}>
                  {dossier.prenom} {dossier.nom}
                </p>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                  background: dossier.statutProfil === 'Complet' ? '#dcfce7' : '#fef3c7',
                  color: dossier.statutProfil === 'Complet' ? '#166534' : '#92400e',
                }}>
                  {dossier.statutProfil}
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--c-t3)' }}>
                {dossier.numeroIpp} · {dossier.sexe === 'M' ? 'Masculin' : dossier.sexe === 'F' ? 'Féminin' : 'Autre'} · {age} ans
                {dossier.telephoneMobile && ` · ${dossier.telephoneMobile}`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {dossier.groupeSanguinAbo && (
                <span style={{ fontSize: 12, fontWeight: 700, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 6, padding: '3px 10px' }}>
                  {dossier.groupeSanguinAbo} {dossier.groupeSanguinRhesus === 'Positif' ? '+' : dossier.groupeSanguinRhesus === 'Négatif' ? '−' : ''}
                </span>
              )}
              {sejour && sejour.typeSejour && (
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                  background: sejour.typeSejour === 'Hospitalisation' ? '#eff6ff' : sejour.typeSejour === 'Consultation' ? '#f0fdf4' : '#fef2f2',
                  color:      sejour.typeSejour === 'Hospitalisation' ? '#1d4ed8' : sejour.typeSejour === 'Consultation' ? '#166534' : '#dc2626',
                }}>
                  {sejour.typeSejour}
                </span>
              )}
              {sejour && (
                <span style={{ fontSize: 11, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: 6, padding: '3px 10px' }}>
                  Séjour actif · {new Date(sejour.dateAdmission).toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Grille des 6 sections ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>

        <SectionCard
          icon={<HeartPulse size={15} />} title="Données critiques" color="#ef4444"
          count={dossier.groupeSanguinAbo ? 1 : 0}
          preview={`${dossier.groupeSanguinAbo ?? '?'} ${dossier.groupeSanguinRhesus === 'Positif' ? '+' : dossier.groupeSanguinRhesus === 'Négatif' ? '−' : ''} · ${dossier.statutReanimatoire ?? '—'}`}
          onClick={() => setOpenModal('critiques')}
        />

        <SectionCard
          icon={<AlertTriangle size={15} />} title="Allergies" color="#f97316"
          count={dossier.allergies.length}
          preview={dossier.allergies.slice(0, 3).map(a => a.allergene).join(', ')}
          onClick={() => setOpenModal('allergies')}
        />

        <SectionCard
          icon={<Pill size={15} />} title="Traitements à risque" color="#8b5cf6"
          count={dossier.traitementsARisque.length}
          preview={dossier.traitementsARisque.slice(0, 2).map(t => t.nomMedicament).join(', ')}
          onClick={() => setOpenModal('traitements')}
        />

        <SectionCard
          icon={<Phone size={15} />} title="Contacts d'urgence" color="#0ea5e9"
          count={dossier.contactsUrgence.length}
          preview={dossier.contactsUrgence.slice(0, 2).map(c => `${c.prenom} ${c.nom}`).join(', ')}
          onClick={() => setOpenModal('contacts')}
        />

        <SectionCard
          icon={<Building2 size={15} />} title="Couverture sociale" color="#059669"
          count={dossier.couverturesSociales.length}
          preview={dossier.couverturesSociales.slice(0, 2).map(c => c.nomOrganisme).join(', ')}
          onClick={() => setOpenModal('couvertures')}
        />

        <SectionCard
          icon={<Stethoscope size={15} />} title="Diagnostics" color="#1e3a5f"
          count={diagList.length}
          preview={diagList.slice(0, 2).map(d => d.libelle).join(', ')}
          onClick={() => setOpenModal('diagnostics')}
        />

        <SectionCard
          icon={<Activity size={15} />} title="Soins infirmiers" color="#0891b2"
          count={soinsList.length}
          preview={soinsList.slice(0, 2).map(s => s.cible).join(', ')}
          onClick={() => setOpenModal('soins')}
        />
      </div>

      {/* ══ MODALS ══ */}

      {/* Données critiques */}
      {openModal === 'critiques' && (
        <ModalCritiques
          patientId={id!}
          dossier={dossier}
          onClose={() => setOpenModal(null)}
          onSaved={() => { loadDossier(); setOpenModal(null); }}
        />
      )}

      {/* Allergies */}
      {openModal === 'allergies' && (
        <ModalAllergies
          patientId={id!}
          items={dossier.allergies}
          onClose={() => setOpenModal(null)}
          onChanged={loadDossier}
        />
      )}

      {/* Traitements */}
      {openModal === 'traitements' && (
        <ModalTraitements
          patientId={id!}
          items={dossier.traitementsARisque}
          onClose={() => setOpenModal(null)}
          onChanged={loadDossier}
        />
      )}

      {/* Contacts */}
      {openModal === 'contacts' && (
        <ModalContacts
          patientId={id!}
          items={dossier.contactsUrgence}
          onClose={() => setOpenModal(null)}
          onChanged={loadDossier}
        />
      )}

      {/* Couvertures */}
      {openModal === 'couvertures' && (
        <ModalCouvertures
          patientId={id!}
          items={dossier.couverturesSociales}
          onClose={() => setOpenModal(null)}
          onChanged={loadDossier}
        />
      )}

      {/* Diagnostics */}
      {openModal === 'diagnostics' && (
        <ModalDiagnostics
          sejour={sejour}
          items={diagList}
          onClose={() => setOpenModal(null)}
          onChanged={loadSejour}
        />
      )}

      {/* Soins infirmiers */}
      {openModal === 'soins' && (
        <ModalSoins
          sejour={sejour}
          items={soinsList}
          onClose={() => setOpenModal(null)}
          onChanged={loadSejour}
        />
      )}

      {/* Synthèse */}
      {openModal === 'synthese' && (
        <ModalSynthese
          dossier={dossier}
          sejour={sejour}
          diagList={diagList}
          soinsList={soinsList}
          onClose={() => setOpenModal(null)}
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODAL — Données critiques
// ══════════════════════════════════════════════════════════════════════════════

function ModalCritiques({ patientId, dossier, onClose, onSaved }: {
  patientId: string; dossier: DossierPatient;
  onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    groupeSanguinAbo:    dossier.groupeSanguinAbo ?? '',
    groupeSanguinRhesus: dossier.groupeSanguinRhesus ?? '',
    statutReanimatoire:  dossier.statutReanimatoire ?? '',
    directivesAnticipees: dossier.directivesAnticipees,
  });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState<string | null>(null);

  async function save() {
    setSaving(true); setErr(null);
    try {
      await client.patch(`/patients/${patientId}/completer`, {
        groupeSanguinAbo:     form.groupeSanguinAbo     || undefined,
        groupeSanguinRhesus:  form.groupeSanguinRhesus  || undefined,
        statutReanimatoire:   form.statutReanimatoire   || undefined,
        directivesAnticipees: form.directivesAnticipees,
      });
      onSaved();
    } catch (e: any) { setErr(e?.message ?? 'Erreur.'); } finally { setSaving(false); }
  }

  return (
    <Modal title="Données critiques" onClose={onClose}>
      {err && <div className="adm-alert adm-alert-error" style={{ marginBottom: 12 }}>{err}</div>}
      <p style={{ margin: '0 0 12px', fontSize: 11, color: '#ef4444' }}>
        Le groupe sanguin ne remplace jamais la double détermination biologique avant toute transfusion.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div className="adm-form-field">
          <label className="adm-label">Groupe sanguin</label>
          <select className="adm-input" value={form.groupeSanguinAbo} onChange={e => setForm(f => ({ ...f, groupeSanguinAbo: e.target.value }))}>
            <option value="">— Sélectionner —</option>
            {GROUPE_SANGUIN.map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div className="adm-form-field">
          <label className="adm-label">Rhésus</label>
          <select className="adm-input" value={form.groupeSanguinRhesus} onChange={e => setForm(f => ({ ...f, groupeSanguinRhesus: e.target.value }))}>
            <option value="">— Sélectionner —</option>
            {RHESUS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>
      <div className="adm-form-field" style={{ marginBottom: 12 }}>
        <label className="adm-label">Directive réanimation</label>
        <select className="adm-input" value={form.statutReanimatoire} onChange={e => setForm(f => ({ ...f, statutReanimatoire: e.target.value }))}>
          <option value="">— Sélectionner —</option>
          {STATUT_REANIM.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <input type="checkbox" id="directives" checked={form.directivesAnticipees}
          onChange={e => setForm(f => ({ ...f, directivesAnticipees: e.target.checked }))} />
        <label htmlFor="directives" style={{ fontSize: 12, color: 'var(--c-t1)' }}>
          Directives anticipées renseignées
        </label>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid var(--c-bdr)', paddingTop: 12 }}>
        <button onClick={onClose} className="adm-btn" style={{ height: 34 }}>Annuler</button>
        <button onClick={save} disabled={saving} className="adm-btn adm-btn-primary" style={{ height: 34, gap: 6 }}>
          <Save size={13} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODAL — Allergies
// ══════════════════════════════════════════════════════════════════════════════

function ModalAllergies({ patientId, items, onClose, onChanged }: {
  patientId: string; items: Allergie[]; onClose: () => void; onChanged: () => void;
}) {
  const [form, setForm] = useState({ allergene: '', typeReaction: '', severite: '', dateDecouverte: '' });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState<string | null>(null);

  async function add() {
    if (!form.allergene.trim()) { setErr('L\'allergène est obligatoire.'); return; }
    setSaving(true); setErr(null);
    try {
      await client.post(`/patients/${patientId}/allergies`, {
        allergene:      form.allergene.trim(),
        typeReaction:   form.typeReaction   || undefined,
        severite:       form.severite       || undefined,
        dateDecouverte: form.dateDecouverte || undefined,
      });
      setForm({ allergene: '', typeReaction: '', severite: '', dateDecouverte: '' });
      onChanged();
    } catch (e: any) { setErr(e?.message ?? 'Erreur.'); } finally { setSaving(false); }
  }

  async function del(aid: string) {
    try { await client.delete(`/patients/${patientId}/allergies/${aid}`); onChanged(); } catch { /* silent */ }
  }

  return (
    <Modal title="Allergies connues" onClose={onClose}>
      {items.length === 0
        ? <p style={{ fontSize: 12, color: 'var(--c-t3)', fontStyle: 'italic', marginBottom: 12 }}>Aucune allergie enregistrée.</p>
        : items.map(a => (
          <EntryRow key={a.id}
            label={a.allergene}
            sub={[a.severite, a.typeReaction, a.dateDecouverte ? new Date(a.dateDecouverte).toLocaleDateString('fr-FR') : ''].filter(Boolean).join(' · ')}
            onDelete={() => del(a.id)}
          />
        ))
      }
      <Divider />
      <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, color: 'var(--c-t1)' }}>Ajouter une allergie</p>
      {err && <div className="adm-alert adm-alert-error" style={{ marginBottom: 10 }}>{err}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="adm-form-field">
          <label className="adm-label">Allergène *</label>
          <input className="adm-input" value={form.allergene} onChange={e => setForm(f => ({ ...f, allergene: e.target.value }))} />
        </div>
        <div className="adm-form-field">
          <label className="adm-label">Type de réaction</label>
          <input className="adm-input" value={form.typeReaction} onChange={e => setForm(f => ({ ...f, typeReaction: e.target.value }))} />
        </div>
        <div className="adm-form-field">
          <label className="adm-label">Sévérité</label>
          <select className="adm-input" value={form.severite} onChange={e => setForm(f => ({ ...f, severite: e.target.value }))}>
            <option value="">—</option>
            {SEVERITE_ALLERGIE.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="adm-form-field">
          <label className="adm-label">Date de découverte</label>
          <input type="date" className="adm-input" value={form.dateDecouverte} onChange={e => setForm(f => ({ ...f, dateDecouverte: e.target.value }))} />
        </div>
      </div>
      <button onClick={add} disabled={saving} className="adm-btn adm-btn-primary" style={{ marginTop: 12, height: 34, gap: 6 }}>
        <Plus size={13} /> {saving ? 'Ajout…' : 'Ajouter'}
      </button>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODAL — Traitements à risque
// ══════════════════════════════════════════════════════════════════════════════

function ModalTraitements({ patientId, items, onClose, onChanged }: {
  patientId: string; items: Traitement[]; onClose: () => void; onChanged: () => void;
}) {
  const [form, setForm] = useState({ nomMedicament: '', classe: '', posologieEnCours: '', niveauAlerte: '' });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState<string | null>(null);

  async function add() {
    if (!form.nomMedicament.trim()) { setErr('Le médicament est obligatoire.'); return; }
    setSaving(true); setErr(null);
    try {
      await client.post(`/patients/${patientId}/traitements`, {
        nomMedicament:    form.nomMedicament.trim(),
        classe:           form.classe            || undefined,
        posologieEnCours: form.posologieEnCours  || undefined,
        niveauAlerte:     form.niveauAlerte      || undefined,
      });
      setForm({ nomMedicament: '', classe: '', posologieEnCours: '', niveauAlerte: '' });
      onChanged();
    } catch (e: any) { setErr(e?.message ?? 'Erreur.'); } finally { setSaving(false); }
  }

  async function del(tid: string) {
    try { await client.delete(`/patients/${patientId}/traitements/${tid}`); onChanged(); } catch { /* silent */ }
  }

  return (
    <Modal title="Traitements à risque" onClose={onClose}>
      {items.length === 0
        ? <p style={{ fontSize: 12, color: 'var(--c-t3)', fontStyle: 'italic', marginBottom: 12 }}>Aucun traitement enregistré.</p>
        : items.map(t => (
          <EntryRow key={t.id}
            label={t.nomMedicament}
            sub={[t.classe, t.posologieEnCours, t.niveauAlerte].filter(Boolean).join(' · ')}
            onDelete={() => del(t.id)}
          />
        ))
      }
      <Divider />
      <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, color: 'var(--c-t1)' }}>Ajouter un traitement</p>
      {err && <div className="adm-alert adm-alert-error" style={{ marginBottom: 10 }}>{err}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="adm-form-field">
          <label className="adm-label">Médicament *</label>
          <input className="adm-input" value={form.nomMedicament} onChange={e => setForm(f => ({ ...f, nomMedicament: e.target.value }))} />
        </div>
        <div className="adm-form-field">
          <label className="adm-label">Classe thérapeutique</label>
          <input className="adm-input" value={form.classe} onChange={e => setForm(f => ({ ...f, classe: e.target.value }))} />
        </div>
        <div className="adm-form-field">
          <label className="adm-label">Posologie en cours</label>
          <input className="adm-input" value={form.posologieEnCours} onChange={e => setForm(f => ({ ...f, posologieEnCours: e.target.value }))} />
        </div>
        <div className="adm-form-field">
          <label className="adm-label">Niveau d'alerte</label>
          <select className="adm-input" value={form.niveauAlerte} onChange={e => setForm(f => ({ ...f, niveauAlerte: e.target.value }))}>
            <option value="">—</option>
            {NIVEAU_ALERTE_TRT.map(n => <option key={n}>{n}</option>)}
          </select>
        </div>
      </div>
      <button onClick={add} disabled={saving} className="adm-btn adm-btn-primary" style={{ marginTop: 12, height: 34, gap: 6 }}>
        <Plus size={13} /> {saving ? 'Ajout…' : 'Ajouter'}
      </button>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODAL — Contacts d'urgence
// ══════════════════════════════════════════════════════════════════════════════

function ModalContacts({ patientId, items, onClose, onChanged }: {
  patientId: string; items: Contact[]; onClose: () => void; onChanged: () => void;
}) {
  const [form, setForm] = useState({ nom: '', prenom: '', lienParente: '', telephone: '', estPersonneConfiance: false });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState<string | null>(null);

  async function add() {
    if (!form.nom.trim() || !form.prenom.trim() || !form.telephone.trim() || !form.lienParente.trim()) {
      setErr('Nom, prénom, lien et téléphone sont obligatoires.');
      return;
    }
    setSaving(true); setErr(null);
    try {
      await client.post(`/patients/${patientId}/contacts`, form);
      setForm({ nom: '', prenom: '', lienParente: '', telephone: '', estPersonneConfiance: false });
      onChanged();
    } catch (e: any) { setErr(e?.message ?? 'Erreur.'); } finally { setSaving(false); }
  }

  async function del(cid: string) {
    try { await client.delete(`/patients/${patientId}/contacts/${cid}`); onChanged(); } catch { /* silent */ }
  }

  return (
    <Modal title="Contacts d'urgence" onClose={onClose}>
      {items.length === 0
        ? <p style={{ fontSize: 12, color: 'var(--c-t3)', fontStyle: 'italic', marginBottom: 12 }}>Aucun contact enregistré.</p>
        : items.map(c => (
          <EntryRow key={c.id}
            label={`${c.prenom} ${c.nom}${c.estPersonneConfiance ? ' ★' : ''}`}
            sub={`${c.lienParente} · ${c.telephone}`}
            onDelete={() => del(c.id)}
          />
        ))
      }
      <Divider />
      <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, color: 'var(--c-t1)' }}>Ajouter un contact</p>
      {err && <div className="adm-alert adm-alert-error" style={{ marginBottom: 10 }}>{err}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="adm-form-field">
          <label className="adm-label">Nom *</label>
          <input className="adm-input" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
        </div>
        <div className="adm-form-field">
          <label className="adm-label">Prénom *</label>
          <input className="adm-input" value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} />
        </div>
        <div className="adm-form-field">
          <label className="adm-label">Lien de parenté *</label>
          <input className="adm-input" value={form.lienParente} onChange={e => setForm(f => ({ ...f, lienParente: e.target.value }))} />
        </div>
        <div className="adm-form-field">
          <label className="adm-label">Téléphone *</label>
          <input className="adm-input" placeholder="+229 97 …" value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '10px 0 12px' }}>
        <input type="checkbox" id="confiance" checked={form.estPersonneConfiance}
          onChange={e => setForm(f => ({ ...f, estPersonneConfiance: e.target.checked }))} />
        <label htmlFor="confiance" style={{ fontSize: 12, color: 'var(--c-t1)' }}>Personne de confiance désignée</label>
      </div>
      <button onClick={add} disabled={saving} className="adm-btn adm-btn-primary" style={{ height: 34, gap: 6 }}>
        <Plus size={13} /> {saving ? 'Ajout…' : 'Ajouter'}
      </button>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODAL — Couverture sociale
// ══════════════════════════════════════════════════════════════════════════════

function ModalCouvertures({ patientId, items, onClose, onChanged }: {
  patientId: string; items: Couverture[]; onClose: () => void; onChanged: () => void;
}) {
  const [form, setForm] = useState({ typeCouverture: '', nomOrganisme: '', numeroAssure: '', statut: '', dateDebut: '' });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState<string | null>(null);

  async function add() {
    if (!form.typeCouverture.trim() || !form.nomOrganisme.trim() || !form.numeroAssure.trim() || !form.statut || !form.dateDebut) {
      setErr('Tous les champs obligatoires doivent être remplis.'); return;
    }
    setSaving(true); setErr(null);
    try {
      await client.post(`/patients/${patientId}/couvertures`, { ...form, estActive: true });
      setForm({ typeCouverture: '', nomOrganisme: '', numeroAssure: '', statut: '', dateDebut: '' });
      onChanged();
    } catch (e: any) { setErr(e?.message ?? 'Erreur.'); } finally { setSaving(false); }
  }

  async function toggleActif(cid: string, estActive: boolean) {
    try { await client.patch(`/patients/${patientId}/couvertures/${cid}`, { estActive: !estActive }); onChanged(); } catch { /* silent */ }
  }

  return (
    <Modal title="Couverture sociale" onClose={onClose}>
      {items.length === 0
        ? <p style={{ fontSize: 12, color: 'var(--c-t3)', fontStyle: 'italic', marginBottom: 12 }}>Aucune couverture enregistrée.</p>
        : items.map(c => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--c-surf2)', borderRadius: 8, marginBottom: 6 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--c-t1)' }}>{c.nomOrganisme}</p>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--c-t3)' }}>{c.typeCouverture} · N°{c.numeroAssure}</p>
            </div>
            <button onClick={() => toggleActif(c.id, c.estActive)} style={{
              fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99, border: 'none', cursor: 'pointer',
              background: c.estActive ? '#dcfce7' : '#f1f5f9', color: c.estActive ? '#166534' : '#64748b',
            }}>
              {c.estActive ? 'Active' : 'Inactive'}
            </button>
          </div>
        ))
      }
      <Divider />
      <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, color: 'var(--c-t1)' }}>Ajouter une couverture</p>
      {err && <div className="adm-alert adm-alert-error" style={{ marginBottom: 10 }}>{err}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="adm-form-field">
          <label className="adm-label">Type *</label>
          <input className="adm-input" value={form.typeCouverture} onChange={e => setForm(f => ({ ...f, typeCouverture: e.target.value }))} />
        </div>
        <div className="adm-form-field">
          <label className="adm-label">Organisme *</label>
          <input className="adm-input" value={form.nomOrganisme} onChange={e => setForm(f => ({ ...f, nomOrganisme: e.target.value }))} />
        </div>
        <div className="adm-form-field">
          <label className="adm-label">N° Assuré *</label>
          <input className="adm-input" value={form.numeroAssure} onChange={e => setForm(f => ({ ...f, numeroAssure: e.target.value }))} />
        </div>
        <div className="adm-form-field">
          <label className="adm-label">Statut *</label>
          <select className="adm-input" value={form.statut} onChange={e => setForm(f => ({ ...f, statut: e.target.value }))}>
            <option value="">—</option>
            {STATUT_COUVERTURE.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="adm-form-field">
          <label className="adm-label">Date de début *</label>
          <input type="date" className="adm-input" value={form.dateDebut} onChange={e => setForm(f => ({ ...f, dateDebut: e.target.value }))} />
        </div>
      </div>
      <button onClick={add} disabled={saving} className="adm-btn adm-btn-primary" style={{ marginTop: 12, height: 34, gap: 6 }}>
        <Plus size={13} /> {saving ? 'Ajout…' : 'Ajouter'}
      </button>
    </Modal>
  );
}

// MODAL — Diagnostics
// ══════════════════════════════════════════════════════════════════════════════

function ModalDiagnostics({ sejour, items, onClose, onChanged }: {
  sejour: Sejour | null; items: Diagnostic[]; onClose: () => void; onChanged: () => void;
}) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ codeCim10: '', libelle: '', statut: 'Suspecté' });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState<string | null>(null);

  async function add() {
    if (!sejour) return;
    if (!form.codeCim10.trim() || !form.libelle.trim()) { setErr('Code CIM-10 et libellé sont obligatoires.'); return; }
    setSaving(true); setErr(null);
    try {
      await client.post(`/sejours/${sejour.id}/diagnostics`, {
        ...form,
        type: 'Principal',
        dateDiagnostic: today,
      });
      setForm({ codeCim10: '', libelle: '', statut: 'Suspecté' });
      onChanged();
    } catch (e: any) { setErr(e?.message ?? 'Erreur.'); } finally { setSaving(false); }
  }

  if (!sejour) return (
    <Modal title="Diagnostics" onClose={onClose}>
      <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--c-t3)' }}>
        <Stethoscope size={28} style={{ marginBottom: 8 }} />
        <p style={{ margin: 0, fontSize: 13 }}>Aucun séjour actif pour ce patient.</p>
        <p style={{ margin: '4px 0 0', fontSize: 11 }}>Un diagnostic doit être rattaché à un séjour en cours.</p>
      </div>
    </Modal>
  );

  return (
    <Modal title="Diagnostics" onClose={onClose}>
      <p style={{ margin: '0 0 10px', fontSize: 11, color: 'var(--c-t3)' }}>
        Séjour : <strong>{sejour.numeroSejour}</strong> · {sejour.typeSejour ?? 'Hospitalisation'} · Admis le {new Date(sejour.dateAdmission).toLocaleDateString('fr-FR')}
      </p>
      {items.length === 0
        ? <p style={{ fontSize: 12, color: 'var(--c-t3)', fontStyle: 'italic', marginBottom: 12 }}>Aucun diagnostic enregistré pour ce séjour.</p>
        : items.map(d => (
          <div key={d.id} style={{ padding: '8px 12px', background: 'var(--c-surf2)', borderRadius: 8, marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace', color: 'var(--c-accent)' }}>{d.codeCim10}</span>
              <span style={{ fontSize: 10, background: 'var(--c-bdr)', borderRadius: 99, padding: '1px 7px', color: 'var(--c-t2)' }}>{d.statut}</span>
            </div>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--c-t1)' }}>{d.libelle}</p>
          </div>
        ))
      }
      <Divider />
      <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, color: 'var(--c-t1)' }}>Saisir un diagnostic</p>
      {err && <div className="adm-alert adm-alert-error" style={{ marginBottom: 10 }}>{err}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
        <div className="adm-form-field">
          <label className="adm-label">Code CIM-10 *</label>
          <CIM10Input
            value={form.codeCim10}
            onChange={v => setForm(f => ({ ...f, codeCim10: v }))}
            onSelect={(entry: CIM10Entry) => setForm(f => ({ ...f, codeCim10: entry.code, libelle: entry.libelle }))}
            placeholder="F00-F99, K35, grippe…"
          />
        </div>
        <div className="adm-form-field">
          <label className="adm-label">Libellé *</label>
          <input className="adm-input" value={form.libelle} onChange={e => setForm(f => ({ ...f, libelle: e.target.value }))} />
        </div>
        <div className="adm-form-field" style={{ gridColumn: '1 / -1' }}>
          <label className="adm-label">Statut</label>
          <select className="adm-input" value={form.statut} onChange={e => setForm(f => ({ ...f, statut: e.target.value }))}>
            {STATUT_DIAGNOSTIC.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <button onClick={add} disabled={saving} className="adm-btn adm-btn-primary" style={{ marginTop: 12, height: 34, gap: 6 }}>
        <Plus size={13} /> {saving ? 'Enregistrement…' : 'Enregistrer le diagnostic'}
      </button>
    </Modal>
  );
}
