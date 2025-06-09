import { useEffect, useRef, useState } from 'react';
import user from '@shared/assets/svg/user.svg';
import like from '@shared/assets/svg/like.svg';
import commentsIcon from '@shared/assets/svg/comments.svg';
import arrow from '@shared/assets/svg/arrow.svg';
import trashIcon from '@shared/assets/svg/trash.svg';
import Stars from './stars.tsx';
import { UserRating } from '@api/gamePage/getGamereviews.tsx';
import { CommentResponse } from '@api/gamePage/reviewReact.ts';
import { 
  addReaction, 
  removeReaction, 
  getComments, 
  addComment, 
  getReactions,
  deleteComment 
} from '@api/gamePage/reviewReact.tsx';

export default function ReviewCard({ review }: { review: UserRating }) {
  const contentRef = useRef<HTMLPreElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState<boolean | null>(null);
  const [likeCount, setLikeCount] = useState(review.likes || 0);
  const [dislikeCount, setDislikeCount] = useState(review.dislikes || 0);
  const [commentsCount, setCommentsCount] = useState(review.comments || 0);

  useEffect(() => {
    const el = contentRef.current;
    if (el && el.scrollHeight > 270) {
      setOverflowing(true);
    }

    // Загружаем реакцию пользователя при монтировании
    const loadUserReaction = async () => {
      if (!review.rating_id) {
        console.error('Rating ID is undefined');
        return;
      }
      try {
        const reaction = await getReactions(review.rating_id);
        if (reaction?.user_reaction !== undefined) {
          setLiked(reaction.user_reaction);
        }
      } catch (error) {
        console.error('Error loading user reaction:', error);
      }
    };
    
    loadUserReaction();
  }, [review.rating_id]);

  const toggleReaction = async (isLike: boolean) => {
    try {
      if (liked === isLike) {
        // Удаляем реакцию, если она уже была
        await removeReaction(review.rating_id);
        setLiked(null);
        isLike ? setLikeCount(prev => prev - 1) : setDislikeCount(prev => prev - 1);
      } else {
        // Добавляем/изменяем реакцию
        await addReaction(review.rating_id, isLike);
        setLiked(isLike);
        
        // Обновляем счетчики
        if (liked !== null) {
          // Если была другая реакция
          setLikeCount(prev => isLike ? prev + 1 : prev - 1);
          setDislikeCount(prev => isLike ? prev - 1 : prev + 1);
        } else {
          // Если не было реакции
          isLike ? setLikeCount(prev => prev + 1) : setDislikeCount(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  const toggleComments = async () => {
    if (!commentsVisible) {
      try {
        const loadedComments = await getComments(review.rating_id);
        setComments(loadedComments);
      } catch (error) {
        console.error('Error loading comments:', error);
      }
    }
    setCommentsVisible(!commentsVisible);
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;

    try {
      const addedComment = await addComment(review.rating_id, newComment);
      setComments(prev => [addedComment, ...prev]);
      setCommentsCount(prev => prev + 1);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      setCommentsCount(prev => prev - 1);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <div className="bg-purple rounded-xl flex flex-col p-8 w-full max-h-fit">
      <div className="flex gap-4 justify-center items-center">
        <img src={user} alt="user" className="w-10 h-10" />
        <div className="flex flex-col">
          <p className="text-md">{review.user_login}</p>
          <p className="text-gray text-sm">
            {new Date(review.created_at).toLocaleDateString('ru-RU')}
          </p>
        </div>
        <Stars size={15} rating={+review.rating} />
      </div>

      <div className="flex pt-1 space-x-3 self-end mt-2 items-center text-xs text-gray">
        <div 
          className={`flex items-center gap-1 cursor-pointer ${liked === true ? 'text-orange' : ''}`}
          onClick={() => toggleReaction(true)}
        >
          <p>{likeCount}</p>
          <img
            className={`w-4 h-4 ${liked === true ? 'opacity-100' : 'opacity-50'}`}
            src={like}
            alt="like"
          />
        </div>
        <div 
          className={`flex items-center gap-1 cursor-pointer ${liked === false ? 'text-orange' : ''}`}
          onClick={() => toggleReaction(false)}
        >
          <p>{dislikeCount}</p>
          <img
            className={`w-4 h-4 rotate-180 ${liked === false ? 'opacity-100' : 'opacity-50'}`}
            src={like}
            alt="dislike"
          />
        </div>
        <div className="flex items-center gap-1 cursor-pointer" onClick={toggleComments}>
          <p>{commentsCount}</p>
          <img className="w-4 h-4" src={commentsIcon} alt="comments" />
        </div>
      </div>

      <div className="w-full h-0.5 bg-gray mt-2"></div>

      <div className="relative overflow-hidden h-full mt-4">
        <pre
          ref={contentRef}
          className="text-sm whitespace-pre-wrap font-sans max-h-48 overflow-hidden"
        >
          {review.review_text}
        </pre>

        {overflowing && (
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-purple via-purple/80 to-transparent flex flex-col items-end justify-end">
            <div className="w-full h-0.5 bg-white"></div>
            <button className="text-white text-lg flex">
              <p>Открыть</p>
              <img className="mt-2.5 w-3 h-3 rotate-90 ml-2" src={arrow} alt="arrow" />
            </button>
          </div>
        )}
      </div>

      {commentsVisible && (
        <div className="mt-4 bg-purple/40 p-4 rounded-xl">
          <h4 className="text-white font-bold mb-2">Комментарии ({commentsCount})</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id} className="border-b border-gray pb-2 relative">
                  {comment.is_owner && (
                    <button 
                      onClick={() => handleDeleteComment(comment.id)}
                      className="absolute top-0 right-0 text-gray hover:text-white cursor-pointer"
                      title="Удалить комментарий"
                    >
                      <img src={trashIcon} alt="Удалить" className="w-6 h-6" />
                    </button>
                  )}
                  <p className="text-sm text-white">{comment.user_login}</p>
                  <p className="text-xs text-gray">
                    {new Date(comment.created_at).toLocaleString('ru-RU')}
                  </p>
                  <p className="text-sm text-white mt-1">{comment.text}</p>
                </div>
              ))
            ) : (
              <p className="text-gray text-sm">Нет комментариев</p>
            )}
          </div>
          
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
      )}
    </div>
  );
}