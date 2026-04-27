import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import client from '../services/clients';
import { doctors as mockDoctors } from '../services/mockData';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  department: string;
}

interface DoctorContextType {
  doctors: Doctor[];
  loading: boolean;
  refresh: () => void;
}

const DoctorContext = createContext<DoctorContextType | null>(null);

export function DoctorProvider({ children }: { children: ReactNode }) {
  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors);
  const [loading, setLoading] = useState(false);

  async function fetchDoctors() {
    setLoading(true);
    try {
      const { data } = await client.get<Array<{
        id: string;
        nom: string;
        prenom: string;
        service?: string;
      }>>('/auth/users?role=MEDECIN');

      if (Array.isArray(data) && data.length > 0) {
        const mapped: Doctor[] = data.map((u) => ({
          id: u.id,
          name: `Dr. ${u.prenom} ${u.nom}`,
          specialty: u.service ?? 'Médecine générale',
          department: u.service ?? 'Médecine générale',
        }));
        // Fusionner : médecins API en premier, puis mockData en fallback
        const mockNotInApi = mockDoctors.filter(
          (m) => !mapped.some((a) => a.name === m.name)
        );
        setDoctors([...mapped, ...mockNotInApi]);
      }
    } catch {
      // Si l'API échoue, on garde les mockDoctors déjà chargés
      setDoctors(mockDoctors);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDoctors();
  }, []);

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