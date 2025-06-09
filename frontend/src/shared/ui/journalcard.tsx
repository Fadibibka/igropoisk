import { ArticlePreview } from '@api/articles/getArticles';
import { Link } from 'react-router-dom';

interface Props {
    article: ArticlePreview;
}

export default function Journalcard({ article }: Props) {
    return (
        <Link to={`/journal/article/${article?.article_id}`}>
        <article className="h-full">
            <div
                className="rounded-xl w-full h-full bg-overlay-journal"
                style={{
                    backgroundImage: `url('${`http://localhost:8000/public/${article.image_url}`}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="relative flex items-end z-10 p-12 h-full">
                    <div className="flex">
                        <h2 className="font-display text-2xl">
                            {article.title}
                        </h2>
                    </div>
                </div>
            </div>
        </article>
        </Link>
    );
}