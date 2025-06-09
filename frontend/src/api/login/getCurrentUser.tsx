import axios from 'axios';

export interface CurrentUser {
  user_id: string;
  is_admin: boolean;
}

export const getCurrentUser = async (): Promise<CurrentUser> => {
  const response = await axios.post<CurrentUser>('/api/auth/me');
  return response.data;
};
