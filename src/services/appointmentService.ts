import client from './clients';
import type { Appointment } from '../types/index';

export interface CreateRendezVousPayload {
  patientId: string;
  medecinUserId: string;
  dateHeure: string;   // ISO string combinant date + heure
  dureeMinutes?: number;
  type?: string;
  motif?: string;
}

export const createRendezVous = (payload: CreateRendezVousPayload) =>
  client.post<Appointment>('/rendezvous', payload);

export const getRendezVous = (debut?: string, fin?: string) =>
  client.get<Appointment[]>('/rendezvous', { params: { debut, fin } });

export const updateStatutRendezVous = (id: string, statut: 'Confirme' | 'Annule' | 'Effectue' | 'Programme') =>
  client.patch<Appointment>(`/rendezvous/${id}/statut`, { statut });
