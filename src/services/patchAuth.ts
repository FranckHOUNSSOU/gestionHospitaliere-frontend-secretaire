import axios from 'axios';
const BASE = import.meta.env.VITE_API_URL ?? '/api';
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}` });

export const patchAuth = {
  updateUser: async (userId: string, payload: any) => {
    const { data } = await axios.patch(`${BASE}/auth/users/${userId}`, payload, { headers: auth() });
    return data;
  },
};
