import PC from '@shared/assets/svg/PC.svg';
import PS from '@shared/assets/svg/PS.svg';
import Switch from '@shared/assets/svg/Switch.svg';
import Gamedesc from './gamedesc.tsx'
import Stars from '../../../shared/components/stars.tsx';
import Gamescreens from '../components/gamescreens.tsx'
import Gamerating from './gamerating.tsx'
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getGameById, Game } from '@api/gamePage/getGameinfo.tsx';

const GameMain = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gameId) return;

    getGameById(Number(gameId))
      .then(setGame)
      .catch((err) => console.error(err.message))
      .finally(() => setLoading(false));
  }, [gameId]);

  if (loading) return <p>Загрузка...</p>;
  if (!game) return <p>Игра не найдена</p>;
  const logo = (game.materials.find(m => m.material_type === 'horizontal_logo')?.material_url);

  return (
    <>
    <section className="container mt-32 w-full">
      <h1 className="text-6xl font-display uppercase pb-4">{game.title}</h1>

      <div className="flex space-x-3 items-center">
      <Stars rating={game.average_user_rating} />
      <p className='text-2xl'>{game.average_user_rating}</p>
        <p className='text-2xl'>(2345 оценок)</p>
        <img className='w-10 h-10' src={PC} />
        <img className='w-10 h-10' src={PS} />
        <img className='w-10 h-10' src={Switch} />
      </div>

      <div className='flex mt-4'>
        <Gamescreens materials={game.materials} />

        <div className='flex flex-col w-1/3 space-y-4 pl-10'>
          <img className='w-full rounded-xl' src={logo} />

          <div className='flex space-x-2 mx-auto'>
            {game.genres.map((genre) => (
              <button key={genre.genre_id} className='bg-purple rounded-lg uppercase text-md py-2 px-4'>
                {genre.name}
              </button>
            ))}
          </div>

          <p className='text-xl'>
            {game.description.split(' ').slice(0, 25).join(' ')}
            {game.description.split(' ').length > 25 && '...'}
          </p>

          <div className='flex flex-col space-y-4'>
            <div className='w-full h-0.5 bg-white'></div>

            <div className='flex justify-between'>
              <p className='text-xl'>Дата выхода</p>
              <p className='text-xl'>{new Date(game.release_date).toLocaleDateString('ru-RU')}</p>
            </div>

            <div className='w-full h-0.5 bg-white'></div>

            <div className='flex justify-between'>
              <p className='text-xl'>Разработчик</p>
              <p className='text-xl'>{game.developer}</p>
            </div>

            <div className='w-full h-0.5 bg-white'></div>

            <div className='flex justify-between'>
              <p className='text-xl'>Издатель</p>
              <p className='text-xl'>{game.publisher}</p>
            </div>

            <div className='w-full h-0.5 bg-white'></div>

            <div className='flex justify-between'>
              <p className='text-xl'>Ссылка на игру</p>
              <a className='text-xl text-blue-400 underline' href={game.steam_url} target='_blank' rel='noreferrer'>
                Steam
              </a>
            </div>

            <div className='w-full h-0.5 bg-white'></div>
          </div>
        </div>
      </div>
    </section>
    <Gamedesc about={game.about_game} />
    <Gamerating
        game_id={game.game_id}
        average_user_rating={game.average_user_rating}
        steam_rating={game.steam_rating}
        average_critic_rating={game.average_critic_rating}
        average_critic_rec={game.average_critic_rec}
        />
</>
  );
};

export default GameMain;
