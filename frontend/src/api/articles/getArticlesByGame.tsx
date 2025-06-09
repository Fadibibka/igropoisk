import axios from 'axios';

export interface GameArticlePreview {
  article_id: number;
  title: string;
  description: string;
  article_photo: string | null;
  created_at: string;
  author_name: string;
  game_title: string | null;
  is_official: boolean;
}

export const getArticlesByGameId = async (gameId: number): Promise<GameArticlePreview[]> => {
  try {
    const response = await axios.get<GameArticlePreview[]>('/api/articles/by-game', {
      params: { game_id: gameId },
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении статей по игре:', error);
    throw error;
  }
};