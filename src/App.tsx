import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NavigationProvider } from './context/NavigationContext';
import { PrivateRoute } from './utils/PrivateRoute';
import { Layout } from './layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import DashboardAgent from './pages/DashboardAgent';
import PatientList from './pages/patients/PatientList';
import PatientDetail from './pages/patients/PatientDetail';
import PatientForm from './pages/patients/PatientForm';
import AdmissionList from './pages/admissions/AdmissionList';
import AdmissionForm from './pages/admissions/AdmissionForm';
import AppointmentList from './pages/appointments/AppointmentList';
import AppointmentForm from './pages/appointments/AppointmentForm';
import InvoiceList from './pages/billing/InvoiceList';
import InvoiceDetail from './pages/billing/InvoiceDetail';
import InvoiceForm from './pages/billing/InvoiceForm';
import Reports from './pages/reports/Reports';

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
                <Route path="patients" element={<PatientList />} />
                <Route path="patients/new" element={<PatientForm />} />
                <Route path="patients/:id" element={<PatientDetail />} />
                <Route path="patients/:id/edit" element={<PatientForm />} />
                <Route path="admissions" element={<AdmissionList />} />
                <Route path="admissions/new" element={<AdmissionForm />} />
                <Route path="appointments" element={<AppointmentList />} />
                <Route path="appointments/new" element={<AppointmentForm />} />
                <Route path="billing" element={<InvoiceList />} />
                <Route path="billing/new" element={<InvoiceForm />} />
                <Route path="billing/:id" element={<InvoiceDetail />} />
                <Route path="reports" element={<Reports />} />
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
