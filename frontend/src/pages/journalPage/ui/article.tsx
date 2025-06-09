import arrowfull from '@shared/assets/svg/arrowfull.svg';
import { ArticlePreview } from '@api/articles/getArticles';
import { Link } from 'react-router-dom';

export default function Article({ article }: { article: ArticlePreview }) {
  return (
    <article className="container flex flex-col items-center justify-center mt-16">
      <div className="w-full h-0.5 bg-white" />
      <div className="w-full h-auto mt-16 flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/3 aspect-video">
          <img
            className="w-full h-full object-cover rounded-2xl"
            src={`http://localhost:8000/public/${article.image_url}`}
            alt={`Обложка ${article.title}`}
          />
        </div>

        <div className="w-full flex flex-col justify-center">
          <div className="w-full flex justify-between">
            <p className="text-lg text-gray-500">{article.created_at}</p>
            <p className="text-xs mt-1 text-white/50">Автор: {article.author.name}</p>
          </div>

          <h2 className="text-xl font-display mt-2">{article.title}</h2>
          <p className="text-lg mt-4 text-gray-300">{article.description}</p>

          <Link to={`/journal/article/${article.article_id}`}
            className="flex items-center justify-between mt-6 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="flex">
              <p className="text-lg">Посмотреть статью</p>
              <img className="w-3 ml-2" src={arrowfull} alt="Стрелка" />
            </div>
          </Link>
        </div>
      </div>
    </article>
  );
}