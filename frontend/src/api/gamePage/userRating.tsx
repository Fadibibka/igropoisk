import axios from 'axios';

interface RatingData {
  game_id: number;
  rating: number;
  review_text?: string;
}

export const submitRating = async (data: RatingData) => {
  try {
    const response = await axios.post('/api/ratings/', data);
    return response.data;
  } catch (error: any) {
    console.error('Error submitting rating:', error);
    throw error;
  }
};
export const getUserRating = async (game_id: number) => {
  const response = await axios.get(`/api/ratings/user/${game_id}`);
  return response.data;
};

export const deleteUserRating = async (game_id: number) => {
  const response = await axios.delete(`/api/ratings/${game_id}`);
  return response.data;
};