import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useState } from 'react';

const Item = ({ to, icon, label, minimized, fontSize }: {
  to: string; icon: ReactNode; label: string; fontSize?: number; minimized?: boolean;
}) => (
  <NavLink
    to={to}
    className={({ isActive }) => `adm-nav-link${isActive ? ' active' : ''}`}
    title={minimized ? label : undefined}
  >
    <span className="adm-nav-icon">{icon}</span>
    <span className="adm-nav-label" style={{ fontSize }}>{label}</span>
  </NavLink>
);

export const Sidebar = () => {
  const [minimized, setMinimized] = useState(false);

  return (
    <div className={`adm-sidebar${minimized ? ' adm-sidebar--min' : ''}`}>
      <div className="adm-sidebar-toggle-wrap">
        <button className="adm-sidebar-toggle" onClick={() => setMinimized(m => !m)}
          title={minimized ? 'Agrandir' : 'Réduire'}>
          {minimized ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          )}
        </button>
      </div>

      <div className="adm-nav-sec">Tableau de bord</div>
      <Item to="/dashboard" minimized={minimized} fontSize={13} icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
        </svg>
      } label="Vue d'ensemble" />

      <div className="adm-nav-sec">Patients</div>
      <Item to="/patients" minimized={minimized} fontSize={13} icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      } label="Liste des patients" />
      <Item to="/patients/new" minimized={minimized} fontSize={13} icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          <line x1="12" y1="13" x2="12" y2="19"/><line x1="9" y1="16" x2="15" y2="16"/>
        </svg>
      } label="Nouveau patient" />

      <div className="adm-nav-sec">Admissions</div>
      <Item to="/admissions" minimized={minimized} fontSize={13} icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      } label="Gestion admissions" />
      <Item to="/admissions/new" minimized={minimized} fontSize={13} icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      } label="Nouvelle admission" />

      <div className="adm-nav-sec">Rendez-vous</div>
      <Item to="/appointments" minimized={minimized} fontSize={13} icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      } label="Calendrier & liste RDV" />
      <Item to="/appointments/new" minimized={minimized} fontSize={13} icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          <line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/>
        </svg>
      } label="Nouveau RDV" />

      <div className="adm-nav-sec">Facturation</div>
      <Item to="/billing" minimized={minimized} fontSize={13} icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      } label="Factures" />
      <Item to="/billing/new" minimized={minimized} fontSize={13} icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
        </svg>
      } label="Nouvelle facture" />

      <div className="adm-nav-sec">Rapports</div>
      <Item to="/reports" minimized={minimized} fontSize={13} icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      } label="Statistiques" />
    </div>
  );
};
