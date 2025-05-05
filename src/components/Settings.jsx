import React, { useState, useEffect } from 'react';
import { Save, AlertTriangle, CheckCircle, Lock, User } from 'lucide-react';
import config from '../config/config';

const Settings = ({ onClose }) => {
  // Состояния для формы
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    login: '',
    password: '',
    confirmPassword: ''
  });
  
  // Состояния для обработки ошибок и сообщений
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Получаем данные пользователя при первой загрузке
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Получаем данные из JWT токена
        const payload = JSON.parse(atob(token.split('.')[1]));
        setFormData(prev => ({
          ...prev,
          name: payload.name || '',
          surname: payload.surname || '',
          login: payload.login || ''
        }));
      } catch (e) {
        console.error('Ошибка при чтении токена:', e);
      }
    }
  }, []);
  
  // Обработка изменений в форме
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Отправка формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Валидация формы
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Подготавливаем данные для отправки (исключаем confirmPassword)
      const dataToSend = {
        name: formData.name,
        surname: formData.surname,
        login: formData.login
      };
      
      // Добавляем пароль только если он введен
      if (formData.password) {
        dataToSend.password = formData.password;
      }
      
      const response = await fetch(`${config.apiBaseUrl}/auth/change_user_data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Ошибка при обновлении данных');
      }
      
      // Обновляем данные в localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('login', data.login);
      localStorage.setItem('name', data.name);
      localStorage.setItem('surname', data.surname);
      
      setSuccess('Данные успешно обновлены');
      
      // Сбрасываем поля пароля
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
      
      // Вызываем функцию закрытия, если она передана
      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Настройки аккаунта</h2>
      
      {/* Сообщения об ошибках и успешном выполнении */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-md flex items-center text-red-700">
          <AlertTriangle size={18} className="mr-2" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-md flex items-center text-green-700">
          <CheckCircle size={18} className="mr-2" />
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Личные данные */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-700 flex items-center">
              <User size={18} className="mr-2" />
              Личные данные
            </h3>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Имя
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-1">
                Фамилия
              </label>
              <input
                type="text"
                id="surname"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="login" className="block text-sm font-medium text-gray-700 mb-1">
                Логин
              </label>
              <input
                type="text"
                id="login"
                name="login"
                value={formData.login}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Безопасность */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-700 flex items-center">
              <Lock size={18} className="mr-2" />
              Безопасность
            </h3>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Новый пароль
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Оставьте пустым, чтобы не менять"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Подтверждение пароля
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Сохранение...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                Сохранить изменения
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings; 