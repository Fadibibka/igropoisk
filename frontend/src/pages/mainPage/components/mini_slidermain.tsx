import { useState, useEffect, useCallback, useRef } from 'react';
import arrowfull from '@shared/assets/svg/arrowfull.svg';

type SliderminiProps = {
  images: string[];
};

export default function Slidermini({ images }: SliderminiProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const startAutoPlay = useCallback(() => {
    stopAutoPlay(); // Остановим старый перед запуском нового
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 4000);
  }, [images.length]);

  const stopAutoPlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleNextClick = () => {
    stopAutoPlay();
    setActiveIndex((prev) => (prev + 1) % images.length);
    setTimeout(() => {
      startAutoPlay();
    }, 15000); // 15 секунд пауза
  };

  useEffect(() => {
    setActiveIndex(0); // Сброс при смене слайдов
    startAutoPlay();
    return () => {
      stopAutoPlay();
    };
  }, [images, startAutoPlay]);

  return (
    <div className="relative h-84 flex items-center max-md:hidden z-40">
      {images.map((src, index) => {
        const position = (index - activeIndex + images.length) % images.length;
        let classNames = 'absolute rounded-xl object-contain transition-all duration-700 ease-in-out';

        if (position === 0) {
          classNames += ' left-40 top-8 h-[85%] z-10 opacity-90';
        } else if (position === 1) {
          classNames += ' left-24 top-5 h-[90%] z-20 opacity-90';
        } else {
          classNames += ' left-0 top-0 h-full z-30';
        }

        return (
          <img
            key={index}
            src={src}
            className={classNames}
            alt={`Slide ${index + 1}`}
          />
        );
      })}
      <button
        onClick={handleNextClick}
        className="self-center rounded-full w-12 h-12 flex justify-center items-center ml-132 z-40 pointer-events-auto"
        aria-label="Next slide"
      >
        <img
          className="w-full rotate-45 bg-black rounded-2xl p-4 hover:bg-purple ease-in-out cursor-pointer"
          src={arrowfull}
          alt="Next"
        />
      </button>
    </div>
  );
}
