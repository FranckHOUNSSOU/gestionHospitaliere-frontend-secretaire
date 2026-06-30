import axios from 'axios';
const BASE = import.meta.env.VITE_API_URL ?? '/api';
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}` });

export const patchRendezVous = {
  updateStatut: async (id: string, statut: string) => {
    const { data } = await axios.patch(`${BASE}/rendezvous/${id}/statut`, { statut }, { headers: auth() });
    return data;
  },
  updateRendezVous: async (id: string, payload: any) => {
    const { data } = await axios.patch(`${BASE}/rendezvous/${id}`, payload, { headers: auth() });
    return data;
  },
};
