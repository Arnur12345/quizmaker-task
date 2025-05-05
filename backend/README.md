# QuizMaker - Backend

## Настройка и запуск

### Переменные окружения

Перед запуском приложения необходимо настроить переменные окружения. Создайте файл `.env` в корне проекта со следующими переменными:

```
# Настройки базы данных
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/quizmaker

# Ключ для подписи JWT
SECRET_KEY=your-secret-key-replace-in-production

# API ключ для сервиса Groq (для функций AI)
GROQ_API_KEY=your-groq-api-key

# Настройки Flask
FLASK_APP=app.py
FLASK_ENV=development
```

### Запуск с использованием Docker

1. Убедитесь, что у вас установлены Docker и Docker Compose.

2. Соберите и запустите контейнеры:
   ```
   docker-compose up --build
   ```

3. Приложение будет доступно по адресу: http://localhost:5000

### Запуск без Docker

1. Создайте виртуальное окружение Python:
   ```
   python -m venv venv
   source venv/bin/activate  # для Linux/Mac
   venv\Scripts\activate     # для Windows
   ```

2. Установите зависимости:
   ```
   pip install -r requirements.txt
   ```

3. Запустите приложение:
   ```
   flask run
   ```

## Структура проекта

- **app.py** - Точка входа в приложение
- **config.py** - Конфигурация приложения
- **models.py** - Модели данных
- **auth/** - Модуль авторизации и аутентификации
- **quiz/** - Модуль для викторин и вопросов

## База данных

Приложение использует PostgreSQL. При запуске с Docker, база данных будет запущена автоматически и будет доступна по адресу:

- Хост: localhost
- Порт: 5432
- Пользователь: postgres
- Пароль: postgres
- База данных: quizmaker 