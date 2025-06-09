import { useState } from 'react';
import { Link } from 'react-router-dom';
import Stars from '@shared/components/stars.tsx';
import FavoriteButton from '@shared/widgets/addTo/favoriteButton';
import PlayedButton from '@shared/widgets/addTo/playedButton';

interface GamecardProps {
  game?: {
    game_id: number;
    title?: string;
    average_user_rating?: number;
    genres?: { name: string }[];
    materials?: { material_url: string; material_type: string }[];
  };
  className?: string;
}

const Gamecard: React.FC<GamecardProps> = ({ game, className }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const logo = game?.materials?.find((m) => m.material_type === 'vertical_logo')?.material_url;
  const genre = game?.genres?.[0]?.name || 'Жанр';
  const title = game?.title || 'Название игры';
  const rating = game?.average_user_rating || 0;

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/game/${game?.game_id}`} className={`flex flex-col items-start hover:scale-[1.01] transition-transform duration-200 ${className}`}>
      <div className="w-full aspect-[4/5] rounded-xl shadow-md overflow-hidden mb-2">
        <img
          className="w-full h-full object-cover"
          src={logo || '/fallback.jpg'}
          alt={title}
        />
      </div>

      <div className="w-full space-y-1">
        <p className="text-gray text-lg uppercase truncate">{genre}</p>
        <h2 className="font-display text-white text-lg line-clamp-2 leading-tight">{title}</h2>
      </div>
    </Link>
      {/* Рейтинг */}
      <div className={`bg-black/80 rounded-lg p-2
          absolute right-0 top-0 flex flex-col items-end justify-start space-y-3 m-4
          transition-all duration-300 ease-in-out
          ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        `}>
          <Stars rating={rating} size={20} />
        </div>
      {/* Анимированная панель с рейтингом и кнопками */}
      <div 
        className={`
          absolute right-0 top-12 flex flex-col items-end justify-start space-y-3 m-4
          transition-all duration-300 ease-in-out
          ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        `}
      >
        

        {/* Кнопка 1 - Добавить в желаемое */}
        <FavoriteButton gameId={game?.game_id || 0} />

        {/* Кнопка 2 - Пройдено */}
        <PlayedButton gameId={game?.game_id || 0} />
      </div>
    </div>
  );
};

export default Gamecard;