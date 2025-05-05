import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Plus, AlertTriangle, RotateCcw, CheckCircle } from 'lucide-react';
import Sidebar from '../layout/Sidebar';
import QuizForm from '../components/QuizForm';
import QuestionForm from '../components/QuestionForm';
import QuestionsList from '../components/QuestionsList';
import QuestionPreview from '../components/QuestionPreview';
import ConfirmationModal from '../components/ConfirmationModal';
import config from '../config/config';

const CreateQuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    category_name: 'Образование',
    category_id: '',
    isPublic: false,
    questions: []
  });
  
  const [categories, setCategories] = useState([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  useEffect(() => {
    const fetchCategories = async () => {
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
        setCategories(data.categories);
        
        // Устанавливаем первую категорию по умолчанию
        if (data.categories.length > 0 && !isEditMode) {
          setQuizData(prev => ({
            ...prev,
            category_id: data.categories[0].id
          }));
        }
      } catch (err) {
        setError(err.message);
      }
    };
    
    const fetchQuiz = async () => {
      if (!isEditMode) {
        setLoading(false);
        return;
      }
      
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
          throw new Error('Не удалось загрузить викторину');
        }
        
        const data = await response.json();
        
        // Преобразуем данные в формат, подходящий для нашего интерфейса
        const transformedQuestions = data.questions ? data.questions.map(q => ({
          id: q.id,
          content: q.question || '',
          type: q.question_type === 'SINGLE' ? 'single' : 
                q.question_type === 'MULTIPLE' ? 'multiple' : 'text',
          points: q.points || 1,
          options: q.options ? q.options.map(o => ({
            id: o.id,
            content: o.name,
            isCorrect: o.is_correct
          })) : []
        })) : [];
        
        setQuizData({
          id: data.id,
          title: data.title || '',
          description: data.description || '',
          category_id: data.category_id || '',
          category_name: data.category_name || '',
          questions: transformedQuestions
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    Promise.all([fetchCategories(), fetchQuiz()]);
  }, [id, isEditMode, navigate]);
  
  const handleQuizFormSubmit = (formData) => {
    setQuizData({
      ...quizData,
      ...formData
    });
    
    setSuccessMessage('Основная информация обновлена');
    setTimeout(() => setSuccessMessage(null), 3000);
  };
  
  const handleAddQuestion = () => {
    setCurrentQuestion(null);
    setCurrentQuestionIndex(-1);
    setShowQuestionForm(true);
  };
  
  const handleEditQuestion = (question, index) => {
    setCurrentQuestion(question);
    setCurrentQuestionIndex(index);
    setShowQuestionForm(true);
  };
  
  const handleDeleteQuestion = (index) => {
    // Используем модальное окно подтверждения вместо window.confirm
    setCurrentQuestionIndex(index);
    setShowConfirmation(true);
  };
  
  const confirmDeleteQuestion = () => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions.splice(currentQuestionIndex, 1);
    
    setQuizData({
      ...quizData,
      questions: updatedQuestions
    });
    
    setShowConfirmation(false);
  };
  
  const handleReorderQuestion = (index, direction) => {
    const updatedQuestions = [...quizData.questions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap questions
    [updatedQuestions[index], updatedQuestions[newIndex]] = 
    [updatedQuestions[newIndex], updatedQuestions[index]];
    
    setQuizData({
      ...quizData,
      questions: updatedQuestions
    });
  };
  
  const handlePreviewQuestion = (question) => {
    setPreviewQuestion(question);
  };
  
  const handleQuestionFormSubmit = (questionData) => {
    const updatedQuestions = [...quizData.questions];
    
    if (currentQuestionIndex >= 0) {
      // Edit existing question
      updatedQuestions[currentQuestionIndex] = {
        ...questionData,
        id: updatedQuestions[currentQuestionIndex].id // Сохраняем существующий id
      };
    } else {
      // Add new question
      updatedQuestions.push({
        ...questionData,
        id: `temp-${Date.now()}` // Temporary ID for new questions
      });
    }
    
    setQuizData({
      ...quizData,
      questions: updatedQuestions
    });
    
    setShowQuestionForm(false);
    setCurrentQuestion(null);
    setCurrentQuestionIndex(-1);
  };
  
  const handleQuestionFormCancel = () => {
    setShowQuestionForm(false);
    setCurrentQuestion(null);
    setCurrentQuestionIndex(-1);
  };
  
  const prepareDataForApi = () => {
    // Преобразуем вопросы для API
    const questions = quizData.questions.map(question => {
      const apiQuestion = {
        id: question.id && !question.id.startsWith('temp-') ? question.id : null,
        question: question.content,
        question_type: question.type === 'single' ? 'SINGLE' : 
                      question.type === 'multiple' ? 'MULTIPLE' : 'TEXT_ANSWER',
        points: parseInt(question.points),
      };
      
      if (question.type !== 'text') {
        apiQuestion.options = question.options.map(option => ({
          id: option.id || null,
          name: option.content,
          is_correct: option.isCorrect
        }));
      }
      
      return apiQuestion;
    });
    
    return {
      title: quizData.title,
      description: quizData.description,
      category_id: quizData.category_id,
      questions: questions
    };
  };
  
  const handleSaveQuiz = async () => {
    if (!quizData.title.trim() || !quizData.description.trim()) {
      setError('Пожалуйста, заполните название и описание викторины');
      return;
    }
    
    if (!quizData.category_id) {
      setError('Выберите категорию для викторины');
      return;
    }
    
    if (quizData.questions.length === 0) {
      setError('Викторина должна содержать хотя бы один вопрос');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const apiData = prepareDataForApi();
      
      // Подготовка FormData для отправки файлов и JSON данных
      const formData = new FormData();
      
      // Добавляем изображения вопросов, если есть
      quizData.questions.forEach((question, index) => {
        if (question.image instanceof File) {
          formData.append(`question_images[${index}]`, question.image);
        }
      });
      
      // Добавляем JSON данные викторины
      formData.append('quizData', JSON.stringify(apiData));
      
      const url = isEditMode 
        ? `${config.apiBaseUrl}/quiz/quizes/${id}` 
        : `${config.apiBaseUrl}/quiz/quizes`;
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось сохранить викторину');
      }
      
      const result = await response.json();
      
      // Успешно сохранено, перенаправляем на страницу со списком викторин
      navigate('/quizzes');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-4 md:p-8 ml-0 lg:ml-64">
          <div className="max-w-7xl mx-auto flex items-center justify-center h-full">
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Загрузка данных...</p>
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
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {isEditMode ? 'Редактирование викторины' : 'Создание новой викторины'}
            </h1>
            
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => navigate('/quizzes')}
                className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <RotateCcw size={20} className="mr-2" />
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSaveQuiz}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={20} className="mr-2" />
                {saving ? 'Сохранение...' : 'Сохранить викторину'}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-start">
              <AlertTriangle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          {successMessage && (
            <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg flex items-start">
              <CheckCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}
          
          <QuizForm
            initialValues={quizData}
            categories={categories}
            onSubmit={handleQuizFormSubmit}
            isEdit={isEditMode}
          />
          
          {!showQuestionForm ? (
            <>
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <h2 className="text-xl font-semibold text-gray-800">Вопросы викторины</h2>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Plus size={20} className="mr-2" />
                    Добавить вопрос
                  </button>
                </div>
                
                <div className="mt-4 text-sm text-gray-500">
                  {isEditMode
                    ? 'Отредактируйте существующие вопросы или добавьте новые'
                    : 'Добавьте вопросы для вашей викторины. Вы можете добавить текстовые вопросы или вопросы с вариантами ответов'}
                </div>
              </div>
              
              <QuestionsList
                questions={quizData.questions}
                onEdit={handleEditQuestion}
                onDelete={handleDeleteQuestion}
                onReorder={handleReorderQuestion}
                onPreview={handlePreviewQuestion}
              />
            </>
          ) : (
            <QuestionForm
              initialData={currentQuestion}
              onSubmit={handleQuestionFormSubmit}
              onCancel={handleQuestionFormCancel}
              isEdit={currentQuestionIndex >= 0}
            />
          )}
          
          {previewQuestion && (
            <QuestionPreview 
              question={previewQuestion} 
              onClose={() => setPreviewQuestion(null)} 
            />
          )}
          
          <ConfirmationModal
            isOpen={showConfirmation}
            onClose={() => setShowConfirmation(false)}
            onConfirm={confirmDeleteQuestion}
            title="Удаление вопроса"
            message="Вы уверены, что хотите удалить этот вопрос? Это действие нельзя будет отменить."
            confirmText="Удалить"
            cancelText="Отмена"
            type="danger"
          />
        </div>
      </div>
    </div>
  );
};

export default CreateQuizPage; 