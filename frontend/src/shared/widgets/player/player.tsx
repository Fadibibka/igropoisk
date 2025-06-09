import { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';

type Props = {
  url: string;
  poster: string;
  mode: 'default' | 'hero';
  rounded?: string;
};

export default function VideoPlayer({ url, poster, mode, rounded = 'rounded-xl' }: Props) {
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [showPoster, setShowPoster] = useState(mode === 'hero');
  const visibilityTimeout = useRef<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPlaying(true);
    
          if (mode === 'hero') {
            const posterTimer = setTimeout(() => {
              setShowPoster(false);
            }, 1500);
    
            // Очистка предыдущего таймера, если был
            if (visibilityTimeout.current) {
              clearTimeout(visibilityTimeout.current);
              visibilityTimeout.current = null;
            }
    
            // Сохраняем таймер в ref, если нужно потом очищать
            visibilityTimeout.current = posterTimer;
          }
        } else {
          if (mode === 'hero') {
            // Останавливаем воспроизведение через 10 сек вне видимости
            visibilityTimeout.current = setTimeout(() => {
              setPlaying(false);
            }, 10000);
          } else {
            setPlaying(false);
          }
        }
      },
      {
        threshold: 0.4,
      }
    );
    

    const container = containerRef.current;
    if (container) {
      observer.observe(container);
    }

    return () => {
      if (container) observer.unobserve(container);
      if (visibilityTimeout.current) clearTimeout(visibilityTimeout.current);
    };
  }, [mode]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-black ${rounded}`}
    >
      <img
        src={poster}
        alt="Video poster"
        className={`absolute top-0 left-0 w-full h-full object-cover z-0 transition-opacity duration-700 ${
          showPoster ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      <div className="h-full">
        <ReactPlayer
          ref={playerRef}
          url={url}
          width="100%"
          height="100%"
          playing={playing}
          muted
          loop
          controls={mode === 'default'}
          config={{
            file: {
              attributes: {
                style: {
                  objectFit: 'cover',
                  width: '100%',
                  height: '100%',
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
