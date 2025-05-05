import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  FilePlus, 
  Brain, 
  User, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Menu
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [userData, setUserData] = useState({ name: '', surname: '' });
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Получаем данные пользователя из localStorage
    try {
      const name = localStorage.getItem('name') || '';
      const surname = localStorage.getItem('surname') || '';
      setUserData({ name, surname });
    } catch (error) {
      console.error("Ошибка доступа к localStorage:", error);
    }
  }, []);

  const handleLogout = () => {
    // Обработка выхода из системы
    console.log("Выход из системы...");
    // Очистка localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('login');
    localStorage.removeItem('name');
    localStorage.removeItem('surname');
    localStorage.removeItem('score');
    
    // Перенаправление на страницу входа
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'Quizzes', icon: <FileText size={20} />, path: '/quizzes' },
    { name: 'Create Quiz', icon: <FilePlus size={20} />, path: '/create-quiz' },
    { name: 'QuizAI', icon: <Brain size={20} />, path: '/quiz-ai' },
    { name: 'Account', icon: <User size={20} />, path: '/account' },
  ];

  return (
    <>
      {/* Кнопка мобильного меню - видна только на маленьких экранах */}
      <div className="lg:hidden fixed top-4 left-4 z-30">
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-md bg-white shadow-md"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Боковая панель - адаптивная */}
      <div className={`
        fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 z-20
        ${collapsed ? 'w-20' : 'w-64'} 
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Логотип и кнопка сворачивания */}
        <div className="flex items-center justify-between p-4 border-b">
          {!collapsed && (
            <div className="font-bold text-xl text-gray-800">QuizMaker</div>
          )}
          <button 
            className={`p-1 rounded-full hover:bg-gray-100 ${collapsed ? 'mx-auto' : ''}`}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Навигационное меню */}
        <div className="py-4">
          <div className="text-gray-400 uppercase text-xs font-semibold px-4 py-2">
            {!collapsed && "DASHBOARD"}
          </div>
          <nav>
            {menuItems.map((item, index) => (
              <a 
                key={index}
                href={item.path}
                className={`
                  flex items-center px-4 py-3 mx-2 my-1 rounded-lg
                  ${location.pathname === item.path ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}
                `}
              >
                <div className={collapsed ? 'mx-auto' : ''}>
                  {item.icon}
                </div>
                {!collapsed && <span className="ml-3">{item.name}</span>}
              </a>
            ))}
          </nav>
        </div>

        {/* Секция профиля пользователя */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
              {userData.name.charAt(0)}{userData.surname.charAt(0)}
            </div>
            
            {!collapsed && (
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700">
                  {userData.name} {userData.surname}
                </p>
                <button 
                  onClick={handleLogout}
                  className="flex items-center text-xs text-gray-500 hover:text-gray-700"
                >
                  <LogOut size={14} className="mr-1" />
                  Log Out
                </button>
              </div>
            )}
            
            {collapsed && (
              <button 
                onClick={handleLogout} 
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-gray-500 hover:text-gray-700"
              >
                <LogOut size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}