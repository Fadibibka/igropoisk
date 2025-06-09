'use client';
import { useState, useEffect } from 'react';
import Stars from '../../../shared/components/stars.tsx';
import { submitRating, getUserRating, deleteUserRating } from '@api/gamePage/userRating.tsx';



interface GameratingProps {
  game_id: number;
  average_user_rating: number;
  steam_rating: string;
  average_critic_rating: number;
  average_critic_rec: number;
}

export default function Gamerating({
  game_id,
  average_user_rating,
  steam_rating,
  average_critic_rating,
  average_critic_rec
}: GameratingProps) {
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    getUserRating(game_id)
      .then((data) => {
        console.log(data.rating)
        if (typeof data.rating === 'number') {
          setUserRating(data.rating);
          
        }
      })
      .catch((err) => {
        console.error('Ошибка при получении пользовательской оценки', err);
      })
      .finally(() => setIsLoaded(true));
  }, [game_id]);

  const handleRatingChange = async (value: number) => {
    try {
      await submitRating({ game_id, rating: value });
      setUserRating(value);
    } catch (err) {
      console.error('Ошибка при отправке оценки', err);
    }
  };
  const getSteamRatingColor = (rating: string) => {
    switch (rating) {
      case 'Крайне положительные':
      case 'Очень положительные':
      case 'В основном положительные':
        return 'text-green';
      case 'Смешанные':
        return 'text-yellow';
      case 'Отрицательные':
      case 'Крайне отрицательные':
        return 'text-red-400';
      default:
        return 'text-white';
    }
  };
  const handleDeleteRating = async () => {
    try {
      await deleteUserRating(game_id);
      setUserRating(null);
    } catch (err) {
      console.error('Ошибка при удалении оценки', err);
    }
  };

  if (!isLoaded) return null;
  
  const displayedRating = typeof userRating === 'number' ? userRating : average_user_rating;
  const isUserRated = typeof userRating === 'number';

  return (
    <section className='container'>
      <div className='w-2/3 pt-12'>
        <div className='flex flex-col'>
          <div className='grid grid-cols-3 grid-rows-3 h-84 w-full gap-8 mt-6'>
            <div className='col-span-3 row-span-2 bg-purple rounded-xl flex flex-col p-6 w-full'>
              <p className='text-lg'>Рейтинг на платформе</p>
              <div className="flex flex-1 w-full items-center justify-center">
                <div className="flex flex-col items-center">
                  <Stars
                    size={50}
                    rating={displayedRating}
                    onChange={handleRatingChange}
                    type={'editable'}
                  />
                  <div className="flex gap-2 mt-2 items-center">
                    <p className="text-2xl">{displayedRating.toFixed(1)}</p>
                    <p className="text-2xl">(2345 оценок)</p>
                    {isUserRated && (
                      <>
                        <span className="text-green text-sm ml-4">Ваша оценка</span>
                        <button
                          className="ml-2 text-red-400 text-sm underline cursor-pointer"
                          onClick={handleDeleteRating}
                        >
                          Удалить
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Рейтинг Steam */}
            <div className='col-span-1 row-span-2 bg-purple rounded-xl flex flex-col p-4 w-full'>
              <p className='text-sm'>Рейтинг в Steam</p>
              <div className="flex flex-1 w-full items-center justify-center">
                <div className="flex items-center">
                  <p className={`text-xl ${getSteamRatingColor(steam_rating)}`}>
                    {steam_rating}
                  </p>
                </div>
              </div>
            </div>

            {/* Оценка критиков */}
            <div className='col-span-1 row-span-2 bg-purple rounded-xl flex p-4 w-full justify-between items-center'>
              <p className='text-sm'>Оценка критиков</p>
              <div
                className="progress-bar relative flex items-center justify-center text-sm"
                style={{
                  background: `
                    radial-gradient(closest-side, rgba(47, 46, 50, 1) 79%, transparent 80% 100%),
                    conic-gradient(rgba(119, 219, 131, 1) ${average_critic_rating}%, rgba(119, 219, 131, 0.2) 0
                  `,
                  width: '4.5rem',
                  height: '4.5rem',
                  borderRadius: '9999px'
                }}
              >
                <span className="absolute text-white">{average_critic_rating}%</span>
              </div>
            </div>

            {/* Рекомендации критиков */}
            <div className='col-span-1 row-span-2 bg-purple rounded-xl flex p-4 w-full justify-between items-center'>
              <p className='text-sm'>Рекомендации критиков</p>
              <div
                className="progress-bar relative flex items-center justify-center text-sm"
                style={{
                  background: `
                    radial-gradient(closest-side, rgba(47, 46, 50, 1) 79%, transparent 80% 100%),
                    conic-gradient(rgba(119, 219, 131, 1) ${average_critic_rec}%, rgba(119, 219, 131, 0.2) 0
                  `,
                  width: '4.5rem',
                  height: '4.5rem',
                  borderRadius: '9999px'
                }}
              >
                <span className="absolute text-white">{average_critic_rec}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
