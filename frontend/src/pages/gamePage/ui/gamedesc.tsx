import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import arrow from '@shared/assets/svg/arrow.svg';

interface GameMainProps {
  about: string;
}

export default function GameMain({ about }: GameMainProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="container">
      <div className="w-2/3 pt-12">
        <div className="flex flex-col">
          <h2 className="text-3xl font-display">Подробное описание</h2>
          <div className="w-1/2 h-0.5 bg-white mt-4"></div>

          <div className="relative overflow-hidden mt-4">
            <AnimatePresence initial={false}>
              <motion.div
                key={expanded ? 'expanded' : 'collapsed'}
                initial={{ height: 350 }}
                animate={{ height: expanded ? 'auto' : 350 }}
                exit={{ height: 350 }}
                transition={{ duration: 0.6 }}
                className="overflow-hidden"
              >
                <div className="text-justify text-xl whitespace-pre-line font-sans">
  {about
    .replace(/<br\s*\/?>/g, '\n') // Заменяем все <br> на переносы строк
    .split('\n')
    .filter(paragraph => paragraph.trim() !== '') // Удаляем пустые абзацы
    .map((paragraph, i) => (
      <p key={i} className={i > 0 ? 'mt-4' : ''}>
        {paragraph}
      </p>
    ))}
</div>
              </motion.div>
            </AnimatePresence>

            {!expanded && (
              <div className="-translate-y-24 w-full h-24 bg-gradient-to-t from-black via-black/85 to-transparent flex flex-col items-end justify-end">
                <div className='w-full h-0.5 bg-white'></div>
                <button 
                  onClick={() => setExpanded(true)} 
                  className="text-white text-lg flex"
                >
                  <p>Читать далее</p>
                  <img className="mt-2.5 w-3 h-3 rotate-90 ml-2" src={arrow} alt="arrow" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}