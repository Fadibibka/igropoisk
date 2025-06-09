import axios from 'axios';

export interface Developer {
    developer: string;
  }
  
  export async function getAllDevelopers(): Promise<Developer[]> {
    try {
      const response = await axios.get('/api/games/studios');
      return response.data;
    } catch (error) {
      throw new Error('Не удалось загрузить жанры');
    }
  }