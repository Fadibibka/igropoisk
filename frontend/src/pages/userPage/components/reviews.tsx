import { useEffect, useState } from 'react';
import { getAllUserRatings, UserRatingWithGame } from '@api/userinfo/getUserRatings';
import ReviewCard from '@shared/components/reviewcard.tsx';
import { Link } from 'react-router-dom';

export default function UserRatingsPage() {
  const [ratings, setRatings] = useState<UserRatingWithGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRatings = async () => {
      try {
        const data = await getAllUserRatings();
        
        // Дополнительная проверка перед установкой состояния
        if (!data || !Array.isArray(data)) {
          throw new Error('Некорректный формат данных');
        }
        
        setRatings(data);
      } catch (err) {
        console.error('Load ratings error:', err);
        setError('Ошибка загрузки отзывов');
      } finally {
        setLoading(false);
      }
    };
    
    loadRatings();
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Загрузка ваших оценок...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500 text-center">{error}</div>;
  }

  if (ratings.length === 0) {
    return <div className="p-4 text-center">Вы еще не оставляли отзывов</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Ваши отзывы</h1>
      
      <div className="grid grid-cols-1 gap-6">
        {ratings.map((item) => {
          // Проверка наличия всех обязательных полей
          if (!item.rating || !item.rating.rating_id) {
            console.warn('Invalid rating item:', item);
            return null;
          }

          return (
            <div key={`${item.rating.rating_id}-${item.rating.user_id}`} className="mb-8">
              <h2 className="text-xl font-semibold mb-2">
                {item.game_title} - {item.rating.rating}/5
              </h2>
              <Link to={`/game/${item.rating.game_id}/reviews`}>
                <ReviewCard review={item.rating} />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}