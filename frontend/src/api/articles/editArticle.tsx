import axios from 'axios';

export interface EditArticleData {
  article_id: string;
  title: string;
  description: string;
  content: string;
  article_photo?: string;
  game_id?: string;
}

export const editArticle = async (data: EditArticleData): Promise<void> => {
  try {
    await axios.put('/api/articles/edit', data);
  } catch (error) {
    console.error('Ошибка при редактировании статьи:', error);
    throw error;
  }
};