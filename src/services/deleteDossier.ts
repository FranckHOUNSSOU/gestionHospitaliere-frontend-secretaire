import axios from 'axios';
const BASE = import.meta.env.VITE_API_URL ?? '/api';
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}` });

export const deleteDossier = {
  deleteAllergie: async (patientId: string, allergieId: string) => {
    await axios.delete(`${BASE}/patients/${patientId}/allergies/${allergieId}`, { headers: auth() });
  },
  deleteTraitement: async (patientId: string, traitementId: string) => {
    await axios.delete(`${BASE}/patients/${patientId}/traitements/${traitementId}`, { headers: auth() });
  },
  deleteContact: async (patientId: string, contactId: string) => {
    await axios.delete(`${BASE}/patients/${patientId}/contacts/${contactId}`, { headers: auth() });
  },
};
