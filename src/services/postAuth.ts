import axios from 'axios';
const BASE = import.meta.env.VITE_API_URL ?? '/api';
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}` });

export const postAuth = {
  uploadPhoto: async (formData: FormData) => {
    const { data } = await axios.post(`${BASE}/auth/profil/photo`, formData, {
      headers: { ...auth(), 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
