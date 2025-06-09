import { useEffect, useState } from 'react';
import { getUserArticles, UserArticle } from '@api/articles/getUserArticles';
import { deleteArticle } from '@api/articles/deleteArticle';
import trashIcon from '@shared/assets/svg/trash.svg';
import arrowfull from '@shared/assets/svg/arrowfull.svg';
import { useNavigate } from 'react-router-dom';

interface ArticlesProps {
  setActiveTab: React.Dispatch<React.SetStateAction<'games' | 'articles' | 'add_article' | 'users' | 'verif'>>
  setEditArticleId: (id: string | null) => void;
}

export default function Articles({ setActiveTab, setEditArticleId }: ArticlesProps) {
  const [articles, setArticles] = useState<UserArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await getUserArticles();
        setArticles(data);
      } catch (error) {
        console.error('Ошибка при загрузке статей:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const handleDelete = async (articleId: string) => {
    try {
      await deleteArticle(articleId);
      setArticles(articles.filter(article => article.article_id !== articleId));
    } catch (error) {
      console.error('Ошибка при удалении статьи:', error);
    }
  };

  const handleEdit = (articleId: string) => {
    setEditArticleId(articleId);
    setActiveTab('add_article');
  };

  if (loading) {
    return <div className="text-white p-6">Загрузка статей...</div>;
  }

  return (
    <div className="w-full p-6 bg-purple rounded-2xl shadow-md mt-6 text-white">
      <h2 className="text-2xl font-bold mb-6">Ваши статьи</h2>

      {articles.length === 0 ? (
        <p>У вас пока нет статей.</p>
      ) : (
        articles.map((article) => (
          <article
            key={article.article_id}
            className="container flex flex-col items-center justify-center mt-16"
          >
            <div className="w-full h-0.5 bg-white"></div>
            <div className="w-full h-auto mt-16 flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-1/3 aspect-video">
                <img
                  className="w-full h-full object-cover rounded-2xl"
                  src={`http://localhost:8000/public/${article.article_photo}`}
                  alt={`Обложка ${article.title}`}
                />
              </div>

              <div className="w-full flex flex-col justify-center">
                {!article.is_approved && (
                  <span className="w-fit inline-block bg-orange-500 text-white text-xs px-3 py-1 rounded-full">
                    Ожидает верификации
                  </span>
                )}
                <p className="text-lg text-gray-500">{article.created_at}</p>

                <h2 className="text-xl font-display mt-2">{article.title}</h2>
                <p className="text-lg mt-4 text-gray-300">{article.description}</p>

                <div className="flex items-center justify-between mt-6 cursor-pointer hover:opacity-80 transition-opacity">
                  <div 
                    className="flex"
                    onClick={() => navigate(`/journal/article/${article.article_id}`)}
                  >
                    <p className="text-lg">Посмотреть статью</p>
                    <img className="w-3 ml-2" src={arrowfull} alt="Стрелка" />
                  </div>

                  <div className="flex self-end justify-end items-center gap-4 mt-4">
                    <button 
                      onClick={() => handleEdit(article.article_id)}
                      className="text-sm text-white bg-purple border border-white px-4 py-2 rounded-xl hover:bg-white hover:text-purple transition duration-300"
                    >
                      Редактировать
                    </button>

                    <button 
                      onClick={() => handleDelete(article.article_id)}
                      className="p-2 rounded-full hover:bg-red-600 transition duration-300"
                    >
                      <img src={trashIcon} alt="Удалить" className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))
      )}
    </div>
  );
}