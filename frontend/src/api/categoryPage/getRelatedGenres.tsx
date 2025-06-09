import axios from 'axios';

export interface RelatedGenre {
  genre_id: number;
  name: string;
  overlap_count: number;
}

export const getRelatedGenresByGenre = async (genreId: number): Promise<RelatedGenre[]> => {
  try {
    const response = await axios.get<RelatedGenre[]>(`/api/genres/${genreId}/related-genres`);
    return response.data;
  } catch (error) {
    console.error('Error fetching related genres:', error);
    throw error;
  }
};