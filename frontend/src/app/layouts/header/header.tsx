import logo from './assets/logo.svg'
import search from './assets/search.svg'
import user from '@shared/assets/svg/user.svg'
import { Link } from 'react-router-dom';

export default function Header() {
    return (
      <header className="fixed top-0 left-0 right-0 z-50  bg-black text-white px-6 py-3 shadow-md">
        <div className='container flex items-center justify-between'>
          <div className="flex items-center space-x-3">
            <Link to={`/`} className={`text-lg font-display hover:underline `}>
            <img src={logo} alt="Логотип" className="h-full" />
            </Link>

            <Link to={`/games`} className={`pl-4 text-2xl font-display `}>
            ИГРЫ
            </Link>
            <nav className="flex space-x-8 pl-8">
            <Link to={`/`} className={`text-lg font-display hover:underline `}>
            Главная
            </Link>
            <Link to={`#`} className={`text-lg font-display hover:underline `}>
            Топы
            </Link>
            <Link to={`/journal`} className={`text-lg font-display hover:underline `}>
            Новости
            </Link>

              </nav>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center bg-purple px-3 py-2 rounded-xl">
              <input
                type="text"
                placeholder="Искать ..."
                className="bg-transparent text-white placeholder-gray outline-none w-56"
              />
              <button className="text-white ml-2">
                  <img className='' src={search}></img>
              </button>
            </div>
            <Link to={`/login`} className={`flex flex-col items-start hover:scale-[1.05] transition-transform duration-200 `}>
              <img className='' src={user}></img>
            </Link>
            
          </div>
        </div>
        
      </header>
    );
  }