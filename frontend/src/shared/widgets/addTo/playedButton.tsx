import { useState, useEffect } from 'react';
import { addToPlayed, removeFromPlayed, checkIsPlayed } from '@api/addTo/played/played';
import Played from '@shared/assets/svg/passed.svg';


const PlayedButton = ({ gameId }: { gameId: number }) => {
  const [isPlayed, setIsPlayed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Проверяем при загрузке, есть ли игра в избранном
  useEffect(() => {
    const checkPlayed = async () => {
      try {
        const playedStatus = await checkIsPlayed(gameId);
        setIsPlayed(playedStatus);
      } catch (error) {
        console.error('Error checking played status:', error);
      }
    };
    
    checkPlayed();
  }, [gameId]);

  const handlePlayedClick = async () => {
    try {
      if (isPlayed) {
        await removeFromPlayed(gameId);
        setIsPlayed(false);
      } else {
        await addToPlayed(gameId);
        setIsPlayed(true);
      }
    } catch (error) {
      console.error('Error updating played:', error);
    }
  };

  return (
    <div className="relative">
      <button
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
          isPlayed ? 'bg-yellow' : 'bg-purple hover:bg-yellow'
        }`}
        onClick={handlePlayedClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img 
          className="w-4 h-4" 
          src={Played} 
          alt={isPlayed ? "Удалить из пройденных" : "Добавить в пройденные"}
        />
      </button>
      {isHovered && (
        <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 bg-purple text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {isPlayed ? "Удалить из пройденных" : "Добавить в пройденные"}
        </div>
      )}
    </div>
  );
};

export default PlayedButton;