import { NavLink } from 'react-router-dom';

export default function SidebarItem({ to, icon, label, minimized, fontSize }: {
  to: string; icon: any; label: string; fontSize?: number; minimized?: boolean;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `adm-nav-link${isActive ? ' active' : ''}`}
      title={minimized ? label : undefined}
    >
      <span className="adm-nav-icon">{icon}</span>
      <span className="adm-nav-label" style={{ fontSize }}>{label}</span>
    </NavLink>
  );
}
