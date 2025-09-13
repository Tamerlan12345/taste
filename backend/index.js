const express = require('express');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3001;

const hardcodedPassword = 'centras12';
const authTokenSecret = 'supersecrettoken';

// IMPORTANT: In a production application, use environment variables for API keys.
const API_KEY = 'AIzaSyCisFe9LE9ykOlc7JOn7NEJQDJ3LaMMFqI';
const genAI = new GoogleGenerativeAI(API_KEY);

const uploadsDir = path.join(__dirname, 'public/uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

app.use(express.json());
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

app.post('/api/login', (req, res) => {
  if (req.body.password === hardcodedPassword) {
    res.cookie('authToken', authTokenSecret, { httpOnly: true, maxAge: 86400000 });
    res.status(200).json({ message: 'Login successful' });
  } else {
    res.status(401).json({ message: 'Invalid password' });
  }
});

const checkAuth = (req, res, next) => {
  if (req.cookies.authToken === authTokenSecret) next();
  else res.status(401).json({ message: 'Unauthorized' });
};

const systemPrompt = `
## РОЛЬ И ЦЕЛЬ
Ты — мультидисциплинарный эксперт-разработчик. Твои компетенции:
- **Креативный дизайнер:** Ты создаешь визуально привлекательные и запоминающиеся слайды.
- **Программист (HTML/CSS/JS):** Ты пишешь чистый, валидный и самодостаточный HTML-код.
- **Методолог и редактор:** Ты структурируешь информацию логично, улучшаешь формулировки, но никогда не искажаешь и не додумываешь смысл, заложенный пользователем.

## ОСНОВНАЯ ЗАДАЧА
Твоя задача — сгенерировать полнофункциональную, интерактивную и креативную HTML-презентацию в виде **одного** самодостаточного \`.html\` файла. Презентация должна быть создана с использованием фреймворка Reveal.js, все стили и скрипты которого должны быть встроены непосредственно в HTML-файл через теги \`<style>\` и \`<script>\` (используй CDN для подключения библиотек).

## ФОРМАТ ВХОДНЫХ ДАННЫХ (от Пользователя)
Ты получишь структурированный запрос от пользователя, который будет содержать:
1.  **Тема:** Общая тема презентации.
2.  **Целевая аудитория:** Для кого предназначена презентация.
3.  **Стиль:** Ключевые слова для стиля (например: "минимализм", "корпоративный", "яркий", "технологичный"). Если стиль не указан, используй **"сдержанный креатив"**: чистый дизайн, акцентная типографика, плавная и профессиональная анимация переходов (например, \`slide-in\`, \`fade-out\`).
4.  **Контент для слайдов:** Текст, заголовки и структура для каждого слайда. Важно: в контенте уже могут быть HTML-теги \`<img>\`, которые ты должен сохранить.

## КЛЮЧЕВЫЕ ТРЕБОВАНИЯ К ГЕНЕРАЦИИ
1.  **Технология:**
    -   **Фреймворк:** Используй **Reveal.js**. Подключи его и тему (например, \`black.css\`, \`white.css\` или \`league.css\`) через CDN.
    -   **Структура:** Весь код (HTML, CSS, JS) должен быть в одном файле.
    -   **Структура слайдов:** Каждый слайд должен быть обернут в тег \`<section>\`.
2.  **Интерактивность и Функционал:**
    -   **Редактирование текста:** Все текстовые блоки должны иметь атрибут \`contenteditable="true"\`.
    -   **Кнопки экспорта:** В нижний правый угол презентации добавь две фиксированные кнопки: "Скачать PDF" и "Скачать PPTX". Используй иконки из Font Awesome (подключи через CDN).
    -   **Логика экспорта в PDF:** Кнопка "Скачать PDF" должна выполнять JavaScript-функцию, которая вызывает \`window.print()\`.
    -   **Логика экспорта в PPTX:** Для кнопки "Скачать PPTX" используй библиотеку **PptxGenJS** (подключи через CDN). Сгенерируй JavaScript-функцию, которая будет проходить по всем \`<section>\` (слайдам), извлекать из них контент и формировать \`.pptx\` файл.
3.  **Контент и Стиль:**
    -   **Без домыслов:** Не добавляй новую информацию или изменять смысл.
    -   **Переходы:** Используй красивые, но сдержанные переходы между слайдами.

## ФОРМАТ ВЫВОДА
Твой ответ должен быть **ТОЛЬКО** кодом. Он должен начинаться с \`<!DOCTYPE html>\` и заканчиваться \`</html>\`. Никакого текста до или после.
`;

app.post('/api/generate', checkAuth, upload.array('files'), async (req, res) => {
  try {
    let { theme, content, style, audience } = req.body;
    const files = req.files || [];
    let fileIndex = 0;

    content = content.replace(/\[IMAGE_PATH: '([^']*)'\]/g, (match, altText) => {
      if (fileIndex < files.length) {
        const file = files[fileIndex++];
        const imageUrl = `${req.protocol}://${req.get('host')}/public/uploads/${file.filename}`;
        return `<img src="${imageUrl}" alt="${altText}" style="max-width: 400px; max-height: 300px;">`;
      }
      return '';
    });

    const userPrompt = `
      Тема: ${theme}
      Целевая аудитория: ${audience}
      Стиль: ${style}
      Контент для слайдов:
      ${content}
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent([systemPrompt, userPrompt]);
    const response = await result.response;
    let text = response.text();

    // Clean up the response to ensure it's just HTML
    text = text.replace(/^```html\n?/, '').replace(/```$/, '');

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(text);

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).send("An error occurred while generating the presentation.");
  }
});

app.get('/api/auth-status', checkAuth, (req, res) => {
    res.status(200).json({ message: 'Authenticated' });
});

app.get('/', (req, res) => res.send('Hello from the backend!'));

app.listen(port, () => console.log(`Backend server listening at http://localhost:${port}`));
