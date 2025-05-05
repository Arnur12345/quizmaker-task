import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Clock, AlertTriangle, XCircle, ChevronRight, Award, CheckCircle } from 'lucide-react';
import config from '../config/config';
import Sidebar from '../layout/Sidebar';

const QuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  
  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        const response = await fetch(`${config.apiBaseUrl}/quiz/quizes/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Не удалось загрузить викторину');
        }
        
        const data = await response.json();
        setQuiz(data);
        
        // Инициализация объекта ответов пользователя
        const initialAnswers = {};
        data.questions.forEach(question => {
          initialAnswers[question.id] = question.question_type === 'MULTIPLE' 
            ? [] 
            : question.question_type === 'TEXT_ANSWER' 
              ? '' 
              : null;
        });
        
        setUserAnswers(initialAnswers);
        
        // Установка таймера, если нужно (15 минут по умолчанию)
        setTimeLeft(15 * 60); // 15 минут в секундах
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuiz();
  }, [id, navigate]);
  
  // Таймер для викторины
  useEffect(() => {
    if (!loading && quiz && timeLeft !== null) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            if (!quizCompleted) {
              handleSubmitQuiz();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [loading, quiz, timeLeft, quizCompleted]);
  
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  const handleAnswerChange = (questionId, value, isMultiple = false) => {
    setUserAnswers(prev => {
      if (isMultiple) {
        // Обработка вопросов с множественным выбором
        const currentAnswers = [...(prev[questionId] || [])];
        if (currentAnswers.includes(value)) {
          return {
            ...prev,
            [questionId]: currentAnswers.filter(v => v !== value)
          };
        } else {
          return {
            ...prev,
            [questionId]: [...currentAnswers, value]
          };
        }
      } else {
        // Обработка вопросов с одиночным выбором или текстовым ответом
        return {
          ...prev,
          [questionId]: value
        };
      }
    });
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmitQuiz();
    }
  };
  
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const handleSubmitQuiz = async () => {
    try {
      // Преобразуем ответы пользователя в формат для отправки на сервер
      const answersToSubmit = Object.entries(userAnswers).map(([questionId, answer]) => {
        const question = quiz.questions.find(q => q.id === questionId);
        
        if (question.question_type === 'MULTIPLE') {
          // Для вопросов с множественным выбором отправляем массив ID опций
          return {
            question_id: questionId,
            option_ids: answer || [],
            text_answer: null
          };
        } else if (question.question_type === 'SINGLE') {
          // Для вопросов с одиночным выбором отправляем ID опции
          return {
            question_id: questionId,
            option_ids: answer ? [answer] : [],
            text_answer: null
          };
        } else {
          // Для текстовых вопросов отправляем текстовый ответ
          return {
            question_id: questionId,
            option_ids: [],
            text_answer: answer || ''
          };
        }
      });
      
      const token = localStorage.getItem('token');
      
      // Сначала вычисляем результаты локально для отображения пользователю
      const calculatedResults = calculateResults(quiz, userAnswers);
      
      // Затем отправляем данные на сервер для сохранения
      const response = await fetch(`${config.apiBaseUrl}/quiz/submit-answers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quiz_id: id,
          answers: answersToSubmit,
          total_score: calculatedResults.totalPoints
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось отправить ответы');
      }
      
      // Получаем данные с сервера
      const responseData = await response.json();
      
      // Обновляем счет пользователя в localStorage
      localStorage.setItem('score', responseData.updated_score);
      
      // Отмечаем в localStorage, если пользователь получил идеальный результат
      if (calculatedResults.percentageCorrect === 100) {
        localStorage.setItem('hasPerfectScore', 'true');
      }
      
      // Обновляем данные о категориях в localStorage
      const category = quiz.category_id;
      const categoriesCount = JSON.parse(localStorage.getItem('categoriesCount') || '{}');
      categoriesCount[category] = (categoriesCount[category] || 0) + 1;
      localStorage.setItem('categoriesCount', JSON.stringify(categoriesCount));
      
      setResults(calculatedResults);
      setQuizCompleted(true);
      
    } catch (err) {
      setError(err.message);
    }
  };
  
  // Функция для вычисления результатов викторины локально
  const calculateResults = (quiz, userAnswers) => {
    let correctCount = 0;
    let totalPoints = 0;
    const questionResults = [];
    
    quiz.questions.forEach(question => {
      let isCorrect = false;
      const userAnswer = userAnswers[question.id];
      
      if (question.question_type === 'SINGLE') {
        // Проверка ответа для вопроса с одиночным выбором
        const correctOption = question.options.find(option => option.is_correct);
        isCorrect = correctOption && userAnswer === correctOption.id;
      } else if (question.question_type === 'MULTIPLE') {
        // Проверка ответа для вопроса с множественным выбором
        const correctOptionIds = question.options
          .filter(option => option.is_correct)
          .map(option => option.id);
        
        // Проверяем, что пользователь выбрал все правильные и только правильные варианты
        isCorrect = userAnswer && 
          correctOptionIds.length === userAnswer.length &&
          correctOptionIds.every(id => userAnswer.includes(id));
      } else if (question.question_type === 'TEXT_ANSWER') {
        // Для простоты демонстрации считаем текстовый ответ правильным,
        // если он совпадает с первым вариантом (в реальности нужна более сложная проверка)
        // В реальном проекте эта логика должна быть на сервере
        const expectedAnswer = question.options && question.options[0] ? question.options[0].name.toLowerCase() : '';
        isCorrect = expectedAnswer && userAnswer && userAnswer.toLowerCase().trim() === expectedAnswer.trim();
      }
      
      if (isCorrect) {
        correctCount++;
        totalPoints += question.points || 0;
      }
      
      questionResults.push({
        questionId: question.id,
        userAnswer,
        isCorrect,
        points: isCorrect ? (question.points || 0) : 0,
        question // Дополнительно передаем объект вопроса для отображения в результатах
      });
    });
    
    return {
      totalQuestions: quiz.questions.length,
      correctAnswers: correctCount,
      incorrectAnswers: quiz.questions.length - correctCount,
      totalPoints,
      maxPoints: quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0),
      percentageCorrect: Math.round((correctCount / quiz.questions.length) * 100),
      questionResults
    };
  };
  
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-4 md:p-8 ml-0 lg:ml-64">
          <div className="max-w-3xl mx-auto flex items-center justify-center h-full">
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Загрузка викторины...</p>
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
          <div className="max-w-3xl mx-auto">
            <div className="bg-red-100 p-6 rounded-lg text-red-700 mb-8 flex items-start">
              <AlertTriangle size={24} className="mr-3 flex-shrink-0" />
              <div>
                <h2 className="font-medium text-lg mb-2">Произошла ошибка</h2>
                <p>{error}</p>
                <button 
                  onClick={() => navigate('/quizzes')} 
                  className="mt-4 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
                >
                  Вернуться к списку викторин
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!quiz) {
    return null;
  }
  
  // Отображение результатов викторины после завершения
  if (quizCompleted && results) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-4 md:p-8 ml-0 lg:ml-64">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Результаты викторины</h1>
              <button
                onClick={() => navigate('/quizzes')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Вернуться к списку
              </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{quiz.title}</h2>
              <p className="text-gray-600 mb-6">{quiz.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <CheckCircle size={28} className="mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold text-blue-700">{results.correctAnswers}</p>
                  <p className="text-sm text-blue-700">Правильных ответов</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <XCircle size={28} className="mx-auto mb-2 text-red-600" />
                  <p className="text-2xl font-bold text-red-700">{results.incorrectAnswers}</p>
                  <p className="text-sm text-red-700">Неправильных ответов</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <Award size={28} className="mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold text-green-700">{results.totalPoints}/{results.maxPoints}</p>
                  <p className="text-sm text-green-700">Баллов набрано</p>
                </div>
              </div>
              
              <div className="mb-8">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className={`h-4 rounded-full ${
                      results.percentageCorrect >= 80 ? 'bg-green-600' : 
                      results.percentageCorrect >= 60 ? 'bg-yellow-500' : 
                      'bg-red-600'
                    }`}
                    style={{ width: `${results.percentageCorrect}%` }}
                  ></div>
                </div>
                <p className="text-sm text-center mt-2 text-gray-600">
                  Общий результат: {results.percentageCorrect}%
                </p>
              </div>
              
              <h3 className="text-lg font-medium text-gray-800 mb-4">Подробный разбор ответов:</h3>
              
              <div className="space-y-6">
                {results.questionResults.map((result, index) => (
                  <div 
                    key={result.questionId} 
                    className={`p-4 rounded-lg border ${
                      result.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`rounded-full p-1 mr-3 ${
                        result.isCorrect ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'
                      }`}>
                        {result.isCorrect ? <Check size={16} /> : <XCircle size={16} />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-2">
                          {index + 1}. {result.question.question}
                        </h4>
                        
                        {result.question.question_type === 'TEXT_ANSWER' ? (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Ваш ответ:</p>
                            <p className={`text-sm ${result.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                              {result.userAnswer || '[Нет ответа]'}
                            </p>
                            {!result.isCorrect && result.question.options && result.question.options[0] && (
                              <div className="mt-2">
                                <p className="text-sm text-gray-600">Правильный ответ:</p>
                                <p className="text-sm text-green-700">{result.question.options[0].name}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Варианты ответов:</p>
                            <ul className="space-y-1">
                              {result.question.options.map(option => {
                                const isSelected = result.question.question_type === 'MULTIPLE' 
                                  ? result.userAnswer && result.userAnswer.includes(option.id)
                                  : result.userAnswer === option.id;
                                
                                return (
                                  <li 
                                    key={option.id} 
                                    className={`flex items-center p-2 rounded-md ${
                                      isSelected && option.is_correct ? 'bg-green-200 text-green-800' :
                                      isSelected && !option.is_correct ? 'bg-red-200 text-red-800' :
                                      !isSelected && option.is_correct ? 'bg-green-100 text-green-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}
                                  >
                                    {isSelected ? (
                                      <span className="mr-2">
                                        {option.is_correct ? <Check size={16} /> : <XCircle size={16} />}
                                      </span>
                                    ) : option.is_correct ? (
                                      <span className="mr-2">
                                        <Check size={16} />
                                      </span>
                                    ) : (
                                      <span className="w-4 mr-2"></span>
                                    )}
                                    <span>{option.name}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                        
                        <p className="mt-3 text-sm">
                          {result.isCorrect 
                            ? `+${result.points} баллов` 
                            : 'Баллы не начислены'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Текущий вопрос для отображения
  const currentQuestion = quiz.questions[currentQuestionIndex];
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 ml-0 lg:ml-64">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 truncate">
              {quiz.title}
            </h1>
            
            {timeLeft !== null && (
              <div className={`flex items-center px-4 py-2 rounded-lg ${
                timeLeft < 60 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                <Clock size={20} className="mr-2" />
                <span className="font-medium">{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
                Вопрос {currentQuestionIndex + 1} из {quiz.questions.length}
              </span>
              
              <div className="flex items-center">
                <span className="text-sm font-medium mr-2">
                  {currentQuestion.points || 1} {currentQuestion.points === 1 ? 'балл' : 
                    currentQuestion.points < 5 ? 'балла' : 'баллов'}
                </span>
                <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium">
                  {currentQuestion.question_type === 'SINGLE' ? 'Один ответ' : 
                   currentQuestion.question_type === 'MULTIPLE' ? 'Несколько ответов' : 
                   'Текстовый ответ'}
                </div>
              </div>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {currentQuestion.question}
            </h2>
            
            {currentQuestion.image_url && (
              <div className="mb-6">
                <img 
                  src={currentQuestion.image_url} 
                  alt="Изображение к вопросу" 
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            )}
            
            {currentQuestion.question_type === 'TEXT_ANSWER' ? (
              <div className="mb-6">
                <label htmlFor="text-answer" className="block text-sm font-medium text-gray-700 mb-2">
                  Введите ваш ответ:
                </label>
                <input
                  id="text-answer"
                  type="text"
                  value={userAnswers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Введите ваш ответ"
                />
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {currentQuestion.options.map(option => {
                  const isMultiple = currentQuestion.question_type === 'MULTIPLE';
                  const isSelected = isMultiple 
                    ? Array.isArray(userAnswers[currentQuestion.id]) && userAnswers[currentQuestion.id].includes(option.id)
                    : userAnswers[currentQuestion.id] === option.id;
                    
                  return (
                    <div 
                      key={option.id}
                      onClick={() => handleAnswerChange(currentQuestion.id, option.id, isMultiple)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 w-5 h-5 mr-3 rounded-full border ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-gray-300'
                        } flex items-center justify-center`}>
                          {isSelected && (
                            <Check size={12} className="text-white" />
                          )}
                        </div>
                        <span className="text-gray-800">{option.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={20} className="mr-2" />
                Предыдущий
              </button>
              
              {currentQuestionIndex < quiz.questions.length - 1 ? (
                <button
                  onClick={handleNextQuestion}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Следующий
                  <ArrowRight size={20} className="ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Завершить викторину
                  <ChevronRight size={20} className="ml-2" />
                </button>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {quiz.questions.map((_, index) => {
                const questionId = quiz.questions[index].id;
                const hasAnswer = userAnswers[questionId] && 
                  (Array.isArray(userAnswers[questionId]) 
                    ? userAnswers[questionId].length > 0 
                    : userAnswers[questionId] !== '');
                
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index === currentQuestionIndex
                        ? 'bg-blue-600 text-white'
                        : hasAnswer 
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-gray-100 text-gray-800 border border-gray-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
