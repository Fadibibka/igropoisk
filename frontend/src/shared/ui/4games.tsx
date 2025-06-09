import { useEffect, useState } from 'react';
import Gamecard from '@shared/ui/gamecard';
import { getPopularGames, Game } from '@api/mainPage/getPopular';

export default function Four_games() {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    getPopularGames().then(setGames).catch(console.error);
  }, []);

  return (
    <div className="grid grid-cols-4 gap-6 h-128">
      {games.slice(0, 4).map((game) => (
        <Gamecard key={game.game_id} game={game} />
      ))}
    </div>
  );
}