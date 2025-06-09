import axios from 'axios';

export interface UserRating {
    rating_id: number;
    user_id: number;
    game_id: number;
    rating: number;
    review_text: string;
    created_at: string;
    updated_at: string;
    user_login: string;
    likes: number;
    dislikes: number;
    comments: number;
  }
  
  export interface UserRatingWithGame {
    rating: UserRating;
    game_title: string;
    is_owner: boolean;
  }
  
  export async function getAllUserRatings(): Promise<UserRatingWithGame[]> {
    try {
      const response = await axios.get<UserRatingWithGame[]>(
        '/api/ratings/user/ratings',
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      throw new Error('Не удалось загрузить ваши оценки');
    }
  }