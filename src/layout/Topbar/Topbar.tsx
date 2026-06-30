import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAuth } from '../../services/getAuth';
import { getNotification } from '../../services/getNotification';

export const Topbar = ({ minimized, onToggleSidebar }: {
  minimized: boolean;
  onToggleSidebar: () => void;
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [nonLu, setNonLu] = useState(0);
  const [photoUrl, setPhotoUrl] = useState(null as any);

  useEffect(() => {
    getNotification.countNonLu().then(data => setNonLu(data.count)).catch(() => {});
    const interval = setInterval(() => {
      getNotification.countNonLu().then(data => setNonLu(data.count)).catch(() => {});
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user) return;
    getAuth.getProfil()
      .then(data => setPhotoUrl(data.photoUrl ?? null))
      .catch(() => setPhotoUrl(null));
  }, [user]);

  useEffect(() => {
    const handler = (e: Event) => setPhotoUrl((e as CustomEvent).detail.url);
    window.addEventListener('userPhotoUpdated', handler);
    return () => window.removeEventListener('userPhotoUpdated', handler);
  }, []);

  const initiales = user
    ? `${user.nom?.[0] ?? ''}${user.prenom?.[0] ?? ''}`.toUpperCase()
    : 'AA';
  const nomComplet = user ? `${user.prenom} ${user.nom}` : 'Agent Administratif';

  return (
    <div className="adm-topbar">
      <div className="adm-topbar-l">
        <div className="adm-logo">
          <img src="/chuMel-logo.png" alt="CHU-MEL" style={{ height: 46, width: 'auto' }} />
          <span className="adm-logo-name">CHU-MEL</span>
        </div>
        <button
          className="adm-topbar-sidebar-toggle"
          onClick={onToggleSidebar}
          title={minimized ? 'Agrandir le menu' : 'Réduire le menu'}
        >
          {minimized ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          )}
        </button>
      </div>

      <div className="adm-topbar-r">
        <div className="adm-online-pill">
          <div className="adm-online-dot" />
          Système opérationnel
        </div>

        <button className="adm-icon-btn" title="Notifications" onClick={() => navigate('/notifications')} style={{ position: 'relative' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {nonLu > 0 && (
            <span style={{
              position: 'absolute', top: 2, right: 2,
              minWidth: 16, height: 16, borderRadius: 99,
              background: '#ef4444', color: '#fff',
              fontSize: 9, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 3px',
            }}>
              {nonLu > 99 ? '99+' : nonLu}
            </span>
          )}
        </button>

        <div className="adm-user-btn">
          <div className="adm-avatar" style={photoUrl ? { background: 'none', padding: 0, overflow: 'hidden' } : undefined}>
            {photoUrl
              ? <img src={photoUrl} alt={initiales} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : initiales
            }
          </div>
          <div>
            <div className="adm-user-name">{nomComplet}</div>
            <div className="adm-user-role">Agent Administratif</div>
          </div>
        </div>

        <button className="adm-icon-btn" onClick={logout} title="Déconnexion">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </div>
  );
};
