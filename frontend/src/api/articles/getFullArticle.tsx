import axios from 'axios';

export interface Comment {
  comment_id: string;
  content: string;
  created_at: string;
  author: {
    user_id: string;
    name: string;
    avatar_url: string;
  };
  parent_id: string | null;
}

export interface FullArticle {
  article_id: string;
  title: string;
  description: string;
  content: string;
  image_url: string;
  created_at: string;
  views_count: number;
  is_official: boolean;
  game_title: string | null;
  author: {
    name: string;
    avatar: string;
  };
  comments: Comment[];
  reactions: {
    likes_count: number;
    dislikes_count: number;
  };
}

export const getFullArticle = async (articleId: string): Promise<FullArticle> => {
  try {
    const response = await axios.get<FullArticle>(`/api/articles/${articleId}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении статьи:', error);
    throw error;
  }
};