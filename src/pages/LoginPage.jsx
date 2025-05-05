import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import config from '../config/config';
import '../index.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    login: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch(`${config.apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          login: formData.login,
          password: formData.password
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при входе в систему');
      }
      
      // Сохраняем токен и данные пользователя в localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('login', data.login);
      localStorage.setItem('name', data.name);
      localStorage.setItem('surname', data.surname);
      localStorage.setItem('score', data.score || 0);
      
      // Перенаправляем на страницу дашборда
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Вход в систему</h2>
          <p className="text-gray-600">Пожалуйста, введите свои данные для входа</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Логин</label>
            <input
              type="text"
              name="login"
              value={formData.login}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Запомнить меня
              </label>
            </div>
            <div className="text-sm">
              <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Забыли пароль?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium
              ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'} transition-colors`}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Нет аккаунта? <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
