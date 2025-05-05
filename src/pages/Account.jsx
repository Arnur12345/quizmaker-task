import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Trophy, 
  Star, 
  Clock, 
  GitBranch, 
  Medal, 
  Award, 
  CheckCircle, 
  Zap, 
  Flame,
  ChevronUp,
  BookOpen,
  Brain,
  Dumbbell,
  Settings as SettingsIcon
} from 'lucide-react';
import Sidebar from '../layout/Sidebar';
import Settings from '../components/Settings';
import config from '../config/config';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Регистрируем компоненты Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LEVELS = [
  { level: 1, xp: 0, title: "Новичок" },
  { level: 2, xp: 100, title: "Ученик" },
  { level: 3, xp: 250, title: "Эрудит" },
  { level: 4, xp: 500, title: "Знаток" },
  { level: 5, xp: 1000, title: "Мастер" },
  { level: 6, xp: 2000, title: "Гуру" },
  { level: 7, xp: 4000, title: "Мудрец" },
  { level: 8, xp: 8000, title: "Легенда" }
];

// Достижения в системе
const ACHIEVEMENTS = [
  { 
    id: 'first_quiz', 
    title: 'Первый шаг', 
    description: 'Пройдите свою первую викторину', 
    icon: <BookOpen size={24} />,
    requirement: (stats) => stats.testsCount >= 1
  },
  { 
    id: 'quiz_master', 
    title: 'Мастер викторин', 
    description: 'Пройдите 10 викторин', 
    icon: <Trophy size={24} />,
    requirement: (stats) => stats.testsCount >= 10
  },
  { 
    id: 'daily_streak', 
    title: 'Ежедневный прогресс', 
    description: 'Занимайтесь 3 дня подряд', 
    icon: <Flame size={24} />,
    requirement: (stats) => stats.currentStreak >= 3
  },
  { 
    id: 'perfect_score', 
    title: 'Идеальный результат', 
    description: 'Получите 100% в викторине', 
    icon: <CheckCircle size={24} />,
    requirement: (stats) => stats.hasPerfectScore
  },
  { 
    id: 'brain_power', 
    title: 'Сила знаний', 
    description: 'Заработайте 1000 XP', 
    icon: <Brain size={24} />,
    requirement: (stats) => stats.totalScore >= 1000
  },
  { 
    id: 'topic_master', 
    title: 'Эксперт в теме', 
    description: 'Пройдите 5 викторин в одной категории', 
    icon: <Star size={24} />,
    requirement: (stats) => Object.values(stats.categoriesCount || {}).some(count => count >= 5)
  },
  { 
    id: 'workout', 
    title: 'Тренировка мозга', 
    description: 'Пройдите 5 викторин за один день', 
    icon: <Dumbbell size={24} />,
    requirement: (stats) => stats.maxDailyQuizzes >= 5
  }
];

