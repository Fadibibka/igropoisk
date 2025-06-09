import { useEffect, useState } from 'react';
import Gamecard from '@shared/ui/gamecard';
import { getMyFavorites, Game } from '@api/addTo/favorites/favorites';

const Wanted = () => {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    getMyFavorites().then(setGames).catch(console.error);
  }, []);

  return (
    
        <div className="flex flex-col items-start">
            <div className='flex w-full justify-between'>
                <h1 className='text-xl font-display uppercase'>Буду играть</h1>
            </div>
            <section className="w-full py-10 px-12 overflow-x-hidden">
                <div className="flex">
                <div className="grid grid-cols-4 gap-6">
                    {games.slice(0, 4).map((game) => (
                    <Gamecard key={game.game_id} game={game} />
                    ))}
                </div>
                </div>
            </section>
        </div>
        
    
    
  );
};

export default Wanted;