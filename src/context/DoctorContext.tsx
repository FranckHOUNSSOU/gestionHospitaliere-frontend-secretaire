import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import client from '../services/clients';
import { useAuth } from './AuthContext';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  department: string;
  serviceCode: string;
}

interface DoctorContextType {
  doctors: Doctor[];
  loading: boolean;
  refresh: () => void;
}

const DoctorContext = createContext<DoctorContextType | null>(null);

export function DoctorProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchDoctors() {
    setLoading(true);
    try {
      const params: Record<string, string> = { role: 'MEDECIN' };
      if (user?.poleId) params.poleId = user.poleId;

      const { data } = await client.get<Array<{
        id: string;
        nom: string;
        prenom: string;
        service?: { id: string; nom: string; code: string } | null;
      }>>('/auth/users', { params });

      if (Array.isArray(data)) {
        setDoctors(data.map((u) => ({
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
