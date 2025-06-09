import { useEffect, useState } from 'react';
import { PendingArticle, getPendingArticles } from '@api/articles/getPendingArticles';
import { approveArticle } from '@api/articles/approveArticle';
import { deleteArticle } from '@api/articles/deleteArticle';
import arrowfull from '@shared/assets/svg/arrowfull.svg';
import { useNavigate } from 'react-router-dom';

export default function Verif() {
  const [pendingArticles, setPendingArticles] = useState<PendingArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const articles = await getPendingArticles();
        setPendingArticles(articles);
      } catch (err) {
        console.error('Ошибка загрузки статей:', err);
        setError('Не удалось загрузить статьи для модерации');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const handleApprove = async (articleId: string) => {
    try {
      await approveArticle(articleId);
      setPendingArticles(pendingArticles.filter(article => article.article_id !== articleId));
    } catch (err) {
      console.error('Ошибка подтверждения статьи:', err);
      setError('Не удалось подтвердить статью');
    }
  };

  const handleReject = async (articleId: string) => {
    try {
      await deleteArticle(articleId);
      setPendingArticles(pendingArticles.filter(article => article.article_id !== articleId));
    } catch (err) {
      console.error('Ошибка отклонения статьи:', err);
      setError('Не удалось отклонить статью');
    }
  };

  const handleViewArticle = (articleId: string) => {
    navigate(`/journal/article/${articleId}`);
  };

  if (loading) {
    return (
      <div className="w-full p-6 bg-purple rounded-2xl shadow-md mt-6 text-white">
        <h2 className="text-2xl font-bold mb-6">Статьи на верификацию</h2>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 bg-purple rounded-2xl shadow-md mt-6 text-white">
        <h2 className="text-2xl font-bold mb-6">Статьи на верификацию</h2>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-purple rounded-2xl shadow-md mt-6 text-white">
      <h2 className="text-2xl font-bold mb-6">Статьи на верификацию</h2>

      {pendingArticles.length === 0 ? (
        <p className="text-white/70">Нет новых статей для проверки.</p>
      ) : (
        pendingArticles.map((article) => (
          <article key={article.article_id} className="container flex flex-col items-center justify-center mt-16">
            <div className="w-full h-0.5 bg-white"></div>
            <div className="w-full h-auto mt-16 flex flex-col lg:flex-row gap-6">
              {article.article_photo && (
                <div className="w-full lg:w-1/3 aspect-video">
                  <img
                    className="w-full h-full object-cover rounded-2xl"
                    src={`http://localhost:8000/public/${article.article_photo}`}
                    alt={`Обложка ${article.title}`}
                  />
                </div>
              )}
              
              <div className="w-full flex flex-col justify-center">
                <div className="w-full flex justify-between">
                  <p className="text-lg text-gray-500">
                    {new Date(article.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs mt-1 text-white/50">
                    Автор: {article.author_name}
                    {article.game_title && ` | Игра: ${article.game_title}`}
                  </p>
                </div>

                <h2 className="text-xl font-display mt-2">{article.title}</h2>
                <p className="text-lg mt-4 text-gray-300">{article.description}</p>

                <div className="flex items-center justify-between mt-6 cursor-pointer hover:opacity-80 transition-opacity">
                  <div 
                    className="flex"
                    onClick={() => handleViewArticle(article.article_id)}
                  >
                    <p className="text-lg">Посмотреть статью</p>
                    <img className="w-3 ml-2" src={arrowfull} alt="Стрелка"/>
                  </div>

                  <div className="flex justify-end items-center gap-4 mt-4">
                    <button
                      onClick={() => handleApprove(article.article_id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition"
                    >
                      Подтвердить
                    </button>
                    <button
                      onClick={() => handleReject(article.article_id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition"
                    >
                      Отклонить
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