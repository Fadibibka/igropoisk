import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPopularGames, Game } from '@api/mainPage/getPopular';

const Wanted: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    getPopularGames().then(setGames).catch(console.error);
  }, []);

  return (
    <div className="flex flex-col items-start px-12">
        <h1 className='text-2xl font-display mb-6'>Буду играть</h1>
      <section className="w-full">
        <div className="flex">
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {games.slice(0, 4).map((game) => {
              const logo =
                game.materials.find((m) => m.material_type === 'vertical_logo')?.material_url || '/fallback.jpg';
              const genre = game.genres?.[0]?.name || 'Жанр';
              const title = game.title || 'Название игры';

              return (
                <Link
                  key={game.game_id}
                  to={`/game/${game.game_id}`}
                  className="flex flex-col items-start hover:scale-[1.01] transition-transform duration-200"
                >
                  <div className="w-full aspect-[4/5] rounded-xl shadow-md overflow-hidden mb-2">
                    <img
                      className="w-full h-full object-cover"
                      src={logo}
                      alt={title}
                    />
                  </div>
                  <div className="w-full space-y-1">
                    <p className="text-gray text-lg uppercase truncate">{genre}</p>
                    <h2 className="font-display text-white text-lg line-clamp-2 leading-tight">{title}</h2>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Wanted;
