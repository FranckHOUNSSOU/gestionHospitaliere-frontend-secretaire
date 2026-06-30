import axios from 'axios';
const BASE = import.meta.env.VITE_API_URL ?? '/api';
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}` });

export const patchSejour = {
  cloturer: async (sejourId: string, payload: any) => {
    const { data } = await axios.patch(`${BASE}/sejours/${sejourId}/cloturer`, payload, { headers: auth() });
    return data;
  },
};
