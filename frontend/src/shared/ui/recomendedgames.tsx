import { useEffect, useState } from 'react';
import Gamecard from '@shared/ui/gamecard';
import { getRecommendations, GameRecommendation } from '@api/recommendation/getRecommendations';

export default function Main_games() {
  const [topGames, setTopGames] = useState<GameRecommendation[]>([]);
  const [nextGames, setNextGames] = useState<GameRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        const data = await getRecommendations();
        
        // Берём только additional, делим на 4 + 6
        const additional = data.additional || [];
        setTopGames(additional.slice(0, 2));
        setNextGames(additional.slice(2, 5));
      } catch (error) {
        console.error('Error loading recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  // Преобразуем жанры из string[] в {name: string}[]
  const transformGenres = (genres: string[]) => genres.map((g) => ({ name: g }));

  if (isLoading) {
    return (
      <section className="bg-purple mt-32">
        <div className="container flex flex-col py-16">
          <div className="text-6xl font-display pb-12">Загрузка...</div>
        </div>
      </section>
    );
  }

  if (!topGames.length && !nextGames.length) {
    return (
      <section className="bg-purple mt-32">
        <div className="container flex flex-col py-16">
          <div className="text-6xl font-display pb-12">Рекомендации не найдены</div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-purple mt-32">
      <div className="container flex flex-col py-16">
        <div>
          <h1 className="text-6xl font-display pb-12">Ваши рекомендации</h1>
          <div className="grid grid-cols-2 w-full gap-6 ">
{topGames.map((game) => (
  <div key={game.game_id}>
    <Gamecard
      className="h-92"
      game={{
        ...game,
        genres: transformGenres(game.genres),
        materials: game.explanation.materials || [],
      }}
    />
    <div className="mt-2 text-sm text-white/80 space-y-1">
      {game.explanation.why_recommended.map((reason, index) => (
        <p key={index}>• {reason}</p>
      ))}
    </div>
  </div>
))}
          </div>
        </div>
        <div>
          <div className="grid grid-cols-3 w-full gap-6 mt-12">
{nextGames.map((game) => (
  <div key={game.game_id}>
    <Gamecard
      className="h-136"
      game={{
        ...game,
        genres: transformGenres(game.genres),
        materials: game.explanation.materials || [],
      }}
    />
    <div className="mt-2 text-sm text-white/80 space-y-1">
      {game.explanation.why_recommended.map((reason, index) => (
        <p key={index}>• {reason}</p>
      ))}
    </div>
  </div>
))}
          </div>
        </div>
      </div>
    </section>
  );
}
