import axios from 'axios';
const BASE = import.meta.env.VITE_API_URL ?? '/api';
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}` });

export const patchNotification = {
  marquerLu: async (id: string) => {
    const { data } = await axios.patch(`${BASE}/notifications/${id}/lire`, {}, { headers: auth() });
    return data;
  },
  marquerToutLu: async () => {
    const { data } = await axios.patch(`${BASE}/notifications/moi/lire-tout`, {}, { headers: auth() });
    return data;
  },
};
