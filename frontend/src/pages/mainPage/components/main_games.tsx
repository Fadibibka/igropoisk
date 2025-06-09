import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ellipse from '@shared/assets/svg/Ellipse.svg';
import { getHeroGames } from '@api/mainPage/getHero.tsx';
import arrow from '@shared/assets/svg/arrow.svg';
import VideoPlayer from '@shared/widgets/player/player';
import Slidermini from './mini_slidermain.tsx';

interface Slide {
  title: string;
  tags: string[];
  description: string;
  videoUrl: string;
  posterUrl: string;
  miniImages: string[];
}

const slideVariants = {
  enter: (direction: number) => ({
    x: `${direction * 100}%`,
    opacity: 0
  }),
  center: {
    x: "0%",
    opacity: 1
  },
  exit: (direction: number) => ({
    x: `${direction * -100}%`,
    opacity: 0
  })
};

export default function MainGamesSlider() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const games = await getHeroGames();
      
      const formattedSlides = games.map(game => ({
        title: game.title,
        game_id: game.game_id,
        tags: game.genres.map(genre => genre.name),  // заменили разработчика/издателя на жанры
        description: game.description,
        videoUrl: game.materials.find(m => m.material_type === 'trailer')?.material_url || '',
        posterUrl: game.materials.find(m => m.material_type === 'horizontal_logo')?.material_url || '',
        miniImages: game.materials
          .filter(m => m.material_type === 'screenshot')
          .map(m => m.material_url)
          .slice(0, 3)
      }));

      setSlides(formattedSlides);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading games:', error);
      setIsLoading(false);
    }
  }, []);

  const nextSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setDirection(1);
    setActiveSlide(prev => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setDirection(-1);
    setActiveSlide(prev => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = useCallback((index: number) => {
    if (index === activeSlide || slides.length <= 1) return;
    setDirection(index > activeSlide ? 1 : -1);
    setActiveSlide(index);
  }, [activeSlide, slides.length]);

  const startAutoPlay = useCallback(() => {
    stopAutoPlay();
    if (slides.length > 1) {
      intervalRef.current = setInterval(nextSlide, 8000);
    }
  }, [nextSlide, slides.length]);

  const stopAutoPlay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetAutoPlay = useCallback(() => {
    stopAutoPlay();
    setTimeout(startAutoPlay, 30000);
  }, [startAutoPlay, stopAutoPlay]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (slides.length > 1) {
      startAutoPlay();
    }
    return () => stopAutoPlay();
  }, [slides, startAutoPlay, stopAutoPlay]);

  if (isLoading) {
    return (
      <motion.div 
        className="h-screen flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Loading...
      </motion.div>
    );
  }

  if (slides.length === 0) {
    return (
      <motion.div 
        className="h-screen flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        No games available
      </motion.div>
    );
  }

  const currentSlide = slides[activeSlide];

  return (
    <section className="relative h-screen overflow-hidden">
      <AnimatePresence custom={direction} initial={false}>
        <motion.div
          key={activeSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          
          transition={{duration: 0.6 
          }}
          className="absolute top-0 left-0 w-full h-full flex"
        >
          <div className=" min-w-full h-[92%] self-end relative pl-128 max-lg:pl-0 max-lg:pb-128">
            <VideoPlayer 
              url={currentSlide.videoUrl} 
              poster={currentSlide.posterUrl} 
              mode="hero" 
            />
            <div className="absolute left-0 bottom-0 w-full h-full bg-[linear-gradient(270deg,rgba(33,33,33,0)_0%,#212121_57.56%)] max-lg:bg-[linear-gradient(180deg,rgba(33,33,33,0)_0%,#212121_57.56%)]"></div>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="container">
      <div className="absolute flex bottom-0 h-full w-full pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide} // всё как у тебя
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.7 }}
              className="flex flex-col justify-center space-y-16 max-lg:justify-end max-lg:pb-24 w-full"
            >
              <div className="space-y-6">
                <motion.h1
                  className="text-7xl font-display uppercase"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                {currentSlide.title}
                 
                </motion.h1>

                <motion.div
                  className="flex space-x-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {currentSlide.tags.map((tag, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <p className="text-xl uppercase">{tag}</p>
                      {idx < currentSlide.tags.length - 1 && <img src={ellipse} alt="" />}
                    </div>
                  ))}
                </motion.div>

                <motion.div
                  className="max-w-182 text-3xl bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {currentSlide.description}
                </motion.div>
              </div>

              {currentSlide.miniImages?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Slidermini images={currentSlide.miniImages} />
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>


        {/* Навигация */}
        {slides.length > 1 && (
          <motion.div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 pb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex space-x-6 justify-center items-center pointer-events-auto">
              <button 
                onClick={() => { prevSlide(); resetAutoPlay(); }} 
                className="focus:outline-none cursor-pointer"
              >
                <img className="rotate-180" src={arrow} alt="Previous" />
              </button>
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => { goToSlide(index); resetAutoPlay(); }}
                  className={`rounded w-9 h-[22px] transition-colors duration-300 ${
                    index === activeSlide ? 'bg-white' : 'bg-gray hover:bg-gray-400'
                  }`}
                />
              ))}
              <button 
                onClick={() => { nextSlide(); resetAutoPlay(); }} 
                className="focus:outline-none cursor-pointer"
              >
                <img src={arrow} alt="Next" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}