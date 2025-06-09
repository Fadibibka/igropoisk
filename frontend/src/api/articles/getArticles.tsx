import axios from 'axios';

export interface ArticlePreview {
  article_id: string;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
  views_count: number;
  author: {
    name: string;
    avatar: string;
  };
  game_title: string | null;
}

export const getAllArticlesPreview = async (isOfficial?: boolean): Promise<ArticlePreview[]> => {
  try {
    const response = await axios.get<ArticlePreview[]>('/api/articles/', {
      params: isOfficial !== undefined ? { is_official: isOfficial } : {},
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении статей:', error);
    throw error;
  }
};