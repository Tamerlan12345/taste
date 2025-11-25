import React, { useState } from 'react';
import Card from '../components/Card';
import Background from '../components/Background';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:3001/api/login', {
        name: name,
        pin_code: pin,
      });

      // Сохраняем информацию о пользователе (например, в localStorage)
      localStorage.setItem('user', JSON.stringify(response.data));

      // Перенаправляем на главную страницу
      navigate('/');
    } catch (err) {
      setError('Неверное имя или пин-код. Попробуйте снова.');
    }
  };

  return (
    <>
      <Background />
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-sm w-full">
          <h1 className="text-3xl font-bold text-center mb-6 text-cyan-300">Тайный Санта</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="name" className="block mb-2">Имя</label>
              <input
                type="text"
                id="name"
                className="w-full p-2 bg-gray-800/50 rounded-lg border border-cyan-300/20 focus:outline-none focus:border-cyan-400"
                placeholder="Ваше имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <label htmlFor="pin" className="block mb-2">Пин-код</label>
              <input
                type="password"
                id="pin"
                className="w-full p-2 bg-gray-800/50 rounded-lg border border-cyan-300/20 focus:outline-none focus:border-cyan-400"
                placeholder="****"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300"
            >
              Войти
            </button>
          </form>
        </Card>
      </div>
    </>
  );
};

export default LoginPage;
