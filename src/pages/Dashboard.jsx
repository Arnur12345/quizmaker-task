import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  SquarePlus, 
  BarChart3, 
  Calendar, 
  Trophy, 
  Brain 
} from 'lucide-react';
import Sidebar from '../layout/Sidebar';
import axios from 'axios';
import config from '../config/config';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    completedTests: 0,
    averageScore: 0
  });
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userScore, setUserScore] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Получаем токен из localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Не авторизован');
        }
        
        // Получаем количество пройденных тестов
        const testsResponse = await axios.get(`${config.apiBaseUrl}/quiz/user-tests-count`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Получаем список викторин
        const quizzesResponse = await axios.get(`${config.apiBaseUrl}/quiz/quizes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Получаем данные активности пользователя
        const activityResponse = await axios.get(`${config.apiBaseUrl}/quiz/user-activity`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Получаем средний балл пользователя из localStorage
        const score = localStorage.getItem('score') || 0;
        setUserScore(parseInt(score));
        
        setStats({
          totalQuizzes: quizzesResponse.data.total_count || 0,
          completedTests: testsResponse.data.tests_count || 0,
          averageScore: parseInt(score) // Используем сохраненный балл или генерируем случайный
        });
        
        // Используем полученные викторины для отображения последних тестов
        if (quizzesResponse.data.quizes && quizzesResponse.data.quizes.length > 0) {
          // Берем последние 5 викторин
          setRecentQuizzes(quizzesResponse.data.quizes.slice(0, 5));
        } else {
          setRecentQuizzes([]);
        }
        
        setActivityData(activityResponse.data || []);
        
        setLoading(false);
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError('Не удалось загрузить данные дашборда');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Функция для отображения цвета ячейки тепловой карты
  const getActivityColor = (count) => {
    if (count === 0) return 'bg-gray-100';
    if (count === 1) return 'bg-green-100';
    if (count === 2) return 'bg-green-300';
    if (count === 3) return 'bg-green-500';
    return 'bg-green-700';
  };
  
  // Функция для получения случайного цвета для карточки теста
  const getRandomColor = () => {
    const colors = ['blue', 'green', 'purple', 'indigo', 'pink', 'yellow', 'red'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-8 ml-64">
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-8 ml-64">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 ml-0 lg:ml-64">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Панель управления</h1>
        {/* СТАТИСТИКА */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-50 text-blue-500 mr-4">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Всего викторин</p>
                <h3 className="text-2xl font-bold">{stats.totalQuizzes}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-50 text-green-500 mr-4">
                <BarChart3 size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Пройдено тестов</p>
                <h3 className="text-2xl font-bold">{stats.completedTests}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-50 text-purple-500 mr-4">
                <Trophy size={24} />
              </div>
              <div className="w-full">
                <p className="text-sm text-gray-500">Средний балл</p>
                <div className="flex items-center">
                  <h3 className="text-2xl font-bold mr-2">{stats.averageScore} points</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* ОСНОВНОЙ КОНТЕНТ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка */}
          <div className="lg:col-span-2 space-y-8">
            {/* Тепловая карта активности */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 overflow-x-auto min-w-[600px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Ваша активность</h2>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar size={16} className="mr-1" />
                  Последние 90 дней
                </div>
              </div>
              <div className="overflow-x-auto">
                <div className="flex flex-wrap min-w-[600px]">
                  {activityData.map((day, index) => (
                    <div 
                      key={index}
                      className={`w-4 h-4 m-1 rounded-sm ${getActivityColor(day.count)}`}
                      title={`${day.date}: ${day.count} активностей`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-end mt-3 text-xs text-gray-500">
                  <span className="mr-2">Меньше</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
                    <div className="w-3 h-3 bg-green-100 rounded-sm"></div>
                    <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                    <div className="w-3 h-3 bg-green-700 rounded-sm"></div>
                  </div>
                  <span className="ml-2">Больше</span>
                </div>
              </div>
              <div className="flex justify-between mt-4 text-xs text-gray-500">
                <span>Май</span>
                <span>Июн</span>
                <span>Июл</span>
                <span>Авг</span>
                <span>Сен</span>
                <span>Окт</span>
                <span>Ноя</span>
                <span>Дек</span>
                <span>Янв</span>
                <span>Фев</span>
                <span>Мар</span>
                <span>Апр</span>
              </div>
            </div>
            
            {/* Достижения */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Ваши достижения</h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { name: 'Создатель', icon: <SquarePlus size={24} />, progress: 80, color: 'blue' },
                  { name: 'Эксперт', icon: <Brain size={24} />, progress: 45, color: 'purple' },
                  { name: 'Исследователь', icon: <FileText size={24} />, progress: 65, color: 'green' }
                ].map((achievement, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className={`mx-auto mb-2 p-3 rounded-full bg-${achievement.color}-50 text-${achievement.color}-500 inline-block`}>
                      {achievement.icon}
                    </div>
                    <h3 className="text-sm font-medium mb-2">{achievement.name}</h3>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`bg-${achievement.color}-500 h-2 rounded-full`} 
                        style={{ width: `${achievement.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{achievement.progress}%</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Правая колонка */}
          <div className="space-y-8">
            {/* Последние тесты */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Последние тесты</h2>
              
              {recentQuizzes.length > 0 ? (
                <div className="space-y-4">
                  {recentQuizzes.map((quiz, index) => {
                    const color = getRandomColor();
                    return (
                      <a 
                        key={index} 
                        href={`/quiz/${quiz.id}`} 
                        className={`block p-4 rounded-lg bg-${color}-50 border border-${color}-100 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`p-2 rounded-full bg-${color}-100 text-${color}-600 mr-3`}>
                              <FileText size={18} />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-800">{quiz.title}</h3>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                {quiz.description || 'Нет описания'}
                              </p>
                            </div>
                          </div>
                          <div className={`text-${color}-600 text-xs font-semibold px-2 py-1 rounded-full bg-${color}-100`}>
                            Тест
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <FileText size={40} className="mx-auto mb-2 text-gray-300" />
                  <p>У вас пока нет тестов</p>
                  <a href="/create-quiz" className="mt-2 inline-block text-blue-600 hover:underline">
                    Создать первый тест
                  </a>
                </div>
              )}
              
              <a href="/quizzes" className="block w-full mt-4 py-2 text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                Показать все тесты
              </a>
            </div>
            
            {/* Быстрые действия */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Быстрые действия</h2>
              
              <div className="space-y-3">
                <a href="/create-quiz" className="flex items-center p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                  <SquarePlus size={20} className="mr-3" />
                  <span className="text-sm font-medium">Создать новую викторину</span>
                </a>
                
                <a href="/quiz-ai" className="flex items-center p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                  <Brain size={20} className="mr-3" />
                  <span className="text-sm font-medium">Создать с помощью ИИ</span>
                </a>
                
                <a href="/quizzes" className="flex items-center p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                  <FileText size={20} className="mr-3" />
                  <span className="text-sm font-medium">Просмотреть мои викторины</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
