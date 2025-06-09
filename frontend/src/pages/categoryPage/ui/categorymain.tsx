import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Slide from '@shared/ui/slide';
import { useParams } from 'react-router-dom';
import Categorygame from '../ui/categorygame';
import { Game, getTopGamesByGenre } from '@api/categoryPage/getTopGamesByGenre';

export default function GameSection() {
  const [currentPage, setCurrentPage] = useState(0);
  const [games, setGames] = useState<Game[]>([]);
  const [genreName, setGenreName] = useState('экшены');
  const { genreId } = useParams<{ genreId: string }>();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        if (!genreId) return;
        
        const response = await getTopGamesByGenre(Number(genreId));
        setGames(response.games);
        setGenreName(response.genre_name || 'экшены');
      } catch (error) {
        console.error('Error fetching games:', error);
      }
    };
    fetchGames();
  }, [genreId]);

  const handlePrev = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage(prev => Math.min(games.length - 1, prev + 1));
  };

  if (!games.length) return <div className="container pt-24">Загрузка...</div>;
  const logo =games[currentPage]?.materials.find(m => m.material_type === 'screenshot')?.material_url || ''
  return (
    <section>
      <div className="relative h-screen pt-24">
        <img
          className="object-cover h-full w-full mask-[radial-gradient(50%_50%_at_50%_50%,#212121_19.71%,rgba(33,33,33,0.15)_100%)]"
          src={logo}
          alt={games[currentPage]?.title || 'background'}
        />
        
        <div className="container">
          <div className="absolute flex bottom-0 h-screen">
            <div className="flex flex-col mt-40 space-y-12">
              <h1 className="text-7xl font-display uppercase self-center">
                {genreName}
              </h1>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                >
                  <Categorygame game={games[currentPage]} />
                </motion.div>
              </AnimatePresence>
              
              <Slide
                totalPages={games.length}
                currentPage={currentPage}
                handlePrev={handlePrev}
                handleNext={handleNext}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}