import axios from 'axios';

export interface RegisterPayload {
  login: string;
  email: string;
  password: string;
}

export const registerUser = async (payload: RegisterPayload): Promise<{ message: string; user_id: string }> => {
  try {
    const response = await axios.post('/api/auth/reg', payload);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};