import VideoPlayer from '@shared/widgets/player/player';
import { Game } from '@api/categoryPage/getTopGamesByGenre';
import ellipse from '@shared/assets/svg/Ellipse.svg'
import favorite from '@shared/assets/svg/favorite.svg'

interface Props {
  game: Game;
}

export default function Categorygame({ game }: Props) {
  const trailer =  game.materials.find(m => m.material_type === 'trailer');
  const poster = game.materials.find(m => m.material_type === 'screenshot');
  const logo = game.materials.find(m => m.material_type === 'horizontal_logo');

  return (
    <article className="container flex flex-col justify-center ">
        <div className='flex max-lg:flex-col'>
            <VideoPlayer
            url={trailer?.material_url || ''}
            poster={poster?.material_url || ''}
            mode="default"
            rounded="rounded-l-xl"
            />
            
            <div className="bg-purple relative w-1/2 rounded-r-xl z-10 pl-10 pr-6 py-12 flex flex-col space-y-6">
                {logo && (
                <div className="flex items-start">
                    <img 
                    src={logo.material_url} 
                    alt={game.title}
                    className="rounded-xl object-cover -translate-x-20"
                    />
                    <img className="-translate-x-25.5 -translate-y-4" src={favorite} alt="favorite icon" />
                </div>
                )}

                <div className="flex space-x-4 text-gray">
                {game.genres.map((g, idx) => (
                        <div key={g.name} className="flex items-center space-x-2">
                        <p className="text-md uppercase">{g.name}</p>
                        {idx < game.genres.length - 1 && <img className="max-w-2" src={ellipse} alt="dot" />}
                        </div>
                    ))}
                </div>

                <p className="text-xl">{game.description || 'Описание отсутствует.'}</p>
            </div>
        </div>
    </article>
    
  );
}