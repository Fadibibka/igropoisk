import axios from 'axios';

export interface UserArticle {
  article_id: string;
  title: string;
  description: string;
  article_photo: string;
  created_at: string;
  is_approved: boolean;
  is_official: boolean;
  game_title?: string;
}

export const getUserArticles = async (): Promise<UserArticle[]> => {
  try {
    const response = await axios.get<UserArticle[]>('/api/articles/user/articles');
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении статей пользователя:', error);
    throw error;
  }
};