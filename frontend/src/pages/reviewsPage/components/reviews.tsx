import { useEffect, useState } from 'react';
import { getGameReviews, UserRating } from '@api/gamePage/getGamereviews.tsx';
import { useParams } from 'react-router-dom';
import ReviewCard from '../../../shared/components/reviewcard.tsx'; // путь поправьте
import ReviewForm from './reviewadd.tsx';


export default function Main_games() {
  const { gameId } = useParams<{ gameId: string }>();
  const [reviews, setReviews] = useState<UserRating[]>([]);
  const [title, setTitle] = useState<string>('Загрузка...');

  useEffect(() => {
    if (!gameId) return;

    getGameReviews(Number(gameId))
      .then(data => {
        setReviews(data.reviews);
        setTitle(data.title || 'Без названия');
      })
      .catch((err) => console.error(err.message));
  }, [gameId]);

  return (
    <section className="container mt-32">
      <div className="mt-16 w-2/3">
        <div className='flex justify-between'>
          <h2 className="text-3xl font-display">Отзывы на игру {title}</h2>

            <button className='px-8 py-2 bg-purple rounded-xl hover:bg-gray cursor-pointer'>Написать свой отзыв</button>
        </div>
        <div className="grid grid-cols-1 gap-6 mt-4">
          {reviews.map((review) => (
            <ReviewCard key={review.rating_id} review={review} />
          ))}
        </div>
      </div>
      <ReviewForm gameId={Number(gameId)} onSubmitSuccess={() => {
  // перезапросить отзывы
  getGameReviews(Number(gameId))
    .then(data => {
      setReviews(data.reviews);
      setTitle(data.title || 'Без названия');
    });
}} />
    </section>
    
  );
}
