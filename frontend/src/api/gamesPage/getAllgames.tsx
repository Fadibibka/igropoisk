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
  developer: string;  // Добавляем поле developer
  genres: GameGenre[];
  materials: GameMaterial[];
}

export interface Developer {
  developer: string;
}

export interface GetAllGamesParams {
  genre_ids?: number[];
  min_rating?: number;
  age_rating?: string;
  from_year?: number;
  to_year?: number;
  platform_ids?: number[];
  developers?: string[];  // Добавляем параметр для фильтрации по студиям
  sort_by?: string;
}

export const getAllGames = async (params?: GetAllGamesParams) => {
  const response = await axios.get<Game[]>("/api/games", { 
    params: {
      ...params,
      // Преобразуем массивы в строки для корректной передачи в URL
      genre_ids: params?.genre_ids?.join(','),
      platform_ids: params?.platform_ids?.join(','),
      developers: params?.developers?.join(',')
    }
  });
  return response.data;
};
