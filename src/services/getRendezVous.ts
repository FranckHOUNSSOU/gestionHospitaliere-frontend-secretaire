import axios from 'axios';
const BASE = import.meta.env.VITE_API_URL ?? '/api';
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}` });

export const getRendezVous = {
  getRendezVous: async (debut?: string, fin?: string) => {
    const { data } = await axios.get(`${BASE}/rendezvous`, { params: { debut, fin }, headers: auth() });
    return data;
  },
};
