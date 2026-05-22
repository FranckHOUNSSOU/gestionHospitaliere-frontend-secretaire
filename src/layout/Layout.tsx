import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Topbar } from './Topbar/Topbar';
import { Sidebar } from './Sidebar/Sidebar';
import { Footer } from './Footer/Footer';
import { useTheme } from '../context/ThemeContext';
import { DoctorProvider } from '../context/DoctorContext';
import '../styles/design-system.css';

export const Layout = () => {
  const { dark } = useTheme();
  const [minimized, setMinimized] = useState(false);

  return (
    <div className="adm" data-theme={dark ? 'dark' : ''} style={{ height: '100vh', overflow: 'hidden' }}>
      <div className="adm-wrap">
        <Topbar minimized={minimized} onToggleSidebar={() => setMinimized(m => !m)} />
        <div className="adm-body">
          <Sidebar minimized={minimized} />
          <DoctorProvider>
            <div className="adm-content-col" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
              <div className="adm-main" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                <Outlet />
              </div>
              <Footer />
            </div>
          </DoctorProvider>
        </div>
      </div>
    </div>
  );
};
