import { useEffect, useState } from 'react';
import { logoutUser } from '@api/login/logout';
import Users from './users';
import Games from './games';
import Articles from './articles';
import Add_article from './add_article';
import Verif from './verif';

const ProfileTabs = () => {
  const [activeTab, setActiveTab] = useState<'games' | 'users' | 'articles' | 'add_article' | 'verif' >('users');
  const [editArticleId, setEditArticleId] = useState<string | null>(null);
    // Сбрасываем режим редактирования при переключении на другую вкладку
    useEffect(() => {
      if (activeTab !== 'add_article') {
        setEditArticleId(null);
      }
    }, [activeTab]);
const handleLogout = async () => {
    try {
      await logoutUser();
      window.location.href = '/login'; // или '/', если надо просто вернуться на главную
    } catch (error) {
      console.error('Ошибка при выходе из аккаунта', error);
    }
  };
  return (
    <div className="container mt-32 flex justify-between w-full">
      {/* Левая панель с навигацией */}
      <div className="w-2/5 py-20 pr-4">
        <h2 className="uppercase font-display text-2xl">Admin</h2>
        <nav className="flex flex-col max-w-full mt-8 uppercase divide-y border-y text-lg">
          
          <button
            className={`py-6 text-left cursor-pointer ${activeTab === 'users' ? 'text-orange' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Управление пользователями
          </button>
          <button
            className={`py-6 text-left cursor-pointer ${activeTab === 'games' ? 'text-orange' : ''}`}
            onClick={() => setActiveTab('games')}
          >
            Управление играми
          </button>
          <button
            className={`py-6 text-left cursor-pointer ${activeTab === 'articles' ? 'text-orange' : ''}`}
            onClick={() => setActiveTab('articles')}
          >
            Управление статьями платформы
          </button>
          <button
            className={`py-6 text-left cursor-pointer ${activeTab === 'add_article' ? 'text-orange' : ''}`}
            onClick={() => setActiveTab('add_article')}
          >
            Написание статьи
          </button>
          <button
            className={`py-6 text-left cursor-pointer ${activeTab === 'verif' ? 'text-orange' : ''}`}
            onClick={() => setActiveTab('verif')}
          >
            Управление статьями пользователей
          </button>
          <button
            className="py-6 text-left cursor-pointer text-red-400 hover:text-red-800"
            onClick={handleLogout}
          >
            Выйти из аккаунта
          </button>
          
          {/* Добавьте дополнительные вкладки по аналогии */}
        </nav>
      </div>

      {/* Правая часть с контентом */}
      <div className="flex flex-col items-start py-20 bg-beige w-full px-12 overflow-y-hidden">
        {activeTab === 'games' && (
          <Games/>
        )}

        {activeTab === 'users' && (
          <Users/>
        )}
        {activeTab === 'articles' && (
          <Articles 
            setActiveTab={setActiveTab} 
            setEditArticleId={setEditArticleId} 
          />
        )}
        {activeTab === 'add_article' && (
          <Add_article 
            editArticleId={editArticleId}
            setEditArticleId={setEditArticleId}
            setActiveTab={setActiveTab}
          />
        )}      
        
         {activeTab === 'verif' && (
          <Verif/>
        )} 

        {/* Добавьте дополнительные вкладки по аналогии */}
      </div>
    </div>
  );
};

export default ProfileTabs;