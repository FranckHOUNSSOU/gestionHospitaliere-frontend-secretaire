import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NavigationProvider } from './context/NavigationContext';
import { PrivateRoute } from './utils/PrivateRoute';
import { Layout } from './layout/Layout';
import LoginPage from './pages/auth/LoginPage/LoginPage';
import DashboardAgent from './pages/DashboardAgent/DashboardAgent';
import PatientList from './pages/patients/PatientList/PatientList';
import PatientDetail from './pages/patients/PatientDetail/PatientDetail';
import PatientForm from './pages/patients/PatientForm/PatientForm';
import PatientFile from './pages/patients/PatientFile/PatientFile';
import AdmissionList from './pages/admissions/AdmissionList/AdmissionList';
import AdmissionForm from './pages/admissions/AdmissionForm/AdmissionForm';
import AdmissionDischarge from './pages/admissions/AdmissionDischarge/AdmissionDischarge';
import AppointmentList from './pages/appointments/AppointmentList/AppointmentList';
import AppointmentForm from './pages/appointments/AppointmentForm/AppointmentForm';
import InvoiceList from './pages/billing/InvoiceList/InvoiceList';
import InvoiceDetail from './pages/billing/InvoiceDetail/InvoiceDetail';
import InvoiceForm from './pages/billing/InvoiceForm/InvoiceForm';
import Reports from './pages/reports/Reports/Reports';
import ProfilPage from './pages/ProfilPage/ProfilPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <NavigationProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Layout />
                  </PrivateRoute>
                }
              >
                <Route index element={<DashboardAgent />} />
                <Route path="dashboard" element={<DashboardAgent />} />

                {/* Patients */}
                <Route path="patients" element={<PatientList />} />
                <Route path="patients/new" element={<PatientForm />} />
                <Route path="patients/:id" element={<PatientDetail />} />
                <Route path="patients/:id/edit" element={<PatientForm />} />
                <Route path="patients/:id/dossier" element={<PatientFile />} />

                {/* Admissions */}
                <Route path="admissions" element={<AdmissionList />} />
                <Route path="admissions/new" element={<AdmissionForm />} />
                <Route path="admissions/:id/sortie" element={<AdmissionDischarge />} />

                {/* Rendez-vous */}
                <Route path="appointments" element={<AppointmentList />} />
                <Route path="appointments/new" element={<AppointmentForm />} />

                {/* Facturation */}
                <Route path="billing" element={<InvoiceList />} />
                <Route path="billing/new" element={<InvoiceForm />} />
                <Route path="billing/:id" element={<InvoiceDetail />} />

                <Route path="reports" element={<Reports />} />
                <Route path="profil" element={<ProfilPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </NavigationProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
