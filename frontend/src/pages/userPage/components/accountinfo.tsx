import { useState, useEffect } from 'react';
import axios from 'axios';

interface UserData {
  login: string;
  email: string;
  password: string;
}

const Accountinfo = () => {
  const [userData, setUserData] = useState<UserData>({
    login: '',
    email: '',
    password: ''
  });
  const [initialData, setInitialData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Загрузка текущих данных пользователя
    const loadUserData = async () => {
      try {
        const response = await axios.patch('/api/my/update/', {
          withCredentials: true
        });
        setInitialData({
          login: response.data.login,
          email: response.data.email,
          password: '' // Пароль не загружаем
        });
        setUserData({
          login: response.data.login,
          email: response.data.email,
          password: '' // Пароль оставляем пустым
        });
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        setError('Не удалось загрузить данные пользователя');
      }
    };
    loadUserData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Отправляем только измененные данные
      const dataToSend: Partial<UserData> = {};
      if (userData.login !== initialData?.login) dataToSend.login = userData.login;
      if (userData.email !== initialData?.email) dataToSend.email = userData.email;
      if (userData.password) dataToSend.password = userData.password;

      // Если нет изменений - просто выходим
      if (Object.keys(dataToSend).length === 0) {
        alert('Нет изменений для сохранения');
        return;
      }

      await axios.patch(
        '/api/my/update/',
        dataToSend,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Обновляем initialData после успешного сохранения
      setInitialData(userData);
    } catch (error) {
      console.error('Ошибка при обновлении данных:', error);
      setError('Произошла ошибка при обновлении данных. Проверьте введенные данные.');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (!initialData) {
    return <div className="p-4">Загрузка данных...</div>;
  }

  return (
    <>
      <h3 className="uppercase font-display text-xl">Ваши личные данные</h3>
      <div className="w-full pr-8 mt-8 mb-12 overflow-y-auto scrollbar">
        <form className='flex flex-col' onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label className="mb-1 sans-xs">Логин</label>
              <input
                className="rounded-lg py-5 transition-colors text-sm w-full px-4 bg-transparent border focus:border-orange mt-1"
                type="text"
                name="login"
                value={userData.login}
                onChange={handleChange}
                maxLength={49}
                placeholder="ваш_логин"
              />
            </div>
            <div>
              <label className="mb-1 sans-xs">Email</label>
              <input
                className="rounded-lg py-5 transition-colors text-sm w-full px-4 bg-transparent border focus:border-orange mt-1"
                type="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                placeholder="email@yandex.ru"
              />
            </div>
            <div>
              <label className="mb-1 sans-xs">Пароль</label>
              <input
                className="rounded-lg py-5 transition-colors text-sm w-full px-4 bg-transparent border focus:border-orange mt-1"
                type="password"
                name="password"
                value={userData.password}
                onChange={handleChange}
                placeholder="Новый пароль (оставьте пустым, чтобы не менять)"
              />
            </div>
          </div>
          {error && <div className="text-red-500 mt-2">{error}</div>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-1/2 mt-6 bg-purple p-4 rounded-xl hover:bg-gray self-center disabled:opacity-50"
          >
            {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </form>
      </div>
    </>
  );
};

export default Accountinfo;