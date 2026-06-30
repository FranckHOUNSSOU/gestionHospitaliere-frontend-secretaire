import { createContext, useContext, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

type Page =
  | 'dashboard' | 'patients' | 'patient-detail' | 'patient-new' | 'patient-edit'
  | 'admissions' | 'admission-new' | 'admission-discharge'
  | 'patient-file'
  | 'appointments' | 'appointment-new'
  | 'billing' | 'billing-detail' | 'billing-new' | 'reports';

const NavigationContext = createContext(null as any);

const PAGE_PATHS: Record<Page, string | ((id: string) => string)> = {
  'dashboard':            '/',
  'patients':             '/patients',
  'patient-new':          '/patients/new',
  'patient-detail':       (id) => `/patients/${id}`,
  'patient-edit':         (id) => `/patients/${id}/edit`,
  'patient-file':         (id) => `/patients/${id}/dossier`,
  'admissions':           '/admissions',
  'admission-new':        '/admissions/new',
  'admission-discharge':  (id) => `/admissions/${id}/sortie`,
  'appointments':         '/appointments',
  'appointment-new':      '/appointments/new',
  'billing':              '/billing',
  'billing-new':          '/billing/new',
  'billing-detail':       (id) => `/billing/${id}`,
  'reports':              '/reports',
};

function parsePage(pathname: string): { page: Page; selectedId?: string } {
  const editMatch = pathname.match(/^\/patients\/([^/]+)\/edit$/);
  if (editMatch) return { page: 'patient-edit', selectedId: editMatch[1] };

  const fileMatch = pathname.match(/^\/patients\/([^/]+)\/dossier$/);
  if (fileMatch) return { page: 'patient-file', selectedId: fileMatch[1] };

  const patientMatch = pathname.match(/^\/patients\/([^/]+)$/);
  if (patientMatch && patientMatch[1] !== 'new')
    return { page: 'patient-detail', selectedId: patientMatch[1] };

  const dischargeMatch = pathname.match(/^\/admissions\/([^/]+)\/sortie$/);
  if (dischargeMatch) return { page: 'admission-discharge', selectedId: dischargeMatch[1] };

  const billingMatch = pathname.match(/^\/billing\/([^/]+)$/);
  if (billingMatch && billingMatch[1] !== 'new')
    return { page: 'billing-detail', selectedId: billingMatch[1] };

  if (pathname === '/patients/new')      return { page: 'patient-new' };
  if (pathname === '/patients')          return { page: 'patients' };
  if (pathname === '/admissions')        return { page: 'admissions' };
  if (pathname === '/admissions/new')    return { page: 'admission-new' };
  if (pathname === '/appointments')      return { page: 'appointments' };
  if (pathname === '/appointments/new')  return { page: 'appointment-new' };
  if (pathname === '/billing')           return { page: 'billing' };
  if (pathname === '/billing/new')       return { page: 'billing-new' };
  if (pathname === '/reports')           return { page: 'reports' };
  return { page: 'dashboard' };
}

export function NavigationProvider({ children }: { children: any }) {
  const routerNavigate = useNavigate();
  const location = useLocation();

  const nav = useMemo(() => parsePage(location.pathname), [location.pathname]);

  function navigate(page: Page, id?: string, state?: any) {
    const pathOrFn = PAGE_PATHS[page];
    const path = typeof pathOrFn === 'function' ? pathOrFn(id ?? '') : pathOrFn;
    routerNavigate(path, state ? { state } : undefined);
    window.scrollTo(0, 0);
  }

  return (
    <NavigationContext.Provider value={{ nav, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider');
  return ctx;
}
