import axios from 'axios';

export interface CommentResponse {
    id: number;
    user_id: string;
    review_id: number;
    text: string;
    created_at: string;
    user_login: string;
    is_owner: boolean;
  }
// Реакции
export const addReaction = async (reviewId: number, isLike: boolean) => {
    try {
      const response = await axios.post(
        `/api/ratings/${reviewId}/reactions`,
        { is_like: isLike },  // Теперь отправляем только is_like
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  };
  
 

export const removeReaction = async (reviewId: number) => {
  try {
    const response = await axios.delete(
      `/api/ratings/${reviewId}/reactions`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error removing reaction:', error);
    throw error;
  }
};

export const getReactions = async (reviewId: number) => {
  try {
    const response = await axios.get(
      `/api/ratings/${reviewId}/reactions`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting reactions:', error);
    throw error;
  }
};

 // Комментарии
 export const addComment = async (reviewId: number, text: string): Promise<CommentResponse> => {
    const response = await axios.post<CommentResponse>(
      `/api/ratings/${reviewId}/comments`,
      { text },
      { withCredentials: true }
    );
    return response.data;
  };
  
  export const deleteComment = async (commentId: number): Promise<void> => {
    await axios.delete(
      `/api/ratings/comments/${commentId}`,
      { withCredentials: true }
    );
  };
  
export const getComments = async (reviewId: number, skip = 0, limit = 10) => {
  try {
    const response = await axios.get<CommentResponse[]>(
      `/api/ratings/${reviewId}/comments`,
      { 
        params: { skip, limit },
        withCredentials: true 
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting comments:', error);
    throw error;
  }
};