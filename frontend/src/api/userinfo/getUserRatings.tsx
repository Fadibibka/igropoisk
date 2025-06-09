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
  
// В getUserRatings.ts
export async function getAllUserRatings(): Promise<UserRatingWithGame[]> {
  try {
    const response = await axios.get('/api/ratings/user/ratings', { 
      withCredentials: true 
    });
    
    // Добавляем валидацию данных
    const data = response.data.map((item: any) => ({
      rating: {
        rating_id: item.rating?.rating_id || item.rating_id, // Двойная проверка
        user_id: item.rating?.user_id || item.user_id,
        game_id: item.rating?.game_id || item.game_id,
        rating: item.rating?.rating || item.rating,
        review_text: item.rating?.review_text || item.review_text,
        created_at: item.rating?.created_at || item.created_at,
        updated_at: item.rating?.updated_at || item.updated_at,
        user_login: item.rating?.user_login || item.user_login,
        likes: item.rating?.likes || item.likes || 0,
        dislikes: item.rating?.dislikes || item.dislikes || 0,
        comments: item.rating?.comments || item.comments || 0
      },
      game_title: item.game_title,
      is_owner: item.is_owner
    }));

    console.log('Validated data:', data);
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Не удалось загрузить оценки');
  }
}