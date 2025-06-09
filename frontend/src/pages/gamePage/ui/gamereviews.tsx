import { useEffect, useState } from 'react';
import { getGameReviews, UserRating } from '@api/gamePage/getGamereviews.tsx'; // путь под себя
import arrow from '@shared/assets/svg/arrow.svg';
import user from '@shared/assets/svg/user.svg';
import like from '@shared/assets/svg/like.svg';
import comments from '@shared/assets/svg/comments.svg';
import Stars from '../../../shared/components/stars.tsx';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function Main_games() {
  const { gameId } = useParams<{ gameId: string }>();
  const [reviews, setReviews] = useState<UserRating[]>([]);
  const currentPath = location.pathname;
  const [isOverflow, setIsOverflow] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  useEffect(() => {
    if (!gameId) return;

    getGameReviews(Number(gameId))
      .then(data => {
        setReviews(data.reviews);
      })
      .catch((err) => console.error(err.message));
  }, [gameId]);


  return (
    <section className="container">
      <div className="mt-16 w-2/3">
        <div className='flex justify-between'>
          <h2 className="text-3xl font-display">Отзывы на игру</h2>
          <Link to={`${currentPath}/reviews`} className={``}>
            <button className='px-8 py-2 bg-purple rounded-xl hover:bg-gray cursor-pointer'>
              Написать свой отзыв
            </button>
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-6 mt-4">
          {reviews.map((review) => (
            <div className="bg-purple rounded-xl flex flex-col p-8 w-full h-96" key={review.rating_id}>
            <div className="flex gap-4 items-center justify-between">
              <img src={user} alt="user" />
              <div className="flex flex-col">
                <p className="text-md">{review.user_login}</p>
                <p className="text-gray text-sm">
                  {new Date(review.created_at).toLocaleDateString('ru-RU')}
                </p>
              </div>
              <Stars size={15} rating={+review.rating} />
            </div>
          
            <div className="flex pt-1 space-x-1 self-end">
              <p className="text-xs text-gray">{review.likes ?? 0}</p>
              <img className="w-4 h-4" src={like} alt="like" />
              <p className="text-xs text-gray">{review.dislikes ?? 0}</p>
              <img className="w-4 h-4 rotate-180" src={like} alt="dislike" />
              <p className="text-xs text-gray">{review.comments ?? 0}</p>
              <img className="w-4 h-4" src={comments} alt="comments" />
            </div>
          
            <div className="w-full h-0.5 bg-gray mt-2"></div>
          
            <div className="relative overflow-hidden">
              <div 
                className="h-full mt-4"
                ref={(el) => {
                  if (el) {
                    // Проверяем, есть ли переполнение текста
                    const isOverflowing = el.scrollHeight > el.clientHeight;
                    setIsOverflow(isOverflowing);
                  }
                }}
              >
                <pre className="text-sm whitespace-pre-wrap font-sans">
                  {review.review_text}
                </pre>
              </div>
              {isOverflow && (
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-purple via-purple/80 to-transparent flex flex-col items-end justify-end">
                  <div className="w-full h-0.5 bg-white"></div>
                  <button 
                    className="text-white text-lg flex"
                    onClick={() => {
                      // Логика для раскрытия полного отзыва
                      setIsExpanded(!isExpanded);
                    }}
                  >
                    <p>{isExpanded ? 'Свернуть' : 'Открыть'}</p>
                    <img 
                      className={`mt-2.5 w-3 h-3 ml-2 ${isExpanded ? 'rotate-270' : 'rotate-90'}`} 
                      src={arrow} 
                      alt="arrow" 
                    />
                  </button>
                </div>
              )}
            </div>
          </div>
          ))}
        </div>
      </div>
    </section>
  );
}
