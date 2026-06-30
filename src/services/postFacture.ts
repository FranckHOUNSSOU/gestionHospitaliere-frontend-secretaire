import axios from 'axios';
const BASE = import.meta.env.VITE_API_URL ?? '/api';
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}` });

export const postFacture = {
  emettreFacture: async (patientId: string) => {
    const { data } = await axios.post(`${BASE}/facturation/emettre/${patientId}`, {}, { headers: auth() });
    return data;
  },
};
