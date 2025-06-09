import { useEffect, useState } from 'react';
import Stars from '@shared/components/stars.tsx';
import { submitRating, deleteUserRating, getUserRating } from '@api/gamePage/userRating.tsx';

interface ReviewFormProps {
  gameId: number;
  onSubmitSuccess?: () => void;
}

export default function ReviewForm({ gameId, onSubmitSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // загрузка отзыва пользователя
    getUserRating(gameId)
      .then((userReview) => {
        if (userReview) {
          setRating(userReview.rating);
          setText(userReview.review_text || '');
          setIsEditing(true);
        }
      })
      .catch((err) => console.error('Ошибка загрузки отзыва пользователя:', err.message));
  }, [gameId]);

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const handleSubmit = async () => {
    if (!text.trim() || rating === 0) {
      setError('Пожалуйста, укажите рейтинг и напишите отзыв.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await submitRating({ game_id: gameId, rating, review_text: text });
      if (onSubmitSuccess) onSubmitSuccess();
      setIsEditing(true); // на случай, если это был новый отзыв
    } catch (err: any) {
      setError(err?.message || 'Ошибка отправки отзыва');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить свой отзыв?')) return;

    setLoading(true);
    setError(null);

    try {
      await deleteUserRating(gameId);
      setRating(0);
      setText('');
      setIsEditing(false);
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err: any) {
      setError(err?.message || 'Ошибка удаления отзыва');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-purple p-6 rounded-2xl shadow-md mt-8 w-2/3 flex flex-col items-center">
      <h3 className="text-2xl font-display mb-4">
        {isEditing ? 'Изменить ваш отзыв' : 'Оставить отзыв'}
      </h3>

      <div className="mb-4">
        <Stars
          size={30}
          rating={rating}
          onChange={handleRatingChange}
          type="editable"
        />
      </div>

      <textarea
        className="w-full p-4 rounded-xl resize-none text-white font-sans text-base"
        rows={5}
        placeholder="Напишите свой отзыв здесь..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {error && <p className="text-red-400 mt-2">{error}</p>}

      <div className="flex gap-4 mt-4">
        <button
          className="px-6 py-2 bg-black text-wg rounded-xl hover:bg-gray disabled:opacity-50 cursor-pointer"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Отправка...' : isEditing ? 'Изменить отзыв' : 'Отправить отзыв'}
        </button>

        {isEditing && (
          <button
            className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 cursor-pointer"
            onClick={handleDelete}
            disabled={loading}
          >
            Удалить отзыв
          </button>
        )}
      </div>
    </div>
  );
}
