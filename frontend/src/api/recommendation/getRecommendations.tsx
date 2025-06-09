import axios from 'axios';


export interface GameMaterial {
  material_url: string;
  material_type: 'horizontal_logo' | 'vertical_logo' | 'trailer' | 'screenshot';
}


export interface ExplanationComponent {
  CF?: number;
  CB?: number;
}

export interface Explanation {
  game_id: number;
  title: string;
  final_score: number;
  components: ExplanationComponent;
  priority_bonuses: string[];
  why_recommended: string[];
  materials: GameMaterial[];
}

export interface GameRecommendation {
  game_id: number;
  title: string;
  developer: string;
  genres: string[];
  match_score: number;
  reason: string;
  explanation: Explanation;
}

export interface RecommendationResponse {
  main: GameRecommendation[];
  additional: GameRecommendation[];
  reserve: GameRecommendation[];
}

export const getRecommendations = async () => {
  const response = await axios.get<RecommendationResponse>('/api/recommendations/');
  return response.data;
};