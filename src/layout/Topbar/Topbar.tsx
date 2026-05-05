import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export const Topbar = ({ minimized, onToggleSidebar }: {
  minimized: boolean;
  onToggleSidebar: () => void;
}) => {
  const { dark, toggle } = useTheme();
  const { user, logout } = useAuth();

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

        <button className="adm-icon-btn" title="Notifications">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <div className="adm-notif-badge" />
        </button>

        <button className="adm-icon-btn" onClick={toggle} title={dark ? 'Mode clair' : 'Mode sombre'}>
          {dark ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>

        <div className="adm-user-btn">
          <div className="adm-avatar">{initiales}</div>
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
