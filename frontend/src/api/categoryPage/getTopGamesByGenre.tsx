import axios from 'axios';

export interface GameMaterial {
  material_id: number;
  material_url: string;
  material_type: 'horizontal_logo' | 'vertical_logo' | 'trailer' | 'screenshot';
}

export interface GameGenre {
  genre_id: number;
  name: string;
  description: string;
}

export interface Game {
  game_id: number;
  title: string;
  description: string; // Убираем optional (?)
  genres: GameGenre[];
  materials: GameMaterial[];
}
export interface GenreResponse {
  genre_name: string;
  games: Game[];
}

export const getTopGamesByGenre = async (genreId: number): Promise<GenreResponse> => {
  try {
    const response = await axios.get<GenreResponse>(`/api/genres/${genreId}/top-games`);
    console.log('Ответ от API:', response); // Посмотрите структуру
    return response.data;
  } catch (error) {
    console.error('Error fetching genre data:', error);
    throw error;
  }
};