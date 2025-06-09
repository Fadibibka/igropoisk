import axios from 'axios';

export interface GameMaterial {
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
  average_user_rating: number;
  genres: GameGenre[];
  materials: GameMaterial[];
}

export async function getPopularGames(): Promise<Game[]> {
  try {
    const response = await axios.get('/api/games/popular');
    return response.data;
  } catch (error) {
    throw new Error('Не удалось загрузить популярные игры');
  }
}
