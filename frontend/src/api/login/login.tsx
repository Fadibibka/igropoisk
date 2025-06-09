import axios from 'axios';

export interface LoginPayload {
  login: string;
  password: string;
}

export const loginUser = async (payload: LoginPayload): Promise<{ message: string; user_id: string }> => {
  try {
    const response = await axios.post('/api/auth/login', payload);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};
