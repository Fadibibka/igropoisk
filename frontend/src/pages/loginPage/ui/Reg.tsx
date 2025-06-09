import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '@api/login/reg';

export default function Register() {
  const [email, setEmail] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (password !== confirm) {
      setError('Пароли не совпадают');
      return;
    }
    try {
      await registerUser({ login, email, password });
      navigate('/login');
    } catch (err: any) {
      setError('Ошибка регистрации (возможно, логин или email уже заняты)');
    }
  };

  return (
    <section>
      <div className="container flex items-center h-screen sm:min-h-full">
        <div className="w-1/2 mx-auto text-white bg-purple rounded-lg p-14 sm:px-[4vw] sm:mt-14 sm:mb-2">
          <h1 className="uppercase font-display text-2xl">Регистрация</h1>
          <div className="mt-6">
            <form className="flex flex-col">
              <div className="mt-6">
                <label className="mb-1 sans-xs">Email <span className="text-[#FE4435]">*</span></label>
                <input
                  type="email"
                  className="rounded-lg py-5 transition-colors text-sm w-full px-4 bg-transparent border focus:border-orange mt-1"
                  placeholder="email@yandex.ru"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="mt-6">
                <label className="mb-1 sans-xs">Логин<span className="text-[#FE4435]">*</span></label>
                <input
                  maxLength={49}
                  type="text"
                  className="rounded-lg py-5 transition-colors text-sm w-full px-4 bg-transparent border focus:border-orange mt-1"
                  placeholder="user_login"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                />
              </div>
              <div className="mt-6">
                <label className="mb-1 sans-xs">Пароль <span className="text-[#FE4435]">*</span></label>
                <input
                  type="password"
                  className="rounded-lg py-5 transition-colors text-sm w-full px-4 bg-transparent border focus:border-orange mt-1"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="mt-6">
                <label className="mb-1 sans-xs">Подтверждение пароля <span className="text-[#FE4435]">*</span></label>
                <input
                  type="password"
                  className="rounded-lg py-5 transition-colors text-sm w-full px-4 bg-transparent border focus:border-orange mt-1"
                  placeholder="********"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
              {error && <div className="text-[#FE4435] text-sm mt-4">{error}</div>}
              <button type="button" className="w-full bg-black p-4 mt-6 rounded-xl hover:bg-gray" onClick={handleRegister}>
                Создать аккаунт
              </button>
              <Link to={`/login`} className="block mt-6 text-center sans-xs hover:underline">
                Есть аккаунт? Войдите
              </Link>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
