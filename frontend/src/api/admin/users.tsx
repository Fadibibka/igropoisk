import axios from 'axios';

export interface UserReview {
  game_title: string;
  text: string;
  created_at: string;
  rating_id: number;
}

export interface User {
  user_id: string;
  login: string;
  email: string;
  created_at: string;
  is_admin: boolean;
  activity_score: number;
  reviews: UserReview[];
}

export interface UsersSearchParams {
  search?: string;
  sort_order?: 'asc' | 'desc';
  period_days?: number;
}

export async function getUsers(params?: UsersSearchParams): Promise<User[]> {
  try {
    const response = await axios.get('/api/users/', { 
      params,
      withCredentials: true 
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Ошибка при загрузке пользователей: ${error.response?.data?.detail || error.message}`);
    } else {
      throw new Error('Неизвестная ошибка при загрузке пользователей');
    }
  }
}

export async function deleteUserReview(ratingId: number): Promise<void> {
  try {
    await axios.delete(`/api/users/reviews/${ratingId}`, { 
      withCredentials: true 
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Ошибка при удалении отзыва: ${error.response?.data?.detail || error.message}`);
    } else {
      throw new Error('Неизвестная ошибка при удалении отзыва');
    }
  }
}