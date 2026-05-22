import client from './clients';

export interface PatientApi {
  id: string;
  nom: string;
  prenom: string;
  numeroIpp: string;
  telephoneMobile: string | null;
  telephoneFixe: string | null;
}

export const searchPatients = (q?: string) =>
  client.get<PatientApi[]>('/patients', { params: q ? { q } : {} });

export const rechercherPatients = (q: string) =>
  client.get<PatientApi[]>(`/patients/recherche?q=${encodeURIComponent(q)}`);
