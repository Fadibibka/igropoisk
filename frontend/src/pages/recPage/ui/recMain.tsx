// recMain.tsx
import { useEffect, useState } from 'react';
import ellipse from '@shared/assets/svg/Ellipse.svg';
import VideoPlayer from '@shared/widgets/player/player';
import { Game, getGameById } from '@api/gamePage/getGameinfo';
import { Link } from 'react-router-dom';
import { GameRecommendation, getRecommendations } from '@api/recommendation/getRecommendations';

interface RecMainProps {
  excludedGenres: number[];
  excludedPlatforms: number[];
}

export default function RecMain({ excludedGenres, excludedPlatforms }: RecMainProps) {
  const [recommendations, setRecommendations] = useState<GameRecommendation[]>([]);
  const [gamesData, setGamesData] = useState<Record<number, Game>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const recsResponse = await getRecommendations();
        
        // Фильтрация рекомендаций на основе исключений
        const allRecs = [...recsResponse.main, ...recsResponse.additional, ...recsResponse.reserve];
        setRecommendations(allRecs);

        const games: Record<number, Game> = {};
        for (const rec of allRecs) {
          try {
            const game = await getGameById(rec.game_id);
            games[rec.game_id] = game;
          } catch (error) {
            console.error(`Error fetching game ${rec.game_id}:`, error);
          }
        }
        setGamesData(games);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [excludedGenres, excludedPlatforms]); // Зависимости от excludedGenres и excludedPlatforms

  if (isLoading) {
    return (
      <div className="container mt-32 flex flex-col justify-center">
        <div className="text-6xl font-display self-center uppercase">Загрузка...</div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="container mt-32 flex flex-col justify-center">
        <div className="text-6xl font-display self-center uppercase">Рекомендации не найдены</div>
      </div>
    );
  }

  return (
    <div className="container mt-32 flex flex-col space-y-32">
      {recommendations.map((recommendation) => {
        const game = gamesData[recommendation.game_id];
        if (!game) return null;

        const trailer = game.materials.find(m => m.material_type === 'trailer');
        const screenshots = game.materials.filter(m => m.material_type === 'screenshot').slice(0, 4);
        const logo = game.materials.find(m => m.material_type === 'horizontal_logo');
        const displayedGenres = game.genres.slice(0, 3);

        return (
          <article key={recommendation.game_id} className="flex flex-col justify-center">
            <Link 
              to={`/game/${game.game_id}`} 
              className={`flex flex-col items-start hover:scale-[1.01] transition-transform duration-200`}
            >
              <h1 className="text-6xl font-display self-center uppercase">{game.title}</h1>
            </Link>
            <div className='flex h-146 pt-12 max-lg:flex-col'>
              <div className='w-1/2'>
                {trailer && (
                  <VideoPlayer 
                    url={trailer.material_url}
                    poster={logo?.material_url || ''} 
                    mode="default" 
                  />
                )}
              </div>
              <div className='bg-purple w-1/2 h-full rounded-xl -translate-x-4 pl-10 p-6 flex flex-col place-content-between'>
                <div className='grid grid-cols-2 gap-4'>
                  {screenshots.map((screenshot, i) => (
                    <div key={i} className='relative overlay-dark-3'>
                      <img 
                        className='rounded-xl object-cover w-full  h-42' 
                        src={screenshot.material_url} 
                        alt={`Скриншот ${i + 1}`}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex space-x-4 text-gray items-center">
                  {displayedGenres.map((genre, index) => (
                    <div key={genre.genre_id} className="flex items-center space-x-2">
                      <p className="text-xl uppercase">{genre.name}</p>
                      {index < displayedGenres.length - 1 && <img src={ellipse} alt="·" />}
                    </div>
                  ))}
                </div>
                <p className='font-display text-2xl line-clamp-3'>
                  {recommendation.explanation?.why_recommended?.join(' ') || recommendation.reason}
                </p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}