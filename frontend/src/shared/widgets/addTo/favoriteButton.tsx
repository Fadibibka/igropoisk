import { useState, useEffect } from 'react';
import { addToFavorites, removeFromFavorites, checkIsFavorite } from '@api/addTo/favorites/favorites';
import Favorite from '@shared/assets/svg/Favorite.svg';


const FavoriteButton = ({ gameId }: { gameId: number }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Проверяем при загрузке, есть ли игра в избранном
  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const favoriteStatus = await checkIsFavorite(gameId);
        setIsFavorite(favoriteStatus);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };
    
    checkFavorite();
  }, [gameId]);

  const handleFavoriteClick = async () => {
    try {
      if (isFavorite) {
        await removeFromFavorites(gameId);
        setIsFavorite(false);
      } else {
        await addToFavorites(gameId);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  return (
    <div className="relative">
      <button
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
          isFavorite ? 'bg-yellow' : 'bg-purple hover:bg-yellow'
        }`}
        onClick={handleFavoriteClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img 
          className="w-4 h-4" 
          src={Favorite} 
          alt={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
        />
      </button>
      {isHovered && (
        <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 bg-purple text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {isFavorite ? "Удалить из избранного" : "Добавить в желаемое"}
        </div>
      )}
    </div>
  );
};

export default FavoriteButton;