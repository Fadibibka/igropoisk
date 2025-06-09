import { useState, useEffect } from 'react';
import trashIcon from '@shared/assets/svg/trash.svg';
import { getUsers, deleteUserReview, User } from '@api/admin/users';

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersData = await getUsers({
          search: searchTerm,
          sort_order: sortOrder
        });
        setUsers(usersData);
      } catch (err) {
        setError('Ошибка при загрузке пользователей');
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    // Добавляем задержку для debounce при поиске
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, sortOrder]);

  const toggleReviews = (userId: string) => {
    setExpandedUserId(prev => (prev === userId ? null : userId));
  };

  const handleDeleteReview = async (ratingId: number) => {
    try {
      await deleteUserReview(ratingId);
      // Обновляем список пользователей после удаления
      const usersData = await getUsers({
        search: searchTerm,
        sort_order: sortOrder
      });
      setUsers(usersData);
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка пользователей...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center w-full mb-6">
        <input
          type="text"
          placeholder="Поиск по логину..."
          className="px-4 py-2 border rounded-xl w-1/3"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <button
          onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
          className="px-4 py-2 bg-purple text-white rounded-xl hover:bg-gray"
        >
          Сортировать по активности: {sortOrder === 'asc' ? 'Менее' : 'Более'}
        </button>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-8">Пользователи не найдены</div>
      ) : (
        users.map(user => (
          <div key={user.user_id} className="bg-purple p-6 rounded-2xl shadow-md mb-6 w-full">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-xl">{user.login}</h3>
                <p className="text-gray-600 text-sm">Email: {user.email}</p>
                <p className="text-gray-600 text-sm">
                  Создан: {new Date(user.created_at).toLocaleDateString()}
                </p>
                <p className="text-gray-600 text-sm">
                  Роль: {user.is_admin ? 'Администратор' : 'Пользователь'}
                </p>
                <p className="text-gray-600 text-sm">
                  Активность: {user.activity_score} отзывов за месяц
                </p>
              </div>
              <button
                onClick={() => toggleReviews(user.user_id)}
                className="px-4 py-2 bg-orange text-white rounded-xl hover:bg-gray"
              >
                {expandedUserId === user.user_id ? 'Скрыть отзывы' : 'Показать отзывы'}
              </button>
            </div>

            {expandedUserId === user.user_id && (
              <div className="mt-4 border-t pt-4 space-y-4">
                {user.reviews.length === 0 ? (
                  <p className="text-gray-500 italic">Нет отзывов</p>
                ) : (
                  user.reviews.map((review, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-beige px-4 py-3 rounded-xl"
                    >
                      <div>
                        <p className="font-semibold">{review.game_title}</p>
                        <p className="text-sm text-gray italic">"{review.text}"</p>
                        <p className="text-xs text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleDeleteReview(review.rating_id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <img src={trashIcon} alt="Удалить" className="w-12 h-12" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default UserManagement;