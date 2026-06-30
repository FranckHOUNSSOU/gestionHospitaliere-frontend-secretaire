import { createContext, useContext, useEffect, useState } from 'react';
import { getAuth } from '../services/getAuth';
import { useAuth } from './AuthContext';

const DoctorContext = createContext(null as any);

export function DoctorProvider({ children }: { children: any }) {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchDoctors() {
    setLoading(true);
    try {
      const params: Record<string, string> = { role: 'MEDECIN', actif: 'true' };
      if (user?.poleId) params.poleId = user.poleId;

      const data = await getAuth.getMedecins(params);

      if (Array.isArray(data)) {
        setDoctors(data.map((u: any) => ({
          id:          u.id,
          name:        `Dr. ${u.prenom} ${u.nom}`,
          specialty:   u.service?.nom ?? 'Médecine générale',
          department:  u.service?.nom ?? 'Médecine générale',
          serviceCode: u.service?.code ?? '',
        })));
      }
    } catch {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDoctors();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.poleId]);

  return (
    <DoctorContext.Provider value={{ doctors, loading, refresh: fetchDoctors }}>
      {children}
    </DoctorContext.Provider>
  );
}

export function useDoctors() {
  const ctx = useContext(DoctorContext);
  if (!ctx) throw new Error('useDoctors must be used within DoctorProvider');
  return ctx;
}
