const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cookieParser());

// Разрешаем запросы с вашего сайта на GitHub Pages
app.use(cors({
  origin: 'https://Clevefriends.github.io', // Замените на ваш адрес GitHub Pages
  credentials: true // Обязательно для отправки/получения Cookie
}));

// Простая база данных в памяти (для теста)
const users = {};

// 1. Регистрация / Вход
app.post('/api/auth', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Заполните все поля' });
  }

  // Простая логика: если юзер есть — проверяем пароль, если нет — регистрируем
  if (users[email]) {
    if (users[email] !== password) {
      return res.status(401).json({ error: 'Неверный пароль' });
    }
  } else {
    users[email] = password; // Создаем аккаунт
  }

  // Ставим Cookie на 1 день
  res.cookie('user_session', email, {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true, // Защита от XSS
    secure: true,   // Обязательно для HTTPS
    sameSite: 'none' // Разрешает передачу Cookie между разными доменами
  });

  return res.json({ message: 'Успешно!', email });
});

// 2. Проверка активной сессии по Cookie
app.get('/api/me', (req, res) => {
  const userEmail = req.cookies.user_session;
  if (userEmail) {
    return res.json({ loggedIn: true, email: userEmail });
  }
  return res.json({ loggedIn: false });
});

// 3. Выход (удаление Cookie)
app.post('/api/logout', (req, res) => {
  res.clearCookie('user_session', { secure: true, sameSite: 'none' });
  return res.json({ message: 'Вышли из системы' });
});

app.listen(3000, () => console.log('Server running on port 3000'));
