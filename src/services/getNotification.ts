import axios from 'axios';
const BASE = import.meta.env.VITE_API_URL ?? '/api';
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}` });

export const getNotification = {
  getMesNotifications: async () => {
    const { data } = await axios.get(`${BASE}/notifications/moi`, { headers: auth() });
    return data;
  },
  countNonLu: async () => {
    const { data } = await axios.get(`${BASE}/notifications/moi/count`, { headers: auth() });
    return data;
  },
};
