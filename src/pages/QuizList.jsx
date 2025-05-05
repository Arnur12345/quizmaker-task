import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Search, Plus, Filter, ArrowUp, ArrowDown, Trash2, Edit } from 'lucide-react';
import config from '../config/config';
import Sidebar from '../layout/Sidebar';
import ConfirmationModal from '../components/ConfirmationModal';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterCategory, setFilterCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Получаем список категорий
        const categoriesResponse = await fetch(`${config.apiBaseUrl}/quiz/categories`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!categoriesResponse.ok) {
          throw new Error('Не удалось загрузить категории');
        }

        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories || []);

        // Получаем список викторин
        const quizzesResponse = await fetch(`${config.apiBaseUrl}/quiz/quizes`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!quizzesResponse.ok) {
          throw new Error('Не удалось загрузить викторины');
        }

        const quizzesData = await quizzesResponse.json();
        setQuizzes(quizzesData.quizes || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDeleteClick = (quiz) => {
    setQuizToDelete(quiz);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = async () => {
    if (!quizToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiBaseUrl}/quiz/quizes/${quizToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Не удалось удалить викторину');
      }

      setQuizzes(quizzes.filter(quiz => quiz.id !== quizToDelete.id));
      setShowDeleteConfirmation(false);
      setQuizToDelete(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredQuizzes = quizzes
    .filter(quiz => {
      const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (quiz.description && quiz.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || quiz.category_id === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === 'createdAt') {
        comparison = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      } else if (sortField === 'questionsCount') {
        comparison = (a.questions?.length || 0) - (b.questions?.length || 0);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const getRandomColor = () => {
    const colors = ['blue', 'green', 'purple', 'indigo', 'pink', 'red', 'yellow', 'teal'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 ml-0 lg:ml-64">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Мои викторины</h1>
            <Link 
              to="/create-quiz" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} className="mr-2" />
              Создать викторину
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Поиск викторин..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter size={18} className="text-gray-400" />
                  </div>
                  <select
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="all">Все категории</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                <p className="mt-4 text-gray-600">Загрузка викторин...</p>
              </div>
            ) : filteredQuizzes.length > 0 ? (
              <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          <button 
                            className="flex items-center space-x-1 focus:outline-none"
                            onClick={() => handleSort('title')}
                          >
                            <span>Название</span>
                            {sortField === 'title' && (
                              sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                            )}
                          </button>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Категория
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Действия
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredQuizzes.map((quiz) => {
                        const color = getRandomColor();
                        const categoryName = categories.find(cat => cat.id === quiz.category_id)?.name || quiz.category_name || 'Без категории';
                        
                        return (
                          <tr 
                            key={quiz.id} 
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => navigate(`/quiz/${quiz.id}`)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className={`p-2 rounded-full bg-${color}-100 text-${color}-600 mr-3 flex-shrink-0`}>
                                  <FileText size={18} />
                                </div>
                                <div>
                                  <div 
                                    className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer"
                                    onClick={() => navigate(`/quiz/${quiz.id}`)}
                                  >
                                    {quiz.title}
                                  </div>
                                  {quiz.description && (
                                    <div className="text-sm text-gray-500 truncate max-w-xs">{quiz.description}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-${color}-100 text-${color}-800`}>
                                {categoryName}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <Link 
                                  to={`/quiz/${quiz.id}`} 
                                  className="text-blue-600 hover:text-blue-900 p-1"
                                  title="Просмотр"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <FileText size={18} />
                                </Link>
                                <Link 
                                  to={`/edit-quiz/${quiz.id}`} 
                                  className="text-indigo-600 hover:text-indigo-900 p-1"
                                  title="Редактировать"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Edit size={18} />
                                </Link>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(quiz);
                                  }} 
                                  className="text-red-600 hover:text-red-900 p-1"
                                  title="Удалить"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">У вас пока нет викторин</h3>
                <p className="text-gray-500 mb-6">Создайте свою первую викторину, чтобы начать</p>
                <Link 
                  to="/create-quiz" 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={20} className="mr-2" />
                  Создать викторину
                </Link>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Советы по созданию викторин</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="p-4 border border-blue-100 rounded-lg bg-blue-50">
                <h3 className="font-medium text-blue-800 mb-2">Разнообразие вопросов</h3>
                <p className="text-sm text-blue-700">Используйте разные типы вопросов: с выбором ответа, с открытым ответом, на сопоставление.</p>
              </div>
              <div className="p-4 border border-purple-100 rounded-lg bg-purple-50">
                <h3 className="font-medium text-purple-800 mb-2">Четкие формулировки</h3>
                <p className="text-sm text-purple-700">Формулируйте вопросы ясно и однозначно, чтобы избежать путаницы.</p>
              </div>
              <div className="p-4 border border-green-100 rounded-lg bg-green-50">
                <h3 className="font-medium text-green-800 mb-2">Используйте изображения</h3>
                <p className="text-sm text-green-700">Добавляйте картинки к вопросам, чтобы сделать викторину более интересной и наглядной.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => {
          setShowDeleteConfirmation(false);
          setQuizToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Удаление викторины"
        message={`Вы уверены, что хотите удалить викторину "${quizToDelete?.title}"? Это действие нельзя будет отменить.`}
        confirmText="Удалить"
        cancelText="Отмена"
        type="danger"
      />
    </div>
  );
};

export default QuizList;
