import axios from 'axios';

export interface CreateUserArticleData {
  title: string;
  description: string;
  content: string;
  article_photo?: string;
  game_id?: string;
}

export const createUserArticle = async (data: CreateUserArticleData): Promise<string> => {
  try {
    const response = await axios.post('/api/articles/user/create', data);
    return response.data.article_id;
  } catch (error) {
    console.error('Ошибка при создании пользовательской статьи:', error);
    throw error;
  }
};