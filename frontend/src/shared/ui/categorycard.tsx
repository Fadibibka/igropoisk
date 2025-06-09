import arrowsvg from '@shared/assets/svg/category_arrow.svg';
import { Link } from 'react-router-dom';

interface Props {
  title: string;
  images: string[];
  genreId: number;
}

export default function CategoryCard({ title, images, genreId }: Props) {
  return (
    <Link
      to={`/category/${genreId}`}
      className="block min-w-[70%] snap-start lg:min-w-0 rounded-xl bg-purple w-full max-lg:w-1/3 shrink-0 lg:shrink"
    >
      <div className="flex flex-col items-center pt-12 px-12 max-lg:pt-8 max-lg:px-8">
        <div className="relative flex justify-center items-center h-56">
          {images[0] && (
            <img className="rounded-xl z-10 shadow-2xl max-w-2/3 h-full object-cover" src={images[0]} alt={title} />
          )}
          {images[1] && (
            <img className="absolute left-0 rounded-xl h-[85%] object-cover opacity-55 max-w-2/3 shadow-2xl" src={images[1]} alt="" />
          )}
          {images[2] && (
            <img className="absolute right-0 rounded-xl h-[85%] object-cover max-w-2/3 opacity-55 shadow-2xl" src={images[2]} alt="" />
          )}
        </div>
        
        <h2 className="font-display text-2xl pt-10">{title}</h2>
      </div>
      <div className="self-end flex items-start justify-start pt-2 pl-3 bg-black w-18 h-14 justify-self-end rounded-2xl translate-x-4 translate-y-6">
        <img className="w-8 h-6" src={arrowsvg} alt="Стрелка" />
      </div>
    </Link>
  );
}
