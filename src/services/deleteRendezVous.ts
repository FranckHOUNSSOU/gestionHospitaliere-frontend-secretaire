import axios from 'axios';
const BASE = import.meta.env.VITE_API_URL ?? '/api';
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}` });

export const deleteRendezVous = {
  deleteRendezVous: async (id: string) => {
    await axios.delete(`${BASE}/rendezvous/${id}`, { headers: auth() });
  },
};
