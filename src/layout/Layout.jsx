import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { to: '#demo', label: 'Демо' },
  { to: '#info', label: 'Информация' },
  { to: '#start', label: 'Начать' },
];

const Layout = ({ children, fullWidth = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // Проверяем, авторизован ли пользователь
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);
  
  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    
    // Если мы не на главной странице, сначала перейдем на нее
    if (location.pathname !== '/') {
      navigate('/');
      // Даем время для перехода на главную страницу
      setTimeout(() => {
        const section = document.querySelector(sectionId);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // Если мы уже на главной, просто прокручиваем к секции
      const section = document.querySelector(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gray-50">
      <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-[98vw] max-w-7xl rounded-2xl bg-white/95 shadow-lg border border-gray-200 backdrop-blur-md px-8 py-3 flex items-center justify-between" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-lg font-bold text-gray-800 tracking-tight hover:text-blue-600 transition-colors">
            QuizMaker
          </Link>
        </div>
        <div className="flex items-center space-x-6">
          {navItems.map(item => (
            <a
              key={item.to}
              href={item.to}
              onClick={(e) => scrollToSection(e, item.to)}
              className={`transition-colors px-2 py-1 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50`}
            >
              {item.label}
            </a>
          ))}
          {isLoggedIn ? (
            <Link
              to="/dashboard"
              className="ml-4 px-5 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-800 transition"
            >
              Личный кабинет
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="ml-4 px-5 py-2 rounded-full bg-gray-100 text-gray-800 font-semibold shadow hover:bg-gray-200 transition"
              >
                Регистрация
              </Link>
              <Link
                to="/login"
                className="ml-4 px-5 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-800 transition"
              >
                Войти
              </Link>
            </>
          )}
        </div>
      </nav>
      <main className="flex-grow pt-32 w-full">
        {children}
      </main>
    </div>
  );
};

export default Layout;
