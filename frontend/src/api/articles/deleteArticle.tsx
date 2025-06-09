import axios from 'axios';

export const deleteArticle = async (articleId: string): Promise<void> => {
  try {
    await axios.delete(`/api/articles/delete/${articleId}`);
  } catch (error) {
    console.error('Ошибка при удалении статьи:', error);
    throw error;
  }
};