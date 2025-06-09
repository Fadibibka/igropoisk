import { useEffect, useRef, useState } from 'react';
import { getSearchedGames, Game } from '@api/gamesPage/getAllgames';
import Gamecard from '@shared/ui/gamecard';

interface Props {
  query: string;
  onClose: () => void;
}

export default function SearchDropdown({ query, onClose }: Props) {
  const [results, setResults] = useState<Game[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetch = async () => {
      if (query.trim()) {
        const games = await getSearchedGames(query);
        setResults(games);
      } else {
        setResults([]);
      }
    };
    fetch();
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!results.length) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full mt-2 left-0 right-0 bg-black border border-gray-700 rounded-xl max-h-96 overflow-y-auto z-50 p-4 custom-scroll"
    >
      <div className="grid grid-cols-1 gap-4 overflow-x-hidden">
        {results.map((game) => (
          <Gamecard key={game.game_id} game={game} />
        ))}
      </div>
    </div>
  );
}