const Account = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    testsCount: 0,
    totalScore: 0,
    hasPerfectScore: false,
    currentStreak: 0,
    maxStreak: 0,
    maxDailyQuizzes: 0,
    categoriesCount: {}
  });
  const [achievements, setAchievements] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        // Получаем данные пользователя из localStorage
        // Получаем данные пользователя из токена
        const userData = JSON.parse(atob(token.split('.')[1]));
        
        // Получаем дополнительные данные из localStorage
        const userScore = parseInt(localStorage.getItem('score') || '0');
        
        // Устанавливаем профиль пользователя
        setUserProfile({
          name: userData.name || "Пользователь",
          surname: userData.surname || "",
          login: userData.login || "user@example.com",
          score: userScore,
          level: 1, // Будет рассчитано позже
        });

        // Получение статистики активности пользователя
        const activityResponse = await fetch(`${config.apiBaseUrl}/quiz/user-activity`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!activityResponse.ok) {
          throw new Error('Не удалось загрузить данные активности');
        }

        const activityData = await activityResponse.json();
        setActivityData(activityData);
        
        // Получение количества пройденных тестов
        const testsCountResponse = await fetch(`${config.apiBaseUrl}/quiz/user-tests-count`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!testsCountResponse.ok) {
          throw new Error('Не удалось загрузить количество тестов');
        }

        const testsCountData = await testsCountResponse.json();
        
        // Расчет некоторых метрик на основе полученных данных
        // В реальном приложении эти данные должны возвращаться сервером
        let currentStreak = 0;
        let maxStreak = 0;
        let tempStreak = 0;
        let maxDailyQuizzes = 0;
        
        // Получаем текущий день и предыдущие дни
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const todayStr = today.toISOString().split('T')[0];
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        // Расчет streak и максимального количества квизов за день
        activityData.forEach(day => {
          if (day.count > 0) {
            tempStreak++;
            
            // Обновляем максимальное количество квизов за день
            if (day.count > maxDailyQuizzes) {
              maxDailyQuizzes = day.count;
            }
          } else {
            tempStreak = 0;
          }
          
          if (tempStreak > maxStreak) {
            maxStreak = tempStreak;
          }
        });
        
        // Проверяем, есть ли активность сегодня или вчера для текущей серии
        const todayActivity = activityData.find(day => day.date === todayStr);
        const yesterdayActivity = activityData.find(day => day.date === yesterdayStr);
        
        if (todayActivity && todayActivity.count > 0) {
          currentStreak = 1;
          // Ищем предыдущие последовательные дни
          let checkDate = new Date(today);
          checkDate.setDate(checkDate.getDate() - 1);
          
          while (true) {
            const dateStr = checkDate.toISOString().split('T')[0];
            const dayActivity = activityData.find(day => day.date === dateStr);
            
            if (dayActivity && dayActivity.count > 0) {
              currentStreak++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              break;
            }
          }
        } else if (yesterdayActivity && yesterdayActivity.count > 0) {
          // Если сегодня нет активности, но была вчера, проверяем предыдущие дни
          currentStreak = 1;
          let checkDate = new Date(yesterday);
          checkDate.setDate(checkDate.getDate() - 1);
          
          while (true) {
            const dateStr = checkDate.toISOString().split('T')[0];
            const dayActivity = activityData.find(day => day.date === dateStr);
            
            if (dayActivity && dayActivity.count > 0) {
              currentStreak++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              break;
            }
          }
        }
        
        // Получаем данные о категориях из localStorage
        const categoriesData = JSON.parse(localStorage.getItem('categoriesCount') || '{}');
        
        // Получаем информацию о идеальном результате из localStorage
        const hasPerfectScore = localStorage.getItem('hasPerfectScore') === 'true';
        
        // Устанавливаем статистику
        setStats({
          testsCount: testsCountData.tests_count,
          totalScore: userScore,
          hasPerfectScore: hasPerfectScore,
          currentStreak,
          maxStreak,
          maxDailyQuizzes,
          categoriesCount: categoriesData
        });
        
        // Сохраняем обновленные данные в localStorage
        localStorage.setItem('userStreak', currentStreak.toString());
        localStorage.setItem('maxStreak', maxStreak.toString());
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);
  
  // Рассчитываем уровень и прогресс пользователя
  useEffect(() => {
    if (userProfile) {
      // Рассчитываем уровень на основе XP
      const calculateLevel = (xp) => {
        for (let i = LEVELS.length - 1; i >= 0; i--) {
          if (xp >= LEVELS[i].xp) {
            return {
              ...LEVELS[i],
              nextLevelXP: i < LEVELS.length - 1 ? LEVELS[i + 1].xp : null,
              progress: i < LEVELS.length - 1 
                ? Math.floor(((xp - LEVELS[i].xp) / (LEVELS[i + 1].xp - LEVELS[i].xp)) * 100) 
                : 100
            };
          }
        }
        return { ...LEVELS[0], nextLevelXP: LEVELS[1].xp, progress: 0 };
      };
      
      const levelData = calculateLevel(userProfile.score);
      setUserProfile({
        ...userProfile,
        level: levelData.level,
        levelTitle: levelData.title,
        progress: levelData.progress,
        nextLevelXP: levelData.nextLevelXP
      });
      
      // Сохраняем уровень в localStorage
      localStorage.setItem('userLevel', levelData.level.toString());
      localStorage.setItem('userLevelTitle', levelData.title);
    }
  }, [userProfile?.score]);
  
  // Получаем список достижений
  useEffect(() => {
    if (stats) {
      const achievementsList = ACHIEVEMENTS.map(achievement => ({
        ...achievement,
        unlocked: achievement.requirement(stats)
      }));
      setAchievements(achievementsList);
      
      // Сохраняем достижения в localStorage
      localStorage.setItem('achievements', JSON.stringify(
        achievementsList.filter(a => a.unlocked).map(a => a.id)
      ));
    }
  }, [stats]);
  
  // График активности по дням
  const activityChartData = {
    labels: activityData.slice(-30).map(day => {
      const date = new Date(day.date);
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }),
    datasets: [
      {
        label: 'Пройдено викторин',
        data: activityData.slice(-30).map(day => day.count),
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        tension: 0.4
      }
    ]
  };
  
  const activityChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Ваша активность за последние 30 дней'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };
  
  // График категорий
 
  
  

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-4 md:p-8 ml-0 lg:ml-64">
          <div className="max-w-7xl mx-auto flex items-center justify-center h-full">
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Загрузка данных аккаунта...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-4 md:p-8 ml-0 lg:ml-64">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-100 p-6 rounded-lg text-red-700">
              <h2 className="text-xl font-semibold mb-2">Ошибка</h2>
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 ml-0 lg:ml-64">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Личный кабинет</h1>
            
            {/* Вкладки */}
            <div className="flex mt-4 md:mt-0 bg-white rounded-lg shadow-sm">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 flex items-center text-sm font-medium rounded-l-lg ${
                  activeTab === 'profile' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User size={16} className="mr-2" />
                Профиль
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 flex items-center text-sm font-medium rounded-r-lg ${
                  activeTab === 'settings' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <SettingsIcon size={16} className="mr-2" />
                Настройки
              </button>
            </div>
          </div>
          
          {/* Отображаем содержимое в зависимости от активной вкладки */}
          {activeTab === 'profile' ? (
            <>
              {/* Профиль пользователя и статистика */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Карточка профиля */}
                <div className="bg-white rounded-xl shadow-sm p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-24 w-24 bg-blue-500 rounded-full transform translate-x-6 -translate-y-6 opacity-10"></div>
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      <User size={32} className="text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">
                        {userProfile?.name} {userProfile?.surname}
                      </h2>
                      <p className="text-gray-500">{userProfile?.login}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Уровень {userProfile?.level}</span>
                      <span className="text-gray-600">{userProfile?.score} XP</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${userProfile?.progress}%` }}></div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {userProfile?.levelTitle} 
                      {userProfile?.nextLevelXP && ` • До уровня ${userProfile.level + 1}: ${userProfile.nextLevelXP - userProfile.score} XP`}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Текущая серия</p>
                        <div className="flex items-center mt-1">
                          <Flame size={18} className="text-orange-500 mr-2" />
                          <span className="font-semibold text-gray-800">{stats.currentStreak} дней</span>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Лучшая серия</p>
                        <div className="flex items-center mt-1">
                          <Trophy size={18} className="text-yellow-500 mr-2" />
                          <span className="font-semibold text-gray-800">{stats.maxStreak} дней</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Статистика */}
                <div className="bg-white rounded-xl shadow-sm p-6 md:col-span-2">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Статистика</h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="w-10 h-10 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-3">
                        <BookOpen size={20} className="text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-800">{stats.testsCount}</p>
                      <p className="text-sm text-gray-600">Викторин пройдено</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="w-10 h-10 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-3">
                        <Star size={20} className="text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-800">{userProfile?.score}</p>
                      <p className="text-sm text-gray-600">Очков опыта</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <div className="w-10 h-10 mx-auto rounded-full bg-purple-100 flex items-center justify-center mb-3">
                        <Award size={20} className="text-purple-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-800">
                        {achievements.filter(a => a.unlocked).length}
                      </p>
                      <p className="text-sm text-gray-600">Достижений</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg text-center">
                      <div className="w-10 h-10 mx-auto rounded-full bg-orange-100 flex items-center justify-center mb-3">
                        <GitBranch size={20} className="text-orange-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-800">
                        {Object.keys(stats.categoriesCount).length}
                      </p>
                      <p className="text-sm text-gray-600">Категорий</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Графики активности */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Активность</h2>
                  <div className="h-64">
                    <Line data={activityChartData} options={activityChartOptions} />
                  </div>
                </div>
              </div>
              
              {/* Достижения */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Достижения</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {achievements.map((achievement) => (
                    <div 
                      key={achievement.id} 
                      className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                        achievement.unlocked 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200 bg-gray-50 opacity-75 hover:opacity-90'
                      }`}
                    >
                      <div className="flex items-center mb-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                          achievement.unlocked ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'
                        }`}>
                          {achievement.icon}
                        </div>
                        <div>
                          <h3 className={`font-medium ${achievement.unlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                            {achievement.title}
                          </h3>
                          {achievement.unlocked && (
                            <span className="inline-flex items-center text-xs text-green-600">
                              <CheckCircle size={12} className="mr-1" />
                              Получено
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Рекомендации */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
                <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
                  <Zap size={20} className="mr-2 text-blue-600" />
                  Рекомендации
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex bg-white bg-opacity-60 p-4 rounded-lg shadow-sm">
                    <div className="bg-blue-100 p-2 rounded-full h-min mr-4">
                      <Flame size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-800 mb-1">Поддерживайте серию</h3>
                      <p className="text-sm text-blue-700">
                        Проходите хотя бы одну викторину каждый день, чтобы увеличить вашу серию.
                        Сейчас ваша серия составляет {stats.currentStreak} {stats.currentStreak === 1 ? 'день' : stats.currentStreak < 5 ? 'дня' : 'дней'}.
                      </p>
                    </div>
                  </div>
                  {!achievements.find(a => a.id === 'perfect_score')?.unlocked && (
                    <div className="flex bg-white bg-opacity-60 p-4 rounded-lg shadow-sm">
                      <div className="bg-blue-100 p-2 rounded-full h-min mr-4">
                        <Trophy size={24} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-blue-800 mb-1">Получите идеальный результат</h3>
                        <p className="text-sm text-blue-700">
                          Попробуйте получить 100% в одной из викторин, чтобы разблокировать достижение "Идеальный результат".
                        </p>
                      </div>
                    </div>
                  )}
                  {stats.testsCount < 10 && (
                    <div className="flex bg-white bg-opacity-60 p-4 rounded-lg shadow-sm">
                      <div className="bg-blue-100 p-2 rounded-full h-min mr-4">
                        <ChevronUp size={24} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-blue-800 mb-1">Продолжайте обучение</h3>
                        <p className="text-sm text-blue-700">
                          Пройдите еще {10 - stats.testsCount} викторин, чтобы получить достижение "Мастер викторин".
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <Settings onClose={() => setActiveTab('profile')} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;
