import React from 'react';
import { Edit, Trash2, Layers, Eye, ArrowUp, ArrowDown, HelpCircle, AlertTriangle } from 'lucide-react';

const QuestionsList = ({ questions, onEdit, onDelete, onReorder, onPreview }) => {
  if (!questions || questions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center mb-4">
          <Layers size={20} className="mr-2 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-800">Вопросы</h2>
        </div>
        
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <AlertTriangle size={40} className="mx-auto text-yellow-500 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Нет вопросов</h3>
          <p className="text-gray-500">Добавьте хотя бы один вопрос для вашей викторины</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Layers size={20} className="mr-2 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            Вопросы ({questions.length})
          </h2>
        </div>
      </div>
      
      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={question.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start flex-grow">
                <div className="bg-indigo-100 text-indigo-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-grow">
                  <h3 className="text-base font-medium text-gray-800 mb-1">{question.content}</h3>
                  <div className="flex flex-wrap items-center text-sm text-gray-500 mb-2 gap-2">
                    <span className="px-2 py-1 bg-gray-100 rounded-full">
                      {question.type === 'single' ? 'Один вариант' : 
                       question.type === 'multiple' ? 'Несколько вариантов' : 'Текстовый ответ'}
                    </span>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                      {question.points} {question.points === 1 ? 'балл' : 
                      question.points > 1 && question.points < 5 ? 'балла' : 'баллов'}
                    </span>
                    {question.image && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        Есть изображение
                      </span>
                    )}
                  </div>
                  
                  {(question.type === 'single' || question.type === 'multiple') && (
                    <div className="mt-3 pl-2 border-l-2 border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Варианты ответов:</p>
                      <div className="space-y-1">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center">
                            <span className={`w-4 h-4 rounded-full mr-2 flex-shrink-0 ${option.isCorrect ? 'bg-green-500' : 'bg-gray-200'}`}></span>
                            <span className={`text-sm ${option.isCorrect ? 'font-medium text-green-700' : 'text-gray-600'}`}>
                              {option.content}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2 ml-3">
                {index > 0 && (
                  <button
                    onClick={() => onReorder(index, 'up')}
                    className="p-1.5 text-gray-600 hover:text-indigo-700 hover:bg-indigo-50 rounded"
                    title="Переместить вверх"
                  >
                    <ArrowUp size={16} />
                  </button>
                )}
                
                {index < questions.length - 1 && (
                  <button
                    onClick={() => onReorder(index, 'down')}
                    className="p-1.5 text-gray-600 hover:text-indigo-700 hover:bg-indigo-50 rounded"
                    title="Переместить вниз"
                  >
                    <ArrowDown size={16} />
                  </button>
                )}
                
                <button
                  onClick={() => onPreview(question)}
                  className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                  title="Предпросмотр вопроса"
                >
                  <Eye size={16} />
                </button>
                
                <button
                  onClick={() => onEdit(question, index)}
                  className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded"
                  title="Редактировать вопрос"
                >
                  <Edit size={16} />
                </button>
                
                <button
                  onClick={() => onDelete(index)}
                  className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                  title="Удалить вопрос"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionsList; 