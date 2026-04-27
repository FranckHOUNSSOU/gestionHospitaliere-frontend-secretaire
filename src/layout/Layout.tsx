import { Outlet } from 'react-router-dom';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { useTheme } from '../context/ThemeContext';
import { DoctorProvider } from '../context/DoctorContext';
import '../styles/design-system.css';

export const Layout = () => {
  const { dark } = useTheme();

  return (
    <div className="adm" data-theme={dark ? 'dark' : ''} style={{ height: '100vh', overflow: 'hidden' }}>
      <div className="adm-wrap">
        <Topbar />
        <div className="adm-body">
          <Sidebar />
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
