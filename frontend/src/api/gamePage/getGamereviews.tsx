import axios from 'axios';

export interface UserRating {
  rating_id: number;
  user_id: number;
  game_id: number;
  rating: number;
  review_text: string;
  created_at: string;
  user_login: string;
  likes: number;
  dislikes: number;
  comments: number;
}

export interface GameReviewsResponse {
  title: string;
  reviews: UserRating[];
}

export async function getGameReviews(gameId: number): Promise<GameReviewsResponse> {
  try {
    const response = await axios.get(`/api/ratings/game/${gameId}`);
    return response.data;
  } catch (error) {
    throw new Error('Не удалось загрузить отзывы');
  }
}