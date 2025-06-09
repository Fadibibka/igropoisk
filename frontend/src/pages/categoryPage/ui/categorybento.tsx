import { useState, useEffect } from "react";
import { getAllGamesByGenre } from "@api/categoryPage/getAllGamesByGenre";
import { Link, useParams } from "react-router-dom";
interface Game {
  game_id: number;
  title: string;
  description: string;
  release_date?: string;
  genres: GameGenre[];
  materials: GameMaterial[];
}

interface GameMaterial {
  material_id: number;
  material_url: string;
  material_type: 'horizontal_logo' | 'vertical_logo' | 'trailer' | 'screenshot';
}

interface GameGenre {
  genre_id: number;
  name: string;
  description: string;
}

export default function Categorybento() {
  const [games, setGames] = useState<Game[]>([]);
  const [genreName, setGenreName] = useState('');
  const [blockCount, setBlockCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { genreId } = useParams<{ genreId: string }>();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setIsLoading(true);
        const { games: fetchedGames, genre_name } = await getAllGamesByGenre(Number(genreId));
        setGames(fetchedGames);
        console.log(fetchedGames)
        setGenreName(genre_name);
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (genreId) fetchGames();
  }, [genreId]);

  

const getGameImage = (game: Game): string => {
  if (!game?.materials) return '';
  const logo = game.materials.find(m => m.material_type === 'horizontal_logo');
  const screenshot = game.materials.find(m => m.material_type === 'screenshot');
  return (logo?.material_url || screenshot?.material_url || '');
};
const renderBlock = (index: number) => {
  if (games.length === 0) return null;

  const blockGames = [];
  for (let i = 0; i < 8; i++) {
    const gameIndex = i % games.length;
    blockGames.push(games[gameIndex]);
  }

  return (
    <div key={index} className="grid grid-cols-4 grid-rows-3 gap-6 mt-12">
      {/* Первый ряд */}
      <div className="col-span-2 row-span-1">
        <Link to={`/game/${blockGames[0].game_id}`}>
          <img
            className="w-full h-full object-cover rounded-xl"
            src={getGameImage(blockGames[0])}
            alt={blockGames[0].title}
          />
        </Link>
      </div>

      {/* Второй ряд */}
      <div className="col-span-2 row-span-2 flex flex-col gap-6">
        <Link className="w-full h-full object-cover rounded-xl" to={`/game/${blockGames[1].game_id}`}>
          <img
            className="w-full h-full object-cover rounded-xl"
            src={getGameImage(blockGames[1])}
            alt={blockGames[1].title}
          />
        </Link>
        <div className="flex space-x-6">
          <Link  to={`/game/${blockGames[2].game_id}`}>
            <img
              className="h-full object-cover rounded-xl"
              src={getGameImage(blockGames[2])}
              alt={blockGames[2].title}
            />
          </Link>
          <Link to={`/game/${blockGames[3].game_id}`}>
            <img
              className=" h-full object-cover rounded-xl"
              src={getGameImage(blockGames[3])}
              alt={blockGames[3].title}
            />
          </Link>
        </div>
      </div>

      {/* Третий ряд */}
      <div className="col-span-2 row-span-1">
        <Link to={`/game/${blockGames[4].game_id}`}>
          <img
            className="w-full h-full object-cover rounded-xl"
            src={getGameImage(blockGames[4])}
            alt={blockGames[4].title}
          />
        </Link>
      </div>

      {/* Четвёртый ряд */}
      <div className="col-span-2 flex gap-6">
        <Link to={`/game/${blockGames[5].game_id}`}>
          <img
            className="w-full h-full object-cover rounded-xl"
            src={getGameImage(blockGames[5])}
            alt={blockGames[5].title}
          />
        </Link>
        <Link to={`/game/${blockGames[6].game_id}`}>
          <img
            className="w-full h-full object-cover rounded-xl"
            src={getGameImage(blockGames[6])}
            alt={blockGames[6].title}
          />
        </Link>
      </div>

      <div className="col-span-2">
        <Link to={`/game/${blockGames[7].game_id}`}>
          <img
            className="w-full h-full object-cover rounded-xl"
            src={getGameImage(blockGames[7])}
            alt={blockGames[7].title}
          />
        </Link>
      </div>
    </div>
  );
};

if (isLoading) {
  return <div className="container pt-24">Загрузка...</div>;
}

if (!games.length) {
  return <div className="container pt-24">Игр не найдено</div>;
}

return (
  <section className="container pt-24">
    <h1 className="text-7xl font-display">Популярное в {genreName.toLowerCase()}</h1>

    {Array.from({ length: blockCount }).map((_, idx) => renderBlock(idx))}

    <div className="flex justify-center mt-10">
      <button 
        onClick={() => setBlockCount(c => c + 1)}
        className="bg-purple px-8 py-4 rounded-xl text-lg font-medium hover:bg-gray transition"
      >
        Показать еще
      </button>
    </div>
  </section>
);
}

