import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VideoPlayer from '@shared/widgets/player/player.tsx';

import arrow from '@shared/assets/svg/arrow.svg';
import start from '@shared/assets/svg/start.svg';


interface MediaItem {
  type: "video" | "image";
  src: string;
  thumb?: string;
}

interface MediaPreviewProps {
  materials: {
    material_url: string;
    material_type: 'horizontal_logo' | 'vertical_logo' | 'trailer' | 'screenshot';
  }[];
}

const chunk = (arr: any[], size: number) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

export default function MediaPreview({ materials }: MediaPreviewProps) {
  const firstScreenshot = materials.find(m => m.material_type === "screenshot")?.material_url;

  // Сначала получаем все материалы
  const allSlides: MediaItem[] = materials.map((m) => ({
    type: m.material_type === "trailer" ? "video" : "image",
    src: m.material_url,
    thumb: m.material_type === "trailer" 
      ? (firstScreenshot || m.material_url) 
      : m.material_url,
  }));

  // Отделяем видео от изображений
  const videos = allSlides.filter(item => item.type === "video");
  const images = allSlides.filter(item => item.type === "image");

  // Собираем новый массив, где видео идут первыми
  const slides = [...videos, ...images];

  const imageChunks = chunk(slides, 4);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [active, setActive] = useState(slides[0]);

  const paginate = (dir: 1 | -1) => {
    setDirection(dir);
    setIndex((prev) => (prev + dir + imageChunks.length) % imageChunks.length);
  };

  const handleSelect = (item: MediaItem) => {
    setActive(item);
  };

  if (!slides.length) return null;


  return (
    <div className="flex w-2/3 flex-col">
      <div className="aspect-video max-h-144">
        {active.type === "video" ? (
          <VideoPlayer 
            url={active.src} 
            poster={active.thumb || ''} 
            mode="default" 
          />
        ) : (
          <img src={active.src} alt="preview" className="w-full max-h-full object-cover rounded-xl" />
        )}
      </div>

      <div className="h-1/4">
        <div className="pt-8 flex h-full">
          <button onClick={() => paginate(-1)} className="bg-purple h-full rounded-lg rotate-180 w-12 flex justify-center items-center">
            <img src={arrow} alt="prev" />
          </button>

          <div className="overflow-hidden mx-10 w-full">
            <div className="relative w-full h-full">
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={index}
                  className="absolute top-0 left-0 w-full h-full flex space-x-8"
                  custom={direction}
                  initial={{ x: direction > 0 ? "100%" : "-100%", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: direction > 0 ? "-100%" : "100%", opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  {imageChunks[index].map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelect(item)}
                      className={`rounded-xl w-full h-full cursor-pointer flex justify-center items-center border-2 transition-all ${
                        active.src === item.src ? "border-white" : "border-transparent"
                      }`}
                      style={{
                        backgroundImage: `url('${item.thumb || item.src}')`.split('\\').join('/'),
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      {item.type === "video" && (
                        <img src={start} alt="start icon" className="w-12 h-12" />
                      )}
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <button onClick={() => paginate(1)} className="bg-purple h-full rounded-lg w-12 flex justify-center items-center cursor-pointer">
            <img src={arrow} alt="next" />
          </button>
        </div>
      </div>
    </div>
  );
}