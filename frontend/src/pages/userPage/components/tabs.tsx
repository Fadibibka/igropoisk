import { useEffect, useState } from 'react';
import { logoutUser } from '@api/login/logout';
import Accountinfo from './accountinfo';
import Reviews from './reviews';
import Wanted from './wanted';
import Played from './played';
import Articles from './articles';
import Add_article from './add_article';


const ProfileTabs = () => {
  const [activeTab, setActiveTab] = useState<'account-info' | 'reviews' | 'wanted' | 'played' | 'articles' | 'add_article'>('account-info');
  const [editArticleId, setEditArticleId] = useState<string | null>(null);
  const [userName] = useState('');


  // Сбрасываем режим редактирования при переключении на другую вкладку
  useEffect(() => {
    if (activeTab !== 'add_article') {
      setEditArticleId(null);
    }
  }, [activeTab]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      window.location.href = '/login';
    } catch (error) {
      console.error('Ошибка при выходе из аккаунта', error);
    }
  };


  return (
    <div className="container mt-32 flex justify-between w-full">
      <div className="w-2/5 py-20 pr-4">
        <h2 className="uppercase font-display text-2xl">
          Здравствуйте{userName ? `, ${userName}` : ''}
        </h2>

        <nav className="flex flex-col max-w-full mt-8 uppercase divide-y border-y text-lg">
          <button
            className={`py-6 text-left cursor-pointer ${activeTab === 'account-info' ? 'text-orange' : ''}`}
            onClick={() => setActiveTab('account-info')}
          >
            Личные данные
          </button>
          <button
            className={`py-6 text-left cursor-pointer ${activeTab === 'reviews' ? 'text-orange' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Ваши оценки
          </button>
          <button
            className={`py-6 text-left cursor-pointer ${activeTab === 'wanted' ? 'text-orange' : ''}`}
            onClick={() => setActiveTab('wanted')}
          >
            Добавлено в желаемое
          </button>
          <button
            className={`py-6 text-left cursor-pointer ${activeTab === 'played' ? 'text-orange' : ''}`}
            onClick={() => setActiveTab('played')}
          >
            Пройденные игры
          </button>
          <button
            className={`py-6 text-left cursor-pointer ${activeTab === 'articles' ? 'text-orange' : ''}`}
            onClick={() => setActiveTab('articles')}
          >
            Ваши статьи
          </button>
          <button
            className={`py-6 text-left cursor-pointer ${activeTab === 'add_article' ? 'text-orange' : ''}`}
            onClick={() => setActiveTab('add_article')}
          >
            Написать статью
          </button>
          <button
            className="py-6 text-left cursor-pointer text-red-400 hover:text-red-800"
            onClick={handleLogout}
          >
            Выйти из аккаунта
          </button>
        </nav>
      </div>

      {/* Правая часть с контентом */}
      <div className="flex flex-col items-start py-20 bg-beige w-full px-12 overflow-y-hidden">
        {activeTab === 'account-info' && <Accountinfo />}
        {activeTab === 'reviews' && <Reviews />}
        {activeTab === 'wanted' && <Wanted />}
        {activeTab === 'played' && <Played />}
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
      </div>
    </div>
  );
};

export default ProfileTabs;
