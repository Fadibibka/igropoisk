import axios from 'axios';

export interface Genre {
    genre_id: number;
    name: string;
    description: string;
  }
  
  export async function getAllGenres(): Promise<Genre[]> {
    try {
      const response = await axios.get('/api/genres/');
      return response.data;
    } catch (error) {
      throw new Error('Не удалось загрузить жанры');
    }
  }