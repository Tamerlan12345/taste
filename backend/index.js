const express = require('express');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
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

// Middleware
// IMPORTANT: In production, configure CORS more securely.
// e.g., app.use(cors({ origin: 'https://your-frontend-domain.github.io', credentials: true }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Serve static assets from the backend's public folder (for uploaded images)
app.use('/public', express.static(path.join(__dirname, 'public')));

// API routes
const apiRouter = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const checkAuth = (req, res, next) => {
  if (req.cookies.authToken === authTokenSecret) next();
  else res.status(401).json({ message: 'Unauthorized' });
};

apiRouter.post('/login', (req, res) => {
  if (req.body.password === hardcodedPassword) {
    res.cookie('authToken', authTokenSecret, {
      httpOnly: true,
      secure: true, // Use secure cookies as it will be cross-site
      sameSite: 'none', // Allow cross-site cookie
      maxAge: 86400000
    });
    res.status(200).json({ message: 'Login successful' });
  } else {
    res.status(401).json({ message: 'Invalid password' });
  }
});

apiRouter.get('/auth-status', checkAuth, (req, res) => {
    res.status(200).json({ message: 'Authenticated' });
});

const systemPrompt = `
## РОЛЬ И ЦЕЛЬ
Ты — мультидисциплинарный эксперт-разработчик...
`; // System prompt truncated for brevity

apiRouter.post('/generate', checkAuth, upload.array('files'), async (req, res) => {
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

    text = text.replace(/^```html\n?/, '').replace(/```$/, '');

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(text);

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).send("An error occurred while generating the presentation.");
  }
});

app.use('/api', apiRouter);

app.get('/', (req, res) => {
  res.send('Genesis Presentations Backend is running!');
});

app.listen(port, () => console.log(`Backend server listening at http://localhost:${port}`));
