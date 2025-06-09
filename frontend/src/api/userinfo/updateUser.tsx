import axios from 'axios';

export const updateUserData = async (
  userId: string,
  userData: {
    login?: string;
    email?: string;
    password?: string;
    avatar_url?: string;
  },
  accessToken: string
) => {
  try {
    const response = await axios.patch(
      `/api/users/${userId}`,
      userData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};