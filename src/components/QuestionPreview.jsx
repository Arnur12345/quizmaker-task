import React, { useState } from 'react';
import { X, Check, Clock, Award } from 'lucide-react';

const QuestionPreview = ({ question, onClose }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [textAnswer, setTextAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  // Защита от null или undefined
  const safeQuestion = {
    content: question?.content || 'Вопрос без содержания',
    type: question?.type || 'single',
    options: Array.isArray(question?.options) ? question.options : [],
    image: question?.image || null,
    points: question?.points || 1,
    correctAnswer: question?.correctAnswer || ''
  };
  
  const handleOptionSelect = (index) => {
    if (safeQuestion.type === 'single') {
      setSelectedOptions([index]);
    } else if (safeQuestion.type === 'multiple') {
      if (selectedOptions.includes(index)) {
        setSelectedOptions(selectedOptions.filter(i => i !== index));
      } else {
        setSelectedOptions([...selectedOptions, index]);
      }
    }
  };
  
  const handleSubmit = () => {
    setSubmitted(true);
  };
  
  const isCorrect = () => {
    if (safeQuestion.type === 'text') {
      // Для текстовых ответов просто показываем правильный ответ
      return null;
    }
    
    if (safeQuestion.type === 'single') {
      const correctOptionIndex = safeQuestion.options.findIndex(option => option.isCorrect);
      return selectedOptions[0] === correctOptionIndex;
    }
    
    // Для multiple проверяем, что все выбранные правильные и не выбраны неправильные
    const selectedCorrectly = selectedOptions.every(index => 
      safeQuestion.options[index] && safeQuestion.options[index].isCorrect
    );
    
    const allCorrectSelected = safeQuestion.options
      .map((option, index) => option.isCorrect ? index : -1)
      .filter(index => index !== -1)
      .every(correctIndex => selectedOptions.includes(correctIndex));
      
    return selectedCorrectly && allCorrectSelected;
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Предпросмотр вопроса</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Clock size={20} className="mr-2 text-blue-600" />
              <span className="text-sm text-gray-500">Вопрос в режиме предпросмотра</span>
            </div>
            <div className="flex items-center">
              <Award size={20} className="mr-2 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-700">
                {safeQuestion.points} {safeQuestion.points === 1 ? 'балл' : 
                safeQuestion.points > 1 && safeQuestion.points < 5 ? 'балла' : 'баллов'}
              </span>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-medium text-gray-800 mb-3">{safeQuestion.content}</h2>
            
            {safeQuestion.image && (
              <div className="mb-4">
                <img
                  src={typeof safeQuestion.image === 'string' ? safeQuestion.image : URL.createObjectURL(safeQuestion.image)}
                  alt="Изображение к вопросу"
                  className="rounded-lg max-h-60 object-contain"
                />
              </div>
            )}
            
            <div className="mt-6">
              {safeQuestion.type === 'text' ? (
                <div>
                  <textarea
                    disabled={submitted}
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Введите ответ..."
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {safeQuestion.options.map((option, index) => (
                    <div
                      key={index}
                      onClick={() => !submitted && handleOptionSelect(index)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedOptions.includes(index)
                          ? submitted
                            ? option.isCorrect
                              ? 'bg-green-100 border-green-500'
                              : 'bg-red-100 border-red-500'
                            : 'bg-blue-100 border-blue-500'
                          : submitted && option.isCorrect
                          ? 'bg-green-50 border-green-500'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="mr-3">
                          {safeQuestion.type === 'single' ? (
                            <div className={`w-5 h-5 rounded-full border ${
                              selectedOptions.includes(index)
                                ? submitted
                                  ? option.isCorrect
                                    ? 'border-green-500 bg-green-500'
                                    : 'border-red-500 bg-red-500'
                                  : 'border-blue-500 bg-blue-500'
                                : submitted && option.isCorrect
                                ? 'border-green-500'
                                : 'border-gray-300'
                            } flex items-center justify-center`}>
                              {selectedOptions.includes(index) && (
                                <Check size={12} className="text-white" />
                              )}
                            </div>
                          ) : (
                            <div className={`w-5 h-5 rounded border ${
                              selectedOptions.includes(index)
                                ? submitted
                                  ? option.isCorrect
                                    ? 'border-green-500 bg-green-500'
                                    : 'border-red-500 bg-red-500'
                                  : 'border-blue-500 bg-blue-500'
                                : submitted && option.isCorrect
                                ? 'border-green-500'
                                : 'border-gray-300'
                            } flex items-center justify-center`}>
                              {selectedOptions.includes(index) && (
                                <Check size={12} className="text-white" />
                              )}
                            </div>
                          )}
                        </div>
                        <span className={`${
                          submitted && (
                            (selectedOptions.includes(index) && option.isCorrect) ||
                            (!selectedOptions.includes(index) && option.isCorrect)
                          ) ? 'font-medium text-green-700' : 
                          submitted && selectedOptions.includes(index) && !option.isCorrect 
                            ? 'font-medium text-red-700' 
                            : 'text-gray-700'
                        }`}>
                          {option.content}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {submitted ? (
            <div className={`p-4 rounded-lg ${
              isCorrect() === true 
                ? 'bg-green-100 text-green-800' 
                : isCorrect() === false 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-blue-100 text-blue-800'
            }`}>
              {isCorrect() === true ? (
                <div className="flex items-center">
                  <Check size={20} className="mr-2" />
                  <span>Правильно!</span>
                </div>
              ) : isCorrect() === false ? (
                <div>
                  <div className="flex items-center mb-2">
                    <X size={20} className="mr-2" />
                    <span>Неправильно</span>
                  </div>
                  <div className="text-sm mt-1">
                    {safeQuestion.type === 'single' && 'Правильный ответ: ' + 
                      safeQuestion.options.find(option => option.isCorrect)?.content || 'Не указан'}
                      
                    {safeQuestion.type === 'multiple' && (
                      <div>
                        <span>Правильные ответы:</span>
                        <ul className="list-disc ml-5 mt-1">
                          {safeQuestion.options
                            .filter(option => option.isCorrect)
                            .map((option, i) => (
                              <li key={i}>{option.content}</li>
                            ))
                          }
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center mb-2">
                    <Check size={20} className="mr-2" />
                    <span>Ответ принят</span>
                  </div>
                  
                  <div className="text-sm">
                    <p>Пример правильного ответа: {safeQuestion.correctAnswer || "Правильный ответ"}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                disabled={
                  (safeQuestion.type !== 'text' && selectedOptions.length === 0) ||
                  (safeQuestion.type === 'text' && !textAnswer.trim())
                }
              >
                <Check size={20} className="mr-2" />
                Проверить ответ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionPreview; 