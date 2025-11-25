import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Background from '../components/Background';
import axios from 'axios';

const AdminPage = () => {
  const [participants, setParticipants] = useState([]);
  const [message, setMessage] = useState('');

  // Загрузка участников при монтировании компонента
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/users');
        // Добавляем статус "зарегистрирован" для всех (в реальном приложении статус нужно получать с бэка)
        const usersWithStatus = response.data.map(user => ({ ...user, status: 'зарегистрировался' }));
        setParticipants(usersWithStatus);
      } catch (error) {
        console.error('Ошибка при загрузке пользователей:', error);
      }
    };
    fetchUsers();
  }, []);

  // Функция для запуска жеребьевки
  const handleGenerate = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/generate');
      setMessage(response.data.message);
    } catch {
      setMessage('Произошла ошибка при запуске магии.');
    }
  };

  return (
    <>
      <Background />
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-8 text-cyan-300">Админ-панель</h1>
        <Card className="w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-4">Участники</h2>
          <ul className="bg-gray-800/50 rounded-lg p-4">
            {participants.map((p) => (
              <li key={p.id} className="flex justify-between items-center p-2 border-b border-gray-700/50">
                <span>{p.name}</span>
                <span className={`px-2 py-1 rounded-full text-sm bg-green-500`}>
                  {p.status}
                </span>
              </li>
            ))}
          </ul>
          <button
            onClick={handleGenerate}
            className="mt-8 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300"
          >
            Запустить Магию
          </button>
          {message && <p className="text-center mt-4">{message}</p>}
        </Card>
      </div>
    </>
  );
};

export default AdminPage;
