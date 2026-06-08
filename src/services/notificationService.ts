import client from './clients';

export interface Notif {
  id: string;
  message: string;
  lu: boolean;
  rdvId: string | null;
  createdAt: string;
}

export const getMesNotifications = () =>
  client.get<Notif[]>('/notifications/moi');

export const countNonLu = () =>
  client.get<{ count: number }>('/notifications/moi/count');

export const marquerLu = (id: string) =>
  client.patch(`/notifications/${id}/lire`);

export const marquerToutLu = () =>
  client.patch('/notifications/moi/lire-tout');
