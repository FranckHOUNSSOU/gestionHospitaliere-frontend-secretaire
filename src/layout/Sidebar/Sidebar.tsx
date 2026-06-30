import './Sidebar.css';
import SidebarItem from './SidebarItem';

export const Sidebar = ({ minimized }: { minimized: boolean }) => (
  <div className={`adm-sidebar${minimized ? ' adm-sidebar--min' : ''}`}>

    <div className="adm-nav-sec">Tableau de bord</div>
    <SidebarItem to="/dashboard" minimized={minimized} fontSize={13} icon={
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
      </svg>
    } label="Vue d'ensemble" />

    <div className="adm-nav-sec">Admissions</div>
    <SidebarItem to="/admissions/new" minimized={minimized} fontSize={13} icon={
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
        <circle cx="12" cy="16" r="3"/>
        <line x1="12" y1="14.5" x2="12" y2="17.5"/><line x1="10.5" y1="16" x2="13.5" y2="16"/>
      </svg>
    } label="Nouvelle admission" />

     <div className="adm-nav-sec">Patients</div>
    <SidebarItem to="/admissions" minimized={minimized} fontSize={13} icon={
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    } label="Liste des Patients" />

    <div className="adm-nav-sec">Rendez-vous</div>
    <SidebarItem to="/appointments" minimized={minimized} fontSize={13} icon={
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    } label="Calendrier & liste RDV" />
    <SidebarItem to="/appointments/new" minimized={minimized} fontSize={13} icon={
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        <line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/>
      </svg>
    } label="Nouveau RDV" />

    <div className="adm-nav-sec">Facturation</div>
    <SidebarItem to="/billing" minimized={minimized} fontSize={13} icon={
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    } label="Factures" />
    <SidebarItem to="/billing/new" minimized={minimized} fontSize={13} icon={
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
      </svg>
    } label="Nouvelle facture" />

    <div className="adm-nav-sec">Notifications</div>
    <SidebarItem to="/notifications" minimized={minimized} fontSize={13} icon={
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    } label="Notifications" />

    <div className="adm-nav-sec">Paramètres</div>
    <SidebarItem to="/profil" minimized={minimized} fontSize={13} icon={
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    } label="Mon profil" />
  </div>
);
