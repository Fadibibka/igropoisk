import axios from 'axios';

export interface NewCommentRequest {
  article_id: string;
  content: string;
}

export interface NewCommentResponse {
  comment_id: string;
  article_id: string;
  content: string;
  created_at: string;
  user_login: string;
  user_id: string;
  avatar_url: string;
  is_owner: boolean;
}

export const postArticleComment = async (article_id: string, content: string): Promise<NewCommentResponse> => {
  const response = await axios.post(`/api/articles/${article_id}/comments`, {
    article_id,
    content,
  });
  return response.data;
};