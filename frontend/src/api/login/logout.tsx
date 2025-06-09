import axios from 'axios';

export const logoutUser = async (): Promise<{ message: string }> => {
  try {
    const response = await axios.post('/api/auth/logout');
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};
