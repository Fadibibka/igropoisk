import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // или useRouter если у тебя Next.js
import { getFullArticle, FullArticle, Comment } from '@api/articles/getFullArticle';
import commentsIcon from '@shared/assets/svg/comments.svg';
import { postArticleComment } from '@api/articles/postComment';

export default function ArticlePage() {
  const { articleId } = useParams<{ articleId: string }>(); // если React Router, иначе получай через `useRouter().query.articleId`
  const [newComment, setNewComment] = useState('');

  
  const [article, setArticle] = useState<FullArticle | null>(null);
  useEffect(() => {
    if (articleId) {
      getFullArticle(articleId).then(setArticle);
    }
  }, [articleId]);
  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !articleId) return;
  
    try {
      const newCom = await postArticleComment(articleId, newComment);
      setArticle((prev) => {
        if (!prev) return prev;
      
        const newComment: Comment = {
          comment_id: newCom.comment_id,
          content: newCom.content,
          created_at: newCom.created_at,
          author: {
            user_id: newCom.user_id || 'user_id',         // убедись, что он есть в ответе сервера
            name: newCom.user_login,
            avatar_url: newCom.avatar_url
          },
          parent_id: null
        };
      
        return {
          ...prev,
          comments: [...prev.comments, newComment]
        };
      });
      setNewComment('');
    } catch (err) {
      console.error('Ошибка при отправке комментария:', err);
    }
  };

  if (!article) return <div className="text-white mt-10">Загрузка статьи...</div>;
  return (
    <div className="container mt-32 text-white">
      <div className="flex flex-col space-y-6">
        {/* Заголовок */}
        <h1 className="text-5xl self-center font-display">{article.title}</h1>

        {/* Автор и дата */}
        <div className="flex items-center justify-between mt-12">
          <div className='flex space-x-4'>
            <p className="text-gray-400 text-sm">Автор: {article.author.name}</p>
            <p className="text-gray-500 text-sm">{new Date(article.created_at).toLocaleDateString()}</p>
          </div>

          <div className="flex items-center space-x-3 self-end">
            <p className="text-xs text-gray">{article.views_count}</p>
            <span className="text-xs text-gray">👁️</span>
            <p className="text-xs text-gray">{article.comments.length}</p>
            <img className="w-4 h-4" src={commentsIcon} alt="comments" />
          </div>
        </div>

        {/* Статистика */}


        {/* Фото */}

          <img
            src={`http://localhost:8000/public/${article.image_url}`}
            alt="Обложка статьи"
            className="w-full max-h-[600px] object-cover rounded-2xl"
          />


        {/* Контент */}
        <div className="text-xl leading-relaxed mt-6  whitespace-pre-line text-gray-100">
          {article.content}
        </div>

        {/* Комментарии */}
        <div className="mt-4 bg-purple/40 p-4 rounded-xl">
  <h4 className="text-white font-bold mb-2">Комментарии ({article.comments.length})</h4>

  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
    {article.comments.length > 0 ? (
      article.comments.map((comment) => (
        <div key={comment.comment_id} className="border-b border-gray pb-2 relative">
          <p className="text-sm text-white">{comment.author.name}</p>
          <p className="text-xs text-gray">
            {new Date(comment.created_at).toLocaleString('ru-RU')}
          </p>
          <p className="text-sm text-white mt-1">{comment.content}</p>
        </div>
      ))
    ) : (
      <p className="text-gray text-sm">Нет комментариев</p>
    )}
  </div>

  {/* Комментарий форма */}
  <div className="mt-4">
    <textarea
      value={newComment}
      onChange={(e) => setNewComment(e.target.value)}
      rows={3}
      className="w-full p-2 rounded bg-dark-purple text-white text-sm resize-none"
      placeholder="Напишите комментарий..."
    />
    <button
      onClick={handleCommentSubmit}
      className="mt-2 px-4 py-2 bg-orange text-white rounded hover:bg-dark-orange"
    >
      Отправить комментарий
    </button>
  </div>
</div>
      </div>
    </div>
  );
}
