import axios from 'axios';
const BASE = import.meta.env.VITE_API_URL ?? '/api';
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}` });

export const patchDossier = {
  updateCritiques: async (patientId: string, payload: any) => {
    const { data } = await axios.patch(`${BASE}/patients/${patientId}/completer`, payload, { headers: auth() });
    return data;
  },
  updateCouverture: async (patientId: string, couvertureId: string, payload: any) => {
    const { data } = await axios.patch(`${BASE}/patients/${patientId}/couvertures/${couvertureId}`, payload, { headers: auth() });
    return data;
  },
};
