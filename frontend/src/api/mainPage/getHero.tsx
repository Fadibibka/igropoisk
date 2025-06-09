import axios from 'axios';

export interface GameMaterial {
  material_url: string;
  material_type: 'horizontal_logo' | 'vertical_logo' | 'trailer' | 'screenshot';
}

export interface GameGenre {
    genre_id: BigInteger,
    name: string,
    description: string
  }

export interface Game {
  title: string;
  game_id: number;
  description: string;
  genres: GameGenre[]
  materials: GameMaterial[];
}

// Создаем экземпляр axios с базовыми настройками


export async function getHeroGames(): Promise<Game[]> {
  try {
    const response = await axios.get('/api/games/hero');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Обработка ошибок axios
      throw new Error(`Ошибка при загрузке игр: ${error.message}`);
    } else {
      // Обработка других ошибок
      throw new Error('Неизвестная ошибка при загрузке игр');
    }
  }
}