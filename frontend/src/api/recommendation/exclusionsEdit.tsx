import axios from "axios";

// --- Types ---

export interface GenreExclusionIn {
  genre_id: number;
}

export interface PlatformExclusionIn {
  platform_id: number;
}

export interface GenreExclusionOut {
  genre_id: number;
  name: string;
}

export interface PlatformExclusionOut {
  platform_id: number;
  name: string;
}

// --- Genre Exclusions ---

export const getExcludedGenres = async () => {
  const response = await axios.get<GenreExclusionOut[]>('/api/recommendations/exclusions/genres');
  return response.data;
};

export const addExcludedGenre = async (data: GenreExclusionIn) => {
  await axios.post('/api/recommendations/exclusions/genres', data);
};

export const removeExcludedGenre = async (data: GenreExclusionIn) => {
  await axios.delete('/api/recommendations/exclusions/genres', { data });
};

// --- Platform Exclusions ---

export const getExcludedPlatforms = async () => {
  const response = await axios.get<PlatformExclusionOut[]>('/api/recommendations/exclusions/platforms');
  return response.data;
};

export const addExcludedPlatform = async (data: PlatformExclusionIn) => {
  await axios.post('/api/recommendations/exclusions/platforms', data);
};

export const removeExcludedPlatform = async (data: PlatformExclusionIn) => {
  await axios.delete('/api/recommendations/exclusions/platforms', { data });
};