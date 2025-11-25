import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Background from '../components/Background';
import ChatWindow from '../components/ChatWindow';
import Wishlist from '../components/Wishlist';
import axios from 'axios';

const UserPage = () => {
  const [user, setUser] = useState(null);
  const [ward, setWard] = useState(null);
  const [myWishlist, setMyWishlist] = useState('');

  useEffect(() => {
    // Получаем данные пользователя из localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      setMyWishlist(storedUser.wishlist || 'Напиши свои желания здесь...');

      // Загружаем данные о подопечном
      const fetchWard = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/api/ward/${storedUser.id}`);
          setWard(response.data);
        } catch (error) {
          console.error('Не удалось загрузить подопечного:', error);
        }
      };
      fetchWard();
    }
  }, []);

  const handleSaveWishlist = async (newWishlist) => {
    try {
      await axios.put(`http://localhost:3001/api/wishlist/${user.id}`, { wishlist: newWishlist });
      setMyWishlist(newWishlist);
      alert('Вишлист сохранен!');
    } catch {
      alert('Не удалось сохранить вишлист.');
    }
  };

  // Заглушка для аватара, если он не указан
  const getAvatarUrl = (name) => `https://i.pravatar.cc/150?u=${name}`;

  if (!user) {
    return <div>Загрузка...</div>;
  }

  return (
    <>
      <Background />
      <div className="min-h-screen text-white p-4 sm:p-8">
        <header className="fixed top-0 left-0 right-0 z-10 p-4 bg-gray-900/50 backdrop-blur-sm">
          <h1 className="text-center text-2xl font-bold text-yellow-400 animate-pulse">
            Бюджет подарка: до 20 000 ₸
          </h1>
        </header>

        <div className="container mx-auto pt-20 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <h2 className="text-3xl font-bold mb-6 text-cyan-300">Твоя Миссия</h2>
            {ward ? (
              <>
                <div className="flex items-center mb-4">
                  <img src={getAvatarUrl(ward.name)} alt="Avatar" className="w-16 h-16 rounded-full mr-4 border-2 border-cyan-400" />
                  <div>
                    <p className="text-gray-400">Ты — тайный Санта для:</p>
                    <p className="text-2xl font-semibold">{ward.name}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Вишлист подопечного:</h3>
                  <p className="bg-black/20 p-3 rounded-md min-h-[80px]">{ward.wishlist || 'Пока пусто...'}</p>
                </div>
                <ChatWindow currentUser={user} receiver={ward} isSanta={true} />
              </>
            ) : (
              <p>Твой подопечный еще не назначен...</p>
            )}
          </Card>

          <Card className="border-purple-300/20">
            <h2 className="text-3xl font-bold mb-6 text-purple-300">Твои Желания</h2>
            <Wishlist initialWishlist={myWishlist} onSave={handleSaveWishlist} />
            <div className="mt-6">
               <h3 className="font-semibold mb-2">Чат с твоим Сантой:</h3>
               {/* Чат с Сантой требует более сложной логики для определения, кто Санта */}
               <p className="text-gray-500 text-sm">Чат с вашим Сантой будет доступен позже.</p>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default UserPage;
