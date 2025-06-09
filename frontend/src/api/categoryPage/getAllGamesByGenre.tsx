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
  description: string;
  release_date?: string;
  genres: GameGenre[];
  materials: GameMaterial[];
}

export const getAllGamesByGenre = async (genreId: number): Promise<{games: Game[], genre_name: string}> => {
  try {
    const response = await axios.get(`/api/genres/${genreId}/other-games`);
    // Предполагаем, что бэкенд возвращает {games: Game[], genre_name: string}
    return {
      games: response.data.games || [],
      genre_name: response.data.genre_name || ''
    };
  } catch (error) {
    console.error('Error fetching games by genre:', error);
    throw error;
  }
};