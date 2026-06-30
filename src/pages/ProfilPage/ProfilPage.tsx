import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAuth } from '../../services/getAuth';
import { patchAuth } from '../../services/patchAuth';
import { postAuth } from '../../services/postAuth';
import ProfilAlert from './ProfilAlert';
import ProfilFieldRow from './ProfilFieldRow';
import ProfilReadRow from './ProfilReadRow';
import ProfilEditIcon from './ProfilEditIcon';

const ROLE_LABELS: Record<string, string> = {
  ADMINISTRATEUR:      'Administrateur système',
  MEDECIN:             'Médecin',
  AGENT_ADMINISTRATIF: 'Agent Administratif',
  AGENT_RENSEIGNEMENT: 'Agent de Renseignement',
};

export default function ProfilPage() {
  const { user } = useAuth();
  const [profil, setProfil]   = useState(null as any);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState(null as any);
  const [success, setSuccess] = useState(null as any);
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '' });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null as any);

  useEffect(() => {
    getAuth.getProfil()
      .then(data => {
        setProfil(data);
        setForm({ nom: data.nom, prenom: data.prenom, email: data.email, telephone: data.telephone ?? '' });
      })
      .catch(() => setError('Impossible de charger le profil.'))
      .finally(() => setLoading(false));
  }, []);

  const startEdit  = () => { setEditing(true); setSuccess(null); setError(null); };
  const cancelEdit = () => {
    if (!profil) return;
    setEditing(false);
    setForm({ nom: profil.nom, prenom: profil.prenom, email: profil.email, telephone: profil.telephone ?? '' });
    setError(null);
  };

  const handleSave = async () => {
    if (!profil) return;
    const patch: Record<string, string> = {};
    if (form.nom.trim()       !== profil.nom)               patch.nom       = form.nom.trim();
    if (form.prenom.trim()    !== profil.prenom)            patch.prenom    = form.prenom.trim();
    if (form.email.trim()     !== profil.email)             patch.email     = form.email.trim();
    if (form.telephone.trim() !== (profil.telephone ?? '')) patch.telephone = form.telephone.trim();
    if (Object.keys(patch).length === 0) { setEditing(false); return; }
    setSaving(true); setError(null);
    try {
      await patchAuth.updateUser(profil.id, patch);
      setProfil((p: any) => p ? { ...p, ...patch } : p);
      setSuccess('Profil mis à jour avec succès.');
      setEditing(false);
    } catch (err: any) {
      setError(err?.message ?? 'Erreur lors de la mise à jour.');
    } finally { setSaving(false); }
  };

  const handlePhotoChange = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('La photo ne doit pas dépasser 5 Mo.'); return; }
    setUploading(true); setError(null);
    try {
      const fd = new FormData();
      fd.append('fichier', file);
      const res = await postAuth.uploadPhoto(fd);
      setProfil((p: any) => p ? { ...p, photoUrl: res.url } : p);
      window.dispatchEvent(new CustomEvent('userPhotoUpdated', { detail: { url: res.url } }));
      setSuccess('Photo de profil mise à jour.');
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors de l'upload.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const set = (k: any) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }));

  const initiales = profil
    ? `${profil.prenom[0] ?? ''}${profil.nom[0] ?? ''}`.toUpperCase()
    : `${user?.prenom?.[0] ?? ''}${user?.nom?.[0] ?? ''}`.toUpperCase() || 'AA';

  return (
    <div className="adm-main">
      <div style={{ marginBottom: 24 }}>
        <h1 className="adm-page-title">Mon profil</h1>
        <p className="adm-page-sub">Consultez et modifiez vos informations personnelles</p>
      </div>

      {error   && <ProfilAlert type="error"   message={error}   onClose={() => setError(null)}   />}
      {success && <ProfilAlert type="success" message={success} onClose={() => setSuccess(null)} />}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--c-t2)', fontSize: 13 }}>
          Chargement du profil…
        </div>
      ) : profil ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div className="adm-card">
            <div className="adm-card-body" style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: 16, overflow: 'hidden',
                  background: 'var(--c-accent)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
                }}>
                  {profil.photoUrl
                    ? <img src={profil.photoUrl} alt={initiales} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : initiales
                  }
                </div>
                <button
                  title={uploading ? 'Upload en cours…' : 'Changer la photo'}
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  style={{
                    position: 'absolute', bottom: -4, right: -4,
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'var(--c-accent)', border: '2px solid var(--c-surf)',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', padding: 0,
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
              </div>

              <div style={{ flex: 1, minWidth: 160 }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--c-t0)', marginBottom: 4 }}>
                  {profil.prenom} {profil.nom}
                </p>
                <p style={{ fontSize: 12, color: 'var(--c-t2)', marginBottom: 10 }}>{profil.email}</p>
                <span style={{
                  padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                  background: 'var(--c-accent-bg)', color: 'var(--c-accent)',
                  border: '1px solid var(--c-accent-bd)', display: 'inline-block',
                }}>
                  {ROLE_LABELS[profil.role] ?? profil.role}
                </span>
              </div>
              <div style={{ flexShrink: 0 }}>
                {!editing ? (
                  <button className="adm-btn adm-btn-primary" onClick={startEdit}>
                    <ProfilEditIcon /> Modifier
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="adm-btn" onClick={cancelEdit}>Annuler</button>
                    <button className="adm-btn adm-btn-primary" onClick={handleSave} disabled={saving}>
                      {saving ? 'Enregistrement…' : 'Enregistrer'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="adm-card">
            <div className="adm-card-head">
              <div>
                <p className="adm-card-title">Informations personnelles</p>
                <p className="adm-card-sub">Nom, prénom, email et téléphone</p>
              </div>
            </div>
            <div className="adm-card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
              <ProfilFieldRow label="Nom"           value={form.nom}       editing={editing} onChange={set('nom')}       />
              <ProfilFieldRow label="Prénom"        value={form.prenom}    editing={editing} onChange={set('prenom')}    />
              <ProfilFieldRow label="Adresse email" value={form.email}     editing={editing} onChange={set('email')}     type="email" />
              <ProfilFieldRow label="Téléphone"     value={form.telephone} editing={editing} onChange={set('telephone')} placeholder="Non renseigné" />
            </div>
          </div>

          <div className="adm-card">
            <div className="adm-card-head">
              <div>
                <p className="adm-card-title">Informations de compte</p>
                <p className="adm-card-sub">Ces informations sont gérées par le système</p>
              </div>
            </div>
            <div className="adm-card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
              <ProfilReadRow label="Rôle"                    value={ROLE_LABELS[profil.role] ?? profil.role} />
              <ProfilReadRow label="Pôle hospitalier"        value={profil.pole?.nom ?? '—'} />
              <ProfilReadRow label="Service"                 value={profil.service?.nom ?? '—'} />
              <ProfilReadRow label="N° d'ordre professionnel" value={profil.numeroOrdre ?? '—'} />
              <ProfilReadRow
                label="Membre depuis"
                value={new Date(profil.createdAt).toLocaleDateString('fr-FR', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              />
            </div>
          </div>

        </div>
      ) : !error ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--c-t2)', fontSize: 13 }}>
          Profil introuvable.
        </div>
      ) : null}
    </div>
  );
}
