import img2 from '@shared/assets/img/doom.jpg'
import img3 from '@shared/assets/img/duna.jpg'
import img4 from '@shared/assets/img/ds.jpg'
import img5 from '@shared/assets/img/clairobsc.jpg'
import CountdownTimer  from './timer'

export default function Main_games() {
    const games = [
      { title: 'DOOM: THE DARK AGES', image: img2, releaseDate: '2025-10-03' },
      { title: 'DUNE: AWAKING', image: img3, releaseDate: '2025-11-12' },
      { title: 'DEATH STRANDING 2', image: img4, releaseDate: '2025-08-11' },
      { title: 'CLAIR OBSCURE', image: img5, releaseDate: '2025-07-07' },
    ];
      return (
        <section className="container mt-32">
          <h1 className="text-6xl font-display">Самые ожидаемые игры</h1>
          <div className="grid grid-cols-2 gap-6 pt-10 max-lg:grid-cols-1">
            {games.map((game, index) => (
              <div
                key={index}
                className="relative rounded-xl w-full h-108 bg-overlay"
                style={{
                  backgroundImage: `url('${game.image}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="relative flex flex-col place-content-between h-full z-10 p-12">
                  <div className="flex justify-between items-start">
                    <h2 className="font-display text-6xl">{game.title}</h2>
                    <p className="text-2xl">{new Date(game.releaseDate).toLocaleDateString()}</p>
                  </div>
                  <CountdownTimer targetDate={game.releaseDate} />
                </div>
              </div>
            ))}
          </div>
        </section>
      );
   };