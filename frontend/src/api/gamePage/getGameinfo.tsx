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
    genres: GameGenre[];
    materials: GameMaterial[];
    release_date: string;
    average_user_rating: number;
    developer: string;
    publisher: string;
    steam_url: string;
    about_game: string;
    steam_rating: string;
    average_critic_rating: number;
    average_critic_rec: number;
  }

export async function getGameById(gameId: number): Promise<Game> {
  try {
    const response = await axios.get(`/api/games/${gameId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Ошибка при загрузке игры: ${error.message}`);
    } else {
      throw new Error('Неизвестная ошибка при загрузке игры');
    }
  }
}
