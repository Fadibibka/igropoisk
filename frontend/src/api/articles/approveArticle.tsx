import axios from 'axios';

export const approveArticle = async (articleId: string): Promise<void> => {
    try {
      await axios.post(`/api/articles/moderation/approve/${articleId}`);
    } catch (error) {
      console.error(`Ошибка при одобрении статьи ${articleId}:`, error);
      throw error;
    }
  };