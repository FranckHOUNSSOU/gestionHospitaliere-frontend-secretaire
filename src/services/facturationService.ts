import client from './clients';

export interface LigneHospitalisation {
  sejourId: string;
  description: string;
  jours: number;
  prixJour: number;
  total: number;
}

export interface LigneExamen {
  id: string;
  description: string;
  tarif: number;
}

export interface LigneSoin {
  id: string;
  description: string;
  dateHeure: string;
  tarif: number;
}

export interface SejourFacture {
  id: string;
  dateAdmission: string;
  dateSortie: string | null;
  modeEntree?: string;
  modeSortie?: string | null;
  motif: string;
  service?: string | null;
  examens: LigneExamen[];
  soins: LigneSoin[];
  totalExamens: number;
  totalSoins: number;
}

export interface LigneConsultation {
  id: string;
  dateHeure: string;
  type: string;
  medecin: string;
  statut: string;
  tarif: number;
}

export interface ApercuFacture {
  patient: {
    id: string;
    nom: string;
    prenom: string;
    numeroIpp: string;
    dateNaissance: string;
    sexe?: string;
    telephone?: string | null;
    couvertureSociale?: {
      organisme: string;
      type: string;
      numero: string;
      taux: number | null;
    } | null;
  };
  lignesHospitalisation: LigneHospitalisation[];
  sejours: SejourFacture[];
  consultations: LigneConsultation[];
  totalHospitalisation: number;
  totalExamens: number;
  totalSoins: number;
  totalConsultations: number;
  totalGeneral: number;
  genereLe: string;
}

export const getApercuFacture = (patientId: string) =>
  client.get<ApercuFacture>(`/facturation/apercu/${patientId}`);
