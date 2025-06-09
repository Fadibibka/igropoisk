import { useEffect, useRef, useState } from 'react';
import Gamecard from '@shared/ui/gamecard';
import arrow from '@shared/assets/svg/arrow.svg';
import PC from '@shared/assets/svg/PC.svg';
import PS from '@shared/assets/svg/PS.svg';
import Switch from '@shared/assets/svg/Switch.svg';
import { getAllGames, Game } from '@api/gamesPage/getAllgames';
import { getAllDevelopers, Developer } from '@api/gamesPage/getAlldevelopers';
import { getAllGenres, Genre } from '@api/gamesPage/getAllgenres';

export default function All_games() {
  const [, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  
  // Состояния фильтров
  const [selectedDevelopers, setSelectedDevelopers] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedAge, setSelectedAge] = useState<string>('Любой');
  const [sortBy, setSortBy] = useState<string>('popular-desc');
  const [minRating, setMinRating] = useState<number>(0);
  const [yearRange, setYearRange] = useState<[number, number]>([1990, new Date().getFullYear()]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([]);
  
  // Состояния для временных фильтров (до нажатия "Применить")
  const [tempSelectedDevelopers, setTempSelectedDevelopers] = useState<string[]>([]);
  const [tempSelectedGenres, setTempSelectedGenres] = useState<number[]>([]);
  const [tempSelectedAge, setTempSelectedAge] = useState<string>('Любой');
  const [tempMinRating, setTempMinRating] = useState<number>(0);
  const [tempYearRange, setTempYearRange] = useState<[number, number]>([1990, new Date().getFullYear()]);
  
  // Состояния для раскрывающихся списков
  const [showDevelopers, setShowDevelopers] = useState(false);
  const [showGenres, setShowGenres] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showAge, setShowAge] = useState(false);

  const [dragging, setDragging] = useState<'from' | 'to' | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  
  const ageOptions = ['Любой', '7+', '12+', '16+', '18+'];
  const sortOptions = [
    { label: 'По популярности', value: 'popular-desc' },
    { label: 'По дате ↑', value: 'date-asc' },
    { label: 'По дате ↓', value: 'date-desc' },
    { label: 'По рейтингу ↑', value: 'rating-asc' },
    { label: 'По рейтингу ↓', value: 'rating-desc' },
    { label: 'По отзывам критиков ↑', value: 'critics-asc' },
    { label: 'По отзывам критиков ↓', value: 'critics-desc' },
  ];
  const ratingOptions = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
  const platforms = [
    { id: 1, icon: PC, name: 'PC' },
    { id: 2, icon: PS, name: 'PlayStation' },
    { id: 3, icon: Switch, name: 'Nintendo Switch' }
  ];

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [gamesData, developersData, genresData] = await Promise.all([
          getAllGames(),
          getAllDevelopers(),
          getAllGenres()
        ]);
        setGames(gamesData);
        setFilteredGames(gamesData);
        setDevelopers(developersData);
        setGenres(genresData);
      } catch (err) {

      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Применение фильтров
  const applyFilters = () => {
    setSelectedDevelopers(tempSelectedDevelopers);
    setSelectedGenres(tempSelectedGenres);
    setSelectedAge(tempSelectedAge);
    setMinRating(tempMinRating);
    setYearRange(tempYearRange);
    
   
  };
  useEffect(() => {
    const fetchFilteredGames = async () => {
      setLoading(true);
      try {
        const data = await getAllGames({
          genre_ids: selectedGenres.length > 0 ? selectedGenres : undefined,
          min_rating: minRating > 0 ? minRating : undefined,
          age_rating: selectedAge !== 'Любой' ? selectedAge : undefined,
          from_year: yearRange[0],
          to_year: yearRange[1],
          developers: selectedDevelopers.length > 0 ? selectedDevelopers : undefined,
          platform_ids: selectedPlatforms.length > 0 ? selectedPlatforms : undefined,
          sort_by: sortBy
        });
        setFilteredGames(data);
      } catch (err) {
        setError('Ошибка при загрузке игр');
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredGames();
  }, [selectedPlatforms, sortBy, selectedGenres, selectedDevelopers, minRating, selectedAge, yearRange]);

  // Сброс фильтров
  const resetFilters = () => {
  // Сброс временных фильтров
  setTempSelectedDevelopers([]);
  setTempSelectedGenres([]);
  setTempSelectedAge('Любой');
  setTempMinRating(0);
  setTempYearRange([1990, new Date().getFullYear()]);
  
  // Сброс применённых фильтров
  setSelectedDevelopers([]);
  setSelectedGenres([]);
  setSelectedAge('Любой');
  setMinRating(0);
  setYearRange([1990, new Date().getFullYear()]);
  setSelectedPlatforms([]);
  setSortBy('popular-desc');
  };

  // Обработчики для временных фильтров
  const toggleTempDeveloper = (developer: string) => {
    setTempSelectedDevelopers(prev => 
      prev.includes(developer) 
        ? prev.filter(d => d !== developer) 
        : [...prev, developer]
    );
  };

  const toggleTempGenre = (genreId: number) => {
    setTempSelectedGenres(prev => 
      prev.includes(genreId) 
        ? prev.filter(id => id !== genreId) 
        : [...prev, genreId]
    );
  };

  const clearTempDevelopers = () => {
    setTempSelectedDevelopers([]);
  };

  const clearTempGenres = () => {
    setTempSelectedGenres([]);
  };

  // Загрузочные карточки
  const renderSkeletons = () => {
    return Array(10).fill(0).map((_, index) => (
      <div key={index} className="h-96 bg-purple rounded-xl animate-pulse">
        <div className="w-full h-4/5 bg-gray rounded-t-xl"></div>
        <div className="p-4 space-y-2">
          <div className="w-1/2 h-4 bg-gray rounded"></div>
          <div className="w-full h-6 bg-gray rounded"></div>
        </div>
      </div>
    ));
  };

  return (
    <section className='mt-32 container flex'>
      <div className='flex flex-col flex-1'>
        <div className='flex items-center w-full justify-between'>
          {/* Фильтр по платформам (динамический) */}
          <div className='flex space-x-4 justify-center items-center'>
            {platforms.map(platform => {
              const isSelected = selectedPlatforms.includes(platform.id);
              return (
                <div key={platform.id} className="flex flex-col items-center">
                  <img
                    src={platform.icon}
                    className={`transition duration-300 filter brightness-90 cursor-pointer ${
                      isSelected ? 'brightness-150 drop-shadow-[0_0_6px_white]' : ''
                    }`}
                    onClick={() =>
                      setSelectedPlatforms(prev =>
                        isSelected ? prev.filter(id => id !== platform.id) : [...prev, platform.id]
                      )
                    }
                    alt={platform.name}
                  />
                </div>
              );
            })}
          </div>

          {/* Сортировка (динамическая) */}
          <div className='flex flex-col space-y-2 items-end'>
            <div className='flex items-center space-x-4 relative cursor-pointer' onClick={() => setShowSort(!showSort)}>
              <p className='text-2xl'>
                {sortOptions.find(opt => opt.value === sortBy)?.label}
              </p>
              <img 
                className='w-4 h-4 mt-1 rotate-90' 
                src={arrow} 
              />
              {showSort && (
                <div className='absolute top-full right-0 mt-2 bg-purple rounded-md shadow-lg z-10 w-64'>
                  {sortOptions.map(option => (
                    <div 
                      key={option.value}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray ${
                        sortBy === option.value ? 'bg-gray' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSortBy(option.value);
                        setShowSort(false);
                      }}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className='w-36 h-0.25 bg-white'></div>
          </div>
        </div>

        {/* Список игр */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pt-12'>
          {loading ? renderSkeletons() : 
            error ? <p className="text-red-500 col-span-full text-center">{error}</p> :
            filteredGames.map((game) => (
              <Gamecard
                key={game.game_id}
                className='h-96'
                game={game}
              />
            ))
          }
        </div>
      </div>

      {/* Панель фильтров */}
      <aside className='flex flex-col mt-12 pl-8 w-80'>
        <p className='text-4xl font-bold pb-12'>Фильтры</p>
        <div className='w-76 h-0.25 bg-white'></div>
        
        {/* Год выпуска */}
        <p className='text-2xl pt-6'>Год выпуска</p>
        <div
          className='relative w-full h-24 bg-black rounded-full flex items-center'
          ref={trackRef}
          onMouseMove={(e) => {
            if (!dragging || !trackRef.current) return;
            const rect = trackRef.current.getBoundingClientRect();
            const relX = e.clientX - rect.left;
            const percent = Math.min(1, Math.max(0, relX / rect.width));
            const year = Math.round(1970 + percent * (2025 - 1970));

            setTempYearRange(prev => {
              if (dragging === 'from' && year < prev[1]) return [year, prev[1]];
              if (dragging === 'to' && year > prev[0]) return [prev[0], year];
              return prev;
            });
          }}
          onMouseUp={() => setDragging(null)}
          onMouseLeave={() => setDragging(null)}
        >
          <div className='bg-white w-full h-0.5'></div>
          <div
            className='absolute w-6 h-6 rounded-full bg-white cursor-pointer z-10'
            style={{
              left: `${((tempYearRange[0] - 1970) / (2025 - 1970)) * 100}%`,
              transform: 'translateX(-50%)',
            }}
            onMouseDown={() => setDragging('from')}
          >
            <p className='absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-bold text-white'>
              {tempYearRange[0]}
            </p>
          </div>

          <div
            className='absolute w-6 h-6 rounded-full bg-white cursor-pointer z-10'
            style={{
              left: `${((tempYearRange[1] - 1970) / (2025 - 1970)) * 100}%`,
              transform: 'translateX(-50%)',
            }}
            onMouseDown={() => setDragging('to')}
          >
            <p className='absolute top-7 left-1/2 -translate-x-1/2 text-xs font-bold text-white'>
              {tempYearRange[1]}
            </p>
          </div>
        </div>
        <div className='w-76 h-0.25 bg-white'></div>
        
        {/* Жанр */}
        <div className='py-6'>
          <div 
            className='flex justify-between items-center cursor-pointer'
            onClick={() => setShowGenres(!showGenres)}
          >
            <p className='text-2xl'>Жанр</p>
            <img 
              className={`w-4 h-4 transition-transform rotate-90 ${showGenres ? 'rotate-270' : ''}`} 
              src={arrow} 
            />
          </div>
          {showGenres && (
            <div className='mt-4 max-h-60 overflow-y-auto custom-scroll'>
              <div className='flex space-x-4 mb-2'>
                <button 
                  className='text-sm underline cursor-pointer'
                  onClick={clearTempGenres}
                >
                  Очистить
                </button>
              </div>
              {genres.map(genre => (
                <div 
                  key={genre.genre_id}
                  className={`py-1 px-2 rounded cursor-pointer ${
                    tempSelectedGenres.includes(genre.genre_id) ? 'bg-gray' : ''
                  }`}
                  onClick={() => toggleTempGenre(genre.genre_id)}
                >
                  {genre.name}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className='w-76 h-0.25 bg-white'></div>
        
        {/* Студия */}
        <div className='py-6'>
          <div 
            className='flex justify-between items-center cursor-pointer'
            onClick={() => setShowDevelopers(!showDevelopers)}
          >
            <p className='text-2xl'>Студия</p>
            <img 
              className={`w-4 h-4 transition-transform rotate-90 ${showDevelopers ? 'rotate-270' : ''}`} 
              src={arrow} 
            />
          </div>
          {showDevelopers && (
            <div className='mt-4 max-h-60 overflow-y-auto custom-scroll'>
              <div className='flex space-x-4 mb-2'>
                <button 
                  className='text-sm underline cursor-pointer'
                  onClick={clearTempDevelopers}
                >
                  Очистить
                </button>
              </div>
              {developers.map(dev => (
                <div 
                  key={dev.developer}
                  className={`py-1 px-2 rounded cursor-pointer ${
                    tempSelectedDevelopers.includes(dev.developer) ? 'bg-gray' : ''
                  }`}
                  onClick={() => toggleTempDeveloper(dev.developer)}
                >
                  {dev.developer}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className='w-76 h-0.25 bg-white'></div>
        
        {/* Возраст */}
        <div className='py-6'>
          <div 
            className='flex justify-between items-center cursor-pointer'
            onClick={() => setShowAge(!showAge)}
          >
            <p className='text-2xl'>Возраст</p>
            <img 
              className={`w-4 h-4 transition-transform rotate-90 ${showAge ? 'rotate-270' : ''}`} 
              src={arrow} 
            />
          </div>
          {showAge && (
            <div className='mt-4'>
              {ageOptions.map(age => (
                <div 
                  key={age}
                  className={`py-1 px-2 rounded cursor-pointer ${
                    tempSelectedAge === age ? 'bg-gray' : ''
                  }`}
                  onClick={() => setTempSelectedAge(age)}
                >
                  {age}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className='w-76 h-0.25 bg-white'></div>
        
        {/* Рейтинг */}
        <div className='py-6'>
          <div className='flex justify-between items-center'>
            <p className='text-2xl'>Рейтинг</p>
            <div className='relative'>
              <div 
                className='border-white border-1 px-2 py-1 rounded-md flex items-center space-x-4 cursor-pointer'
                onClick={() => setShowRating(!showRating)}
              >
                <p className='text-2xl'>{tempMinRating > 0 ? `от ${tempMinRating}` : 'Любой'}</p>
                <img 
                  className={`w-4 h-4 mt-1 transition-transform rotate-90 ${showRating ? 'rotate-270' : ''}`} 
                  src={arrow} 
                />
              </div>
              {showRating && (
                <div className='absolute right-0 mt-2 bg-purple rounded-md shadow-lg z-10 w-32 max-h-60 overflow-y-auto custom-scroll'>
                  {ratingOptions.map(rating => (
                    <div 
                      key={rating}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray ${
                        tempMinRating === rating ? 'bg-gray' : ''
                      }`}
                      onClick={() => {
                        setTempMinRating(rating);
                        setShowRating(false);
                      }}
                    >
                      {rating > 0 ? `от ${rating}` : 'Любой'}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className='w-76 h-0.25 bg-white'></div>
        
        {/* Кнопки применения и сброса */}
        <button 
          className='bg-purple w-full mt-4 rounded-lg py-4 flex items-center justify-center cursor-pointer hover:bg-purple-dark transition-colors'
          onClick={applyFilters}
        >
          <p className='text-lg'>Применить</p>
        </button>
        <button 
          className='bg-black w-full mt-2 rounded-lg py-4 flex items-center justify-center cursor-pointer hover:bg-gray transition-colors'
          onClick={resetFilters}
        >
          <p className='text-lg'>Сбросить</p>
        </button>
      </aside>
    </section>
  );
}