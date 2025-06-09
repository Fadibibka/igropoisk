import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '@api/login/login';
import { useEffect } from 'react';
import { getCurrentUser } from '@api/login/getCurrentUser';


export default function Login() {
    
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await loginUser({ login, password });
      navigate('/'); // Перенаправление после входа
    } catch (err: any) {
      setError('Неверный логин или пароль');
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (user?.is_admin) {
          navigate('/admin');
        } else {
          navigate('/my');
        }
      } catch {
        // Не залогинен — остаемся на логине
      }
    };

    checkAuth();
  }, []);
  return (
    <section>
      <div className="container flex items-center h-screen sm:min-h-full">
        <div className="w-1/2 mx-auto text-white bg-purple rounded-lg p-14 sm:px-[4vw] sm:mt-14 sm:mb-2">
          <h1 className="uppercase font-display text-2xl">Вход в аккаунт</h1>
          <div className="mt-6">
            <form className="flex flex-col">
              <div className="mt-6">
                <label className="mb-1 sans-xs">Email или логин</label>
                <input
                  type="text"
                  placeholder="email@yandex.ru или ваш_логин"
                  className="rounded-lg py-5 transition-colors text-sm w-full px-4 bg-transparent border focus:border-orange mt-1"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                />
              </div>
              <div className="mt-6">
                <label className="mb-1 sans-xs">Пароль</label>
                <input
                  type="password"
                  placeholder="********"
                  className="rounded-lg py-5 transition-colors text-sm w-full px-4 bg-transparent border focus:border-orange mt-1"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {error && <div className="text-[#FE4435] text-sm mt-2">{error}</div>}
              </div>
              <button type="button" className="w-full bg-black p-4 mt-6 rounded-xl hover:bg-gray" onClick={handleLogin}>
                Войти
              </button>
              <Link to={`/reg`} className="block mt-6 text-center sans-xs hover:underline">
                Нет аккаунта? Зарегистрируйся
              </Link>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
