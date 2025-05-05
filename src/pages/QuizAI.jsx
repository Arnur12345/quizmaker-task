import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wand2, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import config from '../config/config';
import Sidebar from '../layout/Sidebar';

const QuizAI = () => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    text: '',
    category_id: ''
  });
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        const response = await fetch(`${config.apiBaseUrl}/quiz/categories`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Не удалось загрузить категории');
        }
        
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.text.trim()) {
      setError('Введите текст для генерации вопросов');
      return;
    }
    
    if (!formData.category_id) {
      setError('Выберите категорию');
      return;
    }
    
    setError(null);
    setSuccess(null);
    setGenerating(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await fetch(`${config.apiBaseUrl}/quiz/generate-quiz`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось сгенерировать викторину');
      }
      
      const data = await response.json();
      setGeneratedQuiz(data);
      setSuccess('Викторина успешно сгенерирована!');
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const viewGeneratedQuiz = () => {
    if (generatedQuiz && generatedQuiz.id) {
      navigate(`/quiz/${generatedQuiz.id}`);
    }
  };

  const editGeneratedQuiz = () => {
    if (generatedQuiz && generatedQuiz.id) {
      navigate(`/edit-quiz/${generatedQuiz.id}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 ml-0 lg:ml-64">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate('/quizzes')}
              className="mr-4 p-2 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Создать викторину с помощью ИИ
            </h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-start">
              <AlertTriangle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg flex items-start">
              <CheckCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Категория викторины
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading || generating}
                >
                  <option value="">Выберите категорию</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
                  Текст для генерации вопросов
                </label>
                <textarea
                  id="text"
                  name="text"
                  value={formData.text}
                  onChange={handleInputChange}
                  placeholder="Вставьте статью, параграф из книги или любой другой текст, на основе которого ИИ создаст вопросы..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px]"
                  disabled={generating}
                ></textarea>
                <p className="mt-2 text-sm text-gray-500">
                  Чем больше текста вы предоставите, тем более точные и разнообразные вопросы сможет составить ИИ.
                </p>
              </div>

              <button
                type="submit"
                disabled={generating || loading}
                className="w-full inline-flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <Loader2 size={20} className="animate-spin mr-2" />
                    Генерация викторины...
                  </>
                ) : (
                  <>
                    <Wand2 size={20} className="mr-2" />
                    Создать викторину с помощью ИИ
                  </>
                )}
              </button>
            </form>
          </div>

          {generatedQuiz && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Сгенерированная викторина: {generatedQuiz.title}
              </h2>
              <p className="text-gray-600 mb-4">{generatedQuiz.description}</p>
              
              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-2">Вопросы:</h3>
              <div className="space-y-4">
                {generatedQuiz.generated_data.questions.map((question, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <p className="font-medium mb-2">
                      {index + 1}. {question.question}
                    </p>
                    
                    {question.type === 'text' ? (
                      <div className="mt-2 text-sm">
                        <p className="text-gray-500">Тип: Текстовый ответ</p>
                        <p className="text-gray-500">Ответ: {question.answer}</p>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <p className="text-gray-500 text-sm mb-2">
                          Тип: {question.type === 'single' ? 'Один вариант' : 'Несколько вариантов'}
                        </p>
                        <ul className="space-y-1">
                          {question.options.map((option, i) => (
                            <li 
                              key={i} 
                              className={`text-sm pl-2 border-l-2 ${
                                question.correct.includes(i) 
                                  ? 'border-green-500 text-green-700' 
                                  : 'border-gray-300 text-gray-600'
                              }`}
                            >
                              {option} {question.correct.includes(i) && '✓'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={viewGeneratedQuiz}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Просмотреть викторину
                </button>
                <button
                  onClick={editGeneratedQuiz}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Редактировать викторину
                </button>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-100 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              Как работает генерация викторин
            </h2>
            <div className="space-y-4 text-blue-800">
              <p>
                Наш ИИ анализирует предоставленный вами текст и автоматически создает вопросы разных типов:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Вопросы с одним правильным вариантом ответа</li>
                <li>Вопросы с несколькими правильными вариантами</li>
                <li>Вопросы с открытым текстовым ответом</li>
              </ul>
              <p>
                Чем детальнее и информативнее текст, тем качественнее будут сгенерированные вопросы. 
                После генерации вы сможете редактировать викторину и вопросы по своему усмотрению.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizAI;
