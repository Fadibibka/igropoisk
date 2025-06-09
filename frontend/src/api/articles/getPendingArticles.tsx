import axios from 'axios';

export interface PendingArticle {
  article_id: string;
  title: string;
  description: string;
  article_photo: string;
  created_at: string;
  author_name: string;
  game_title?: string;
  is_official: boolean;
}

export const getPendingArticles = async (): Promise<PendingArticle[]> => {
  try {
    const response = await axios.get<PendingArticle[]>('/api/articles/moderation/pending');
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении статей на модерацию:', error);
    throw error;
  }
};