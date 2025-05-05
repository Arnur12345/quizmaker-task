# 🧠 Quizmaker

**Quizmaker** — AI-платформа для создания и прохождения тестов.  
Бэкенд на Flask, фронтенд на React, ИИ-генерация с помощью Groq API.  
Проект развернут на **Render** (backend) и **Vercel** (frontend).


**Video Demo**:
https://youtu.be/2OCDo4c-9oA

---

## 🔧 Установка

### Backend (ветка `main`)

```bash
git clone https://github.com/yourusername/quizmaker.git
cd quizmaker/backend
python -m venv venv
source venv/bin/activate  # или venv\Scripts\activate на Windows
pip install -r requirements.txt
python app.py
```

### Frontend (ветка `frontend`)

```bash
git checkout frontend
cd frontend
npm install
npm run dev  # или npm start
```

> ⚠️ Перед запуском создайте `.env` в корне backend и добавьте:
> 
> ```
> GROQ_API_KEY=your_groq_api_key
> DATABASE_URL=your_postgresql_url
> ```

---

## 🧩 Основные функции

- **Dashboard** — отображение статистики, количество тестов, heatmap активности.
- **Quizzes** — список тестов и возможность их прохождения.
- **Add Quiz** — добавление собственных квизов и вопросов.
- **QuizAI** — генерация квизов с помощью искусственного интеллекта (Groq).
- **Account** — настройки и информация о пользователе.

---

## ⚙️ Технологии

- **Flask** — выбрал за простоту, мощные возможности и поддержку blueprints.
- **React** — современный UI, компонентный подход и гибкость.
- **Groq API** — генерация тестов по заданной теме.
- **PostgreSQL** — надежная система хранения данных.
- **Render** — хостинг бэкенда.
- **Vercel** — хостинг фронтенда.
- **Cursor + AI** — использовался для создания Landing Page.

---

⭐️ Поставь звезду, если проект оказался полезен!
