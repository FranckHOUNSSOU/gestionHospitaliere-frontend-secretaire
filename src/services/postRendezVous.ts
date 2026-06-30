import axios from 'axios';
const BASE = import.meta.env.VITE_API_URL ?? '/api';
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}` });

export const postRendezVous = {
  createRendezVous: async (payload: any) => {
    const { data } = await axios.post(`${BASE}/rendezvous`, payload, { headers: auth() });
    return data;
  },
};
