import { useEffect, useState } from 'react';
import { getRecommendations, GameRecommendation } from '@api/recommendation/getRecommendations';
import Recarrow from '../ui/recarrow';

export default function Main_games() {
  const [mainGames, setMainGames] = useState<GameRecommendation[]>([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await getRecommendations();
        setMainGames(data.main);
      } catch (error) {
        console.error('Ошибка при получении рекомендаций:', error);
      }
    };
    fetchRecommendations();
  }, []);

  return (
    <section className="bg-purple mt-32">
      <div className="container py-16">
        <h1 className="text-6xl font-display">Ваш персональный каталог</h1>
        <div className="flex relative mt-12">
          <div className="relative flex -space-x-84 w-full overflow-hidden h-108 justify-center items-center">
            {mainGames.slice(0, 4).map((game, index) => {
              const screenshot = game.explanation?.materials?.find(
                (m) => m.material_type === 'screenshot'
              );

              if (!screenshot) return null;

              const heightMap = ['h-[90%]', 'h-[80%]', 'h-[70%]', 'h-[60%]'];
              const zIndexMap = ['z-10', 'z-9', 'z-8', 'z-7'];
              const overlayMap = ['overlay-dark-1', 'overlay-dark-2', 'overlay-dark-3', 'overlay-dark-4'];

              return (
                <div
                  key={game.game_id}
                  className={`relative w-full ${heightMap[index]} ${zIndexMap[index]} ${overlayMap[index]}`}
                >
                  <img
                    className="h-full w-full object-cover rounded-xl"
                    src={screenshot.material_url}
                    alt={game.title}
                  />
                </div>
              );
            })}
          </div>
          <div className="absolute flex items-center pl-16 self-center z-12">
            <Recarrow />
          </div>
        </div>
      </div>
    </section>
  );
}