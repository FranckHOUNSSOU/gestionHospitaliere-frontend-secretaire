import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import client from '../../services/clients';

interface ProfilData {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  pole: { id: string; nom: string } | null;
  service: { id: string; nom: string } | null;
  telephone: string | null;
  numeroOrdre: string | null;
  photoUrl?: string | null;
  createdAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  ADMINISTRATEUR:      'Administrateur système',
  MEDECIN:             'Médecin',
  AGENT_ADMINISTRATIF: 'Agent Administratif',
  AGENT_RENSEIGNEMENT: 'Agent de Renseignement',
};

export default function ProfilPage() {
  const { user } = useAuth();
  const [profil, setProfil]   = useState<ProfilData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '' });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    client.get<ProfilData>('/auth/profil')
      .then(r => {
        setProfil(r.data);
        setForm({ nom: r.data.nom, prenom: r.data.prenom, email: r.data.email, telephone: r.data.telephone ?? '' });
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
      await client.patch(`/auth/users/${profil.id}`, patch);
      setProfil(p => p ? { ...p, ...patch } : p);
      setSuccess('Profil mis à jour avec succès.');
      setEditing(false);
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Erreur lors de la mise à jour.');
    } finally { setSaving(false); }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('La photo ne doit pas dépasser 5 Mo.'); return; }
    setUploading(true); setError(null);
    try {
      const fd = new FormData();
      fd.append('fichier', file);
      const res = await client.post<{ url: string }>('/auth/profil/photo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfil(p => p ? { ...p, photoUrl: res.data.url } : p);
      window.dispatchEvent(new CustomEvent('userPhotoUpdated', { detail: { url: res.data.url } }));
      setSuccess('Photo de profil mise à jour.');
    } catch (err: unknown) {
      setError((err as Error).message ?? "Erreur lors de l'upload.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const initiales = profil
    ? `${profil.prenom[0] ?? ''}${profil.nom[0] ?? ''}`.toUpperCase()
    : `${user?.prenom?.[0] ?? ''}${user?.nom?.[0] ?? ''}`.toUpperCase() || 'AA';

  return (
    <div className="adm-main">
      <div style={{ marginBottom: 24 }}>
        <h1 className="adm-page-title">Mon profil</h1>
        <p className="adm-page-sub">Consultez et modifiez vos informations personnelles</p>
      </div>

      {error   && <Alert type="error"   message={error}   onClose={() => setError(null)}   />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--c-t2)', fontSize: 13 }}>
          Chargement du profil…
        </div>
      ) : profil ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Carte identité */}
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
                    <EditIcon /> Modifier
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

          {/* Informations éditables */}
          <div className="adm-card">
            <div className="adm-card-head">
              <div>
                <p className="adm-card-title">Informations personnelles</p>
                <p className="adm-card-sub">Nom, prénom, email et téléphone</p>
              </div>
            </div>
            <div className="adm-card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
              <FieldRow label="Nom"           value={form.nom}       editing={editing} onChange={set('nom')}       />
              <FieldRow label="Prénom"        value={form.prenom}    editing={editing} onChange={set('prenom')}    />
              <FieldRow label="Adresse email" value={form.email}     editing={editing} onChange={set('email')}     type="email" />
              <FieldRow label="Téléphone"     value={form.telephone} editing={editing} onChange={set('telephone')} placeholder="Non renseigné" />
            </div>
          </div>

          {/* Informations de compte (lecture seule) */}
          <div className="adm-card">
            <div className="adm-card-head">
              <div>
                <p className="adm-card-title">Informations de compte</p>
                <p className="adm-card-sub">Ces informations sont gérées par le système</p>
              </div>
            </div>
            <div className="adm-card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
              <ReadRow label="Rôle"                    value={ROLE_LABELS[profil.role] ?? profil.role} />
              <ReadRow label="Pôle hospitalier"        value={profil.pole?.nom ?? '—'} />
              <ReadRow label="Service"                 value={profil.service?.nom ?? '—'} />
              <ReadRow label="N° d'ordre professionnel" value={profil.numeroOrdre ?? '—'} />
              <ReadRow
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

// ── Sous-composants ────────────────────────────────────────────────────────────

function Alert({ type, message, onClose }: {
  type: 'error' | 'success'; message: string; onClose: () => void;
}) {
  const isErr = type === 'error';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px', borderRadius: 8, marginBottom: 16,
      background: isErr ? 'var(--c-red-bg)' : 'var(--c-green-bg)',
      color: isErr ? 'var(--c-red)' : 'var(--c-green)',
      fontSize: 12, border: `1px solid ${isErr ? 'var(--c-red)' : 'var(--c-green-bd)'}`,
    }}>
      {isErr
        ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
      }
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 16, lineHeight: 1, padding: '2px 4px' }}>×</button>
    </div>
  );
}

function FieldRow({ label, value, editing, onChange, type = 'text', placeholder }: {
  label: string; value: string; editing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div>
      <p style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--c-t3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
        {label}
      </p>
      {editing ? (
        <input
          type={type} value={value} onChange={onChange} placeholder={placeholder}
          style={{
            width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 13,
            border: '1px solid var(--c-bdr)', background: 'var(--c-surf2)',
            color: 'var(--c-t0)', outline: 'none', fontFamily: 'Roboto, system-ui, sans-serif',
          }}
        />
      ) : (
        <p style={{ fontSize: 13, color: value ? 'var(--c-t0)' : 'var(--c-t3)' }}>
          {value || (placeholder ?? '—')}
        </p>
      )}
    </div>
  );
}

function ReadRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--c-t3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
        {label}
      </p>
      <p style={{ fontSize: 13, color: 'var(--c-t0)' }}>{value}</p>
    </div>
  );
}

function EditIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}
