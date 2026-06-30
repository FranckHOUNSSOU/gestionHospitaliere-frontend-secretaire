import { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { getNotification } from '../../services/getNotification';
import { patchNotification } from '../../services/patchNotification';

function fdt(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function NotificationsPage() {
  const [notifs,   setNotifs]   = useState([]);
  const [loading,  setLoading]  = useState(true);

  async function load() {
    try {
      const data = await getNotification.getMesNotifications();
      setNotifs(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleLireTout() {
    await patchNotification.marquerToutLu();
    setNotifs((prev: any[]) => prev.map(n => ({ ...n, lu: true })));
  }

  async function handleLire(id: string) {
    await patchNotification.marquerLu(id);
    setNotifs((prev: any[]) => prev.map(n => n.id === id ? { ...n, lu: true } : n));
  }

  const nonLues = (notifs as any[]).filter(n => !n.lu).length;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 18, color: 'var(--c-t0)' }}>Notifications</p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--c-t3)' }}>
            {nonLues > 0 ? `${nonLues} non lue${nonLues > 1 ? 's' : ''}` : 'Tout est à jour'}
          </p>
        </div>
        {nonLues > 0 && (
          <button onClick={handleLireTout} className="adm-btn" style={{ gap: 6, height: 34, fontSize: 12 }}>
            <CheckCheck size={14} /> Tout marquer comme lu
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--c-t3)' }}>Chargement…</div>
      ) : notifs.length === 0 ? (
        <div className="adm-card" style={{ textAlign: 'center', padding: 48 }}>
          <Bell size={32} style={{ color: 'var(--c-t3)', marginBottom: 12 }} />
          <p style={{ margin: 0, fontSize: 14, color: 'var(--c-t3)' }}>Aucune notification</p>
        </div>
      ) : (
        <div className="adm-card">
          {(notifs as any[]).map((n, i) => (
            <div
              key={n.id}
              onClick={() => !n.lu && handleLire(n.id)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '14px 16px',
                borderBottom: i < notifs.length - 1 ? '1px solid var(--c-bdr)' : 'none',
                background: n.lu ? 'transparent' : 'rgba(99,102,241,0.04)',
                cursor: n.lu ? 'default' : 'pointer',
                transition: 'background 0.12s',
              }}
            >
              <div style={{
                width: 8, height: 8, borderRadius: '50%', marginTop: 6, flexShrink: 0,
                background: n.lu ? 'transparent' : 'var(--c-primary)',
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--c-t1)', lineHeight: 1.5 }}>
                  {n.message}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--c-t3)' }}>
                  {fdt(n.createdAt)}
                </p>
              </div>
              {!n.lu && (
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-primary)', background: 'rgba(99,102,241,0.12)', borderRadius: 99, padding: '2px 8px', flexShrink: 0 }}>
                  Nouveau
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
