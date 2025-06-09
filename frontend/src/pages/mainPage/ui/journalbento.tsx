import { useEffect, useState } from 'react';
import Journalcard from '@shared/ui/journalcard';
import { getAllArticlesPreview, ArticlePreview } from '@api/articles/getArticles';

export default function Main_games() {
    const [articles, setArticles] = useState<ArticlePreview[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const data = await getAllArticlesPreview();
                setArticles(data.slice(0, 6)); // берем только 6
            } catch (err) {
                console.error(err);
            }
        })();
    }, []);

    return (
        <section className="container mt-32 flex flex-col items-center">
            <h1 className="text-5xl font-display">Новости и статьи</h1>
            <div className="grid grid-cols-3 grid-rows-3 gap-6 pt-10 max-lg:grid-cols-1 h-screen">
    {articles.map((article, index) => (
        <div
            key={article.article_id}
            className={`w-full h-full ${
                index === 0 ? 'col-span-2 row-span-2' : ''
            }`}
        >
            <Journalcard article={article} />
        </div>
    ))}
</div>
        </section>
    );
}