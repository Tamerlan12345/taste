const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// Загрузка переменных окружения
require('dotenv').config();

const app = express();
const port = 3001;

// Подключение к Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());

// Базовый роут
app.get('/', (req, res) => {
  res.send('Secret Santa API is running!');
});

// API-эндпоинты

// Вход пользователя
app.post('/api/login', async (req, res) => {
  const { name, pin_code } = req.body;

  if (!name || !pin_code) {
    return res.status(400).json({ error: 'Имя и пин-код обязательны' });
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, name')
    .eq('name', name)
    .eq('pin_code', pin_code)
    .single();

  if (error || !data) {
    return res.status(401).json({ error: 'Неверное имя или пин-код' });
  }

  res.json(data);
});

// Получение списка всех пользователей (для админа)
app.get('/api/users', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name');

  if (error) {
    return res.status(500).json({ error: 'Не удалось получить пользователей' });
  }

  res.json(data);
});

// Запуск жеребьевки
app.post('/api/generate', async (req, res) => {
  // 1. Получаем всех пользователей
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id');

  if (usersError || !users || users.length < 2) {
    return res.status(500).json({ error: 'Недостаточно пользователей для жеребьевки' });
  }

  // 2. Перемешиваем массив пользователей
  const shuffledUsers = users.sort(() => 0.5 - Math.random());
  const userIds = shuffledUsers.map(u => u.id);

  // 3. Создаем пары (каждый следующий дарит предыдущему, а первый — последнему)
  const pairs = userIds.map((id, index) => ({
    santa_id: id,
    ward_id: userIds[(index + 1) % userIds.length],
  }));

  // 4. Очищаем старые пары
  await supabase.from('pairs').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  // 5. Вставляем новые пары
  const { error: insertError } = await supabase.from('pairs').insert(pairs);

  if (insertError) {
    return res.status(500).json({ error: 'Не удалось создать пары' });
  }

  res.status(200).json({ message: 'Магия запущена! Пары успешно созданы.' });
});

// Получение информации о подопечном (включая вишлист)
app.get('/api/ward/:userId', async (req, res) => {
  const { userId } = req.params;

  // Находим, кому дарит пользователь (ward_id)
  const { data: pair, error: pairError } = await supabase
    .from('pairs')
    .select('ward_id')
    .eq('santa_id', userId)
    .single();

  if (pairError || !pair) {
    return res.status(404).json({ error: 'Подопечный не найден' });
  }

  // Получаем информацию о подопечном
  const { data: ward, error: wardError } = await supabase
    .from('users')
    .select('id, name, wishlist')
    .eq('id', pair.ward_id)
    .single();

  if (wardError || !ward) {
    return res.status(404).json({ error: 'Информация о подопечном не найдена' });
  }

  res.json(ward);
});

// Обновление вишлиста пользователя
app.put('/api/wishlist/:userId', async (req, res) => {
  const { userId } = req.params;
  const { wishlist } = req.body;

  const { error } = await supabase
    .from('users')
    .update({ wishlist })
    .eq('id', userId);

  if (error) {
    return res.status(500).json({ error: 'Не удалось обновить вишлист' });
  }

  res.status(200).json({ message: 'Вишлист успешно обновлен' });
});

// Получение сообщений
app.get('/api/messages/:user1Id/:user2Id', async (req, res) => {
  const { user1Id, user2Id } = req.params;

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`(sender_id.eq.${user1Id},and(receiver_id.eq.${user2Id})),(sender_id.eq.${user2Id},and(receiver_id.eq.${user1Id}))`)
    .order('created_at', { ascending: true });

  if (error) {
    return res.status(500).json({ error: 'Не удалось загрузить сообщения' });
  }

  res.json(data);
});

// Отправка сообщения
app.post('/api/messages', async (req, res) => {
  const { sender_id, receiver_id, content, is_from_santa } = req.body;

  const { data, error } = await supabase
    .from('messages')
    .insert([{ sender_id, receiver_id, content, is_from_santa }]);

  if (error) {
    return res.status(500).json({ error: 'Не удалось отправить сообщение' });
  }

  res.status(201).json(data);
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});

module.exports = { app, supabase };
