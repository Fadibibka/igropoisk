// recFilter.tsx
import { useEffect, useState } from 'react';
import { 
  getExcludedGenres, 
  addExcludedGenre, 
  removeExcludedGenre,
  getExcludedPlatforms,
  addExcludedPlatform,
  removeExcludedPlatform
} from '@api/recommendation/exclusionsEdit';
import { getAllGenres, Genre } from '@api/gamesPage/getAllgenres';
import PC from '@shared/assets/svg/PC.svg';
import PS from '@shared/assets/svg/PS.svg';
import Switch from '@shared/assets/svg/Switch.svg';

interface RecFilterProps {
  excludedGenres: number[];
  excludedPlatforms: number[];
  setExcludedGenres: React.Dispatch<React.SetStateAction<number[]>>;
  setExcludedPlatforms: React.Dispatch<React.SetStateAction<number[]>>;
}

export default function RecFilter({
  excludedGenres,
  excludedPlatforms,
  setExcludedGenres,
  setExcludedPlatforms
}: RecFilterProps) {
  const [allGenres, setAllGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const platforms = [
    { id: 1, icon: PC, name: 'PC' },
    { id: 2, icon: PS, name: 'PlayStation' },
    { id: 3, icon: Switch, name: 'Nintendo Switch' }
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [genres, excludedGenresData, excludedPlatformsData] = await Promise.all([
          getAllGenres(),
          getExcludedGenres(),
          getExcludedPlatforms()
        ]);
        
        setAllGenres(genres);
        setExcludedGenres(excludedGenresData.map(g => g.genre_id));
        setExcludedPlatforms(excludedPlatformsData.map(p => p.platform_id));
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleGenreToggle = async (genreId: number) => {
    try {
      if (excludedGenres.includes(genreId)) {
        await removeExcludedGenre({ genre_id: genreId });
        setExcludedGenres(prev => prev.filter(id => id !== genreId));
      } else {
        await addExcludedGenre({ genre_id: genreId });
        setExcludedGenres(prev => [...prev, genreId]);
      }
    } catch (error) {
      console.error('Error toggling genre exclusion:', error);
    }
  };

  const handlePlatformToggle = async (platformId: number) => {
    try {
      if (excludedPlatforms.includes(platformId)) {
        await removeExcludedPlatform({ platform_id: platformId });
        setExcludedPlatforms(prev => prev.filter(id => id !== platformId));
      } else {
        await addExcludedPlatform({ platform_id: platformId });
        setExcludedPlatforms(prev => [...prev, platformId]);
      }
    } catch (error) {
      console.error('Error toggling platform exclusion:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mt-16 flex flex-col justify-center">
        <div className="text-4xl font-display self-center uppercase">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="container mt-32 flex flex-col space-y-12">
      <div className="bg-purple-dark rounded-xl p-6 flex flex-col items-center">
        <h2 className="text-3xl font-display uppercase mb-6">Исключить жанры</h2>
        <div className="flex flex-wrap gap-4">
          {allGenres.map(genre => (
            <div 
              key={genre.genre_id}
              className={`px-4 py-2 rounded-full border-2 cursor-pointer transition-all duration-300
                ${excludedGenres.includes(genre.genre_id) 
                  ? 'bg-purple-light border-white text-white shadow-[0_0_10px_white]' 
                  : 'bg-transparent border-purple-light text-purple-light hover:border-white hover:text-white'
                }`}
              onClick={() => handleGenreToggle(genre.genre_id)}
            >
              {genre.name}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-purple-dark rounded-xl p-6 flex flex-col items-center">
        <h2 className="text-3xl font-display uppercase mb-6">Исключить платформы</h2>
        <div className="flex space-x-4 justify-center items-center">
          {platforms.map(platform => {
            const isExcluded = excludedPlatforms.includes(platform.id);
            return (
              <div key={platform.id} className="flex flex-col items-center">
                <img
                  src={platform.icon}
                  className={`transition duration-300 filter brightness-90 cursor-pointer ${
                    isExcluded ? 'brightness-150 drop-shadow-[0_0_6px_white]' : ''
                  }`}
                  onClick={() => handlePlatformToggle(platform.id)}
                  alt={platform.name}
                />
                <span className={`text-lg mt-2 ${
                  isExcluded ? 'text-white font-bold' : 'text-gray'
                }`}>
                  {platform.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}