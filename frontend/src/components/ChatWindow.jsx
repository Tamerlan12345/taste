import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ChatWindow = ({ currentUser, receiver, isSanta }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Загрузка сообщений при изменении получателя
  useEffect(() => {
    if (!currentUser || !receiver) return;

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/messages/${currentUser.id}/${receiver.id}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Не удалось загрузить сообщения:', error);
      }
    };
    fetchMessages();

    // Опционально: можно добавить real-time обновление через WebSocket или polling
    const interval = setInterval(fetchMessages, 5000); // Обновлять каждые 5 секунд
    return () => clearInterval(interval);
  }, [currentUser, receiver]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || !currentUser || !receiver) return;

    try {
      const response = await axios.post('http://localhost:3001/api/messages', {
        sender_id: currentUser.id,
        receiver_id: receiver.id,
        content: newMessage,
        is_from_santa: isSanta,
      });
      setMessages([...messages, response.data[0]]); // Supabase возвращает массив
      setNewMessage('');
    } catch (error) {
      console.error('Не удалось отправить сообщение:', error);
    }
  };

  if (!currentUser || !receiver) {
    return <div className="text-gray-500 text-sm">Выберите чат для общения.</div>;
  }

  return (
    <div className="bg-black/20 p-4 rounded-lg h-64 flex flex-col">
      <div className="flex-grow overflow-y-auto mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`p-2 my-1 rounded-lg max-w-xs ${
            msg.sender_id === currentUser.id ? 'bg-purple-600 ml-auto' : 'bg-gray-700 mr-auto'
          }`}>
            {isSanta && msg.sender_id === currentUser.id ? `Санта: ${msg.content}` : msg.content}
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          className="flex-grow bg-gray-800 rounded-l-lg p-2 focus:outline-none"
          placeholder="Написать сообщение..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-r-lg"
          onClick={handleSendMessage}
        >
          Отправить
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
