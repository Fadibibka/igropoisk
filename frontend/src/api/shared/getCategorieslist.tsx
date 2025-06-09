import axios from 'axios';

export interface GenreWithLogos {
  genre_name: string;
  genre_id:number;
  logos: string[];
}

export async function getCategoriesWithLogos(): Promise<GenreWithLogos[]> {
  try {
    const response = await axios.get('/api/genres/with-logos');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Ошибка при загрузке жанров: ${error.message}`);
    } else {
      throw new Error('Неизвестная ошибка при загрузке жанров');
    }
  }
}