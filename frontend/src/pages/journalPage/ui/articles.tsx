import { useEffect, useState } from 'react';
import { ArticlePreview, getAllArticlesPreview } from '@api/articles/getArticles';
import Article from './article';

export default function Articles() {
  const [articles, setArticles] = useState<ArticlePreview[]>([]);

  useEffect(() => {
    getAllArticlesPreview().then((data) => {
      setArticles(data.slice(1)); // все кроме первой (главной)
    });
  }, []);

  return (
    <section className="container flex flex-col mt-12 items-center justify-center">
      {articles.map((article) => (
        <Article key={article.article_id} article={article} />
      ))}
    </section>
  );
}