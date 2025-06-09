import axios from 'axios';

export interface CreateArticleData {
  title: string;
  description: string;
  content: string;
  article_photo?: string;
  game_id?: string;
}

export const createPlatformArticle = async (data: CreateArticleData): Promise<string> => {
  try {
    const response = await axios.post('/api/articles/platform/create', data);
    return response.data.article_id;
  } catch (error) {
    console.error('Ошибка при создании статьи платформы:', error);
    throw error;
  }
};