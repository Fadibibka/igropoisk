import recarrow from '@shared/assets/svg/recarrow.svg'
import recarrowbig from '@shared/assets/svg/recarrowbig.svg'
import recarrowlast from '@shared/assets/svg/recarrowlast.svg'
import { Link } from 'react-router-dom';


export default function Slide() {
  
    return (
      <Link to='/recommendations'>
        <div className="flex h-32 relative max-2xl:h-28 group overflow-hidden cursor-pointer">
          <div className='flex h-32 relative max-2xl:h-28 transition-all duration-500 ease-in-out'>
            <img 
              src={recarrowbig} 
              className="transition-all duration-500 ease-in-out group-hover:translate-x-8" 
              alt=""
            />
            <h2 className="absolute inset-0 flex items-center font-display text-3xl text-white text-center pl-12 transition-all duration-500 ease-in-out group-hover:pl-16">
              Нажмите, чтобы перейти к списку рекомендаций
            </h2>
          </div>
          <img 
            src={recarrow} 
            className="transition-all duration-500 ease-in-out transform group-hover:-translate-x-4 " 
            alt=""
          />
          <img 
            src={recarrow} 
            className="transition-all duration-500 ease-in-out transform group-hover:-translate-x-16" 
            alt=""
          />
          <img 
            src={recarrowlast} 
            className="transition-all duration-500 ease-in-out transform group-hover:-translate-x-28" 
            alt=""
          />
        </div>
      </Link>
    );
  }