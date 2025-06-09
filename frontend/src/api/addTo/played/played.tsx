import axios from 'axios';
import { navigateToLogin } from '@shared/utils/navigation';

const API_BASE = '/api/played';

export const addToPlayed = async (gameId: number) => {
  try {
    const response = await axios.post(`${API_BASE}/${gameId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      navigateToLogin();
    }
    throw error;
  }
};

export const removeFromPlayed = async (gameId: number) => {
  try {
    const response = await axios.delete(`${API_BASE}/${gameId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      navigateToLogin();
    }
    throw error;
  }
};

export const checkIsPlayed = async (gameId: number) => {
  try {
    const response = await axios.get('/api/played/');
    const played = response.data;
    return played.some((fav: any) => fav.game_id === gameId);
  } catch (error) {
    return false;
  }
};

export interface GameMaterial {
    material_url: string;
    material_type: 'logo' | 'trailer' | 'screenshot';
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
  
export const getMyPlayed = async (): Promise<Game[]> => {
    try {
      const response = await axios.get('/api/played/');
      return response.data; // Предполагается, что сервер возвращает массив игр
    } catch (error) {
      console.error('Error fetching played:', error);
      return [];
    }
  };