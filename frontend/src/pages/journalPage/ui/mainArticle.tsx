import { useEffect, useState } from 'react';
import { getAllArticlesPreview, ArticlePreview } from '@api/articles/getArticles';
import arrowfull from '@shared/assets/svg/arrowfull.svg';
import { Link } from 'react-router-dom';

export default function Main_article() {
  const [latest, setLatest] = useState<ArticlePreview | null>(null);

  useEffect(() => {
    getAllArticlesPreview().then((data) => {
      if (data.length > 0) {
        setLatest(data[0]); // первая — последняя по времени
      }
    });
  }, []);

  if (!latest) return null;

  return (
    <article className="container flex flex-col mt-32 items-center justify-center">
      <h1 className="text-6xl font-display uppercase">игровой журнал</h1>
      <div className="w-full h-full mt-16 flex flex-col space-y-6">
        <img
          className="w-full h-screen object-cover rounded-2xl"
          src={`http://localhost:8000/public/${latest.image_url}`}
          alt={latest.title}
        />
          <div className="w-full flex justify-between">
            <p className="text-lg text-gray-500">{latest.created_at}</p>
            <p className="text-xs mt-1 text-white/50">Автор: {latest.author.name}</p>
          </div>
        <h2 className="text-3xl font-display">{latest.title}</h2>
        <p className="text-xl max-w-2/3">{latest.description}</p>
        <Link to={`/journal/article/${latest.article_id}`}
            className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="flex">
              <p className="text-lg">Посмотреть статью</p>
              <img className="w-3 ml-2" src={arrowfull} alt="Стрелка" />
            </div>
          </Link>
      </div>
    </article>
  );
}