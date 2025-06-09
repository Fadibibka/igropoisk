import { useEffect, useState } from 'react';
import { getAllUserRatings, UserRatingWithGame } from '@api/userinfo/getUserRatings';
import ReviewCard from '@shared/components/reviewcard.tsx';
import { Link } from 'react-router-dom';

export default function UserRatingsPage() {
  const [ratings, setRatings] = useState<UserRatingWithGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRatings = async () => {
      try {
        const data = await getAllUserRatings();
        console.log('Received ratings data:', data); // Добавьте эту строку
        setRatings(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    loadRatings();
  }, []);

  if (loading) {
    return <div>Загрузка ваших оценок...</div>;
  }

  if (ratings.length === 0) {
    return <div>Вы еще не оставляли отзывов</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Ваши отзывы</h1>
      
      <div className="grid grid-cols-1 gap-6">
        {ratings.map((ratingData) => {
          console.log(ratingData)
          return (
            <div key={ratingData.rating.rating_id} className="mb-8">
              <h2 className="text-xl font-semibold mb-2">
                {ratingData.game_title} - {ratingData.rating.rating}/5
              </h2>
              <Link 
                to={`/game/${ratingData.rating.game_id}/reviews`}
              >
            <ReviewCard
              key={ratingData.rating.rating_id} 
              review={ratingData.rating}
            />
              </Link>

            </div>
          );
        })}
      </div>
    </div>
  );
}