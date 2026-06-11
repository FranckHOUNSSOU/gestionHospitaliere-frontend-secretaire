import client from './clients';

export interface Mouvement {
  serviceArrivee: string | null;
  numeroChambre:  string | null;
  numeroLit:      string | null;
}

export interface Sejour {
  id:                   string;
  dateAdmission:        string;
  dateSortie:           string | null;
  modeSortie:           string | null;
  modeEntree:           string | null;
  motifHospitalisation: string | null;
  mouvements:           Mouvement[];
  medecinResponsable?:  { user?: { nom: string; prenom: string } } | null;
}

export interface Patient {
  id:              string;
  numeroIpp:       string;
  nom:             string;
  prenom:          string;
  sexe:            'M' | 'F' | 'Autre';
  dateNaissance:   string | null;
  adresse:         string | null;
  telephoneMobile: string | null;
  email:           string | null;
  statutProfil:    'Complet' | 'Incomplet';
  sejours?:        Sejour[];
  createdAt:       string;
}

export const patientsData = {
  findAll: async (): Promise<Patient[]> => {
    const { data } = await client.get<Patient[]>('/patients');
    return data;
  },

  rechercher: async (q: string): Promise<Patient[]> => {
    const { data } = await client.get<Patient[]>(
      `/patients/recherche?q=${encodeURIComponent(q.trim())}`,
    );
    return data;
  },

  findOne: async (id: string): Promise<Patient> => {
    const { data } = await client.get<Patient>(`/patients/${id}`);
    return data;
  },
};