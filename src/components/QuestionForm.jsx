import React, { useState } from 'react';
import { Save, Image, Plus, X, Check, HelpCircle } from 'lucide-react';

const QuestionForm = ({ initialData = {}, onSubmit, onCancel, isEdit = false }) => {
  const [questionData, setQuestionData] = useState({
    content: initialData?.content || '',
    type: initialData?.type || 'single',
    options: initialData?.options || [
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
    ],
    image: initialData?.image || null,
    points: initialData?.points || 1,
    ...(initialData || {})
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(initialData?.image ? URL.createObjectURL(initialData.image) : null);

  const questionTypes = [
    { id: 'single', name: 'Один вариант ответа' },
    { id: 'multiple', name: 'Несколько вариантов ответа' },
    { id: 'text', name: 'Текстовый ответ' }
  ];

  const validate = () => {
    const newErrors = {};
    if (!questionData.content.trim()) newErrors.content = 'Текст вопроса обязателен';
    
    if (questionData.type !== 'text') {
      let hasCorrectOption = false;
      let hasEmptyOption = false;
      
      questionData.options.forEach((option, index) => {
        if (!option.content.trim()) {
          hasEmptyOption = true;
        }
        if (option.isCorrect) {
          hasCorrectOption = true;
        }
      });
      
      if (hasEmptyOption) newErrors.options = 'Все варианты ответов должны быть заполнены';
      if (!hasCorrectOption) newErrors.correctOption = 'Выберите хотя бы один правильный ответ';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuestionData({
      ...questionData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const handleOptionChange = (index, field, value) => {
    const updatedOptions = [...questionData.options];
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: value
    };
    
    // Если тип вопроса с одним правильным ответом и пытаемся отметить как правильный
    if (field === 'isCorrect' && value === true && questionData.type === 'single') {
      // Сбрасываем все другие правильные ответы
      updatedOptions.forEach((option, i) => {
        if (i !== index) {
          updatedOptions[i] = { ...updatedOptions[i], isCorrect: false };
        }
      });
    }
    
    setQuestionData({
      ...questionData,
      options: updatedOptions
    });
    
    if (errors.options || errors.correctOption) {
      setErrors({
        ...errors,
        options: null,
        correctOption: null
      });
    }
  };
  
  const addOption = () => {
    setQuestionData({
      ...questionData,
      options: [...questionData.options, { content: '', isCorrect: false }]
    });
  };
  
  const removeOption = (index) => {
    if (questionData.options.length <= 2) {
      setErrors({
        ...errors,
        options: 'Необходимо минимум два варианта ответа'
      });
      return;
    }
    
    const updatedOptions = questionData.options.filter((_, i) => i !== index);
    setQuestionData({
      ...questionData,
      options: updatedOptions
    });
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.match('image.*')) {
      setErrors({
        ...errors,
        image: 'Пожалуйста, выберите изображение'
      });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setErrors({
        ...errors,
        image: 'Размер файла не должен превышать 5MB'
      });
      return;
    }
    
    // Если предыдущий предпросмотр существует - очищаем его URL
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    
    setQuestionData({
      ...questionData,
      image: file
    });
    
    if (errors.image) {
      setErrors({
        ...errors,
        image: null
      });
    }
  };
  
  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    
    setImagePreview(null);
    setQuestionData({
      ...questionData,
      image: null
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(questionData);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex items-center mb-4">
        <HelpCircle size={20} className="mr-2 text-indigo-600" />
        <h2 className="text-xl font-semibold text-gray-800">
          {isEdit ? 'Редактирование вопроса' : 'Новый вопрос'}
        </h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="content">
              Текст вопроса *
            </label>
            <textarea
              id="content"
              name="content"
              value={questionData.content}
              onChange={handleChange}
              rows="2"
              className={`w-full px-4 py-2 border ${errors.content ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Введите текст вопроса"
            />
            {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="type">
              Тип вопроса
            </label>
            <select
              id="type"
              name="type"
              value={questionData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {questionTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="points">
              Баллы за вопрос
            </label>
            <input
              id="points"
              name="points"
              type="number"
              min="1"
              max="10"
              value={questionData.points}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Изображение (необязательно)
            </label>
            <div className="flex items-center mb-2">
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="image"
                className="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <Image size={20} className="mr-2" />
                Выбрать изображение
              </label>
              {imagePreview && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="ml-2 p-2 text-red-600 hover:text-red-800"
                >
                  <X size={20} />
                </button>
              )}
            </div>
            
            {imagePreview && (
              <div className="mt-2 max-w-md">
                <img src={imagePreview} alt="Предпросмотр" className="rounded-lg max-h-60 object-contain" />
              </div>
            )}
            
            {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
          </div>
          
          {questionData.type !== 'text' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Варианты ответов
                </label>
                <button
                  type="button"
                  onClick={addOption}
                  className="inline-flex items-center px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
                >
                  <Plus size={16} className="mr-1" />
                  Добавить вариант
                </button>
              </div>
              
              {errors.options && <p className="mt-1 mb-2 text-sm text-red-600">{errors.options}</p>}
              {errors.correctOption && <p className="mt-1 mb-2 text-sm text-red-600">{errors.correctOption}</p>}
              
              <div className="space-y-3">
                {questionData.options.map((option, index) => (
                  <div key={index} className="flex items-center">
                    <div className="mr-2">
                      <input
                        type={questionData.type === 'single' ? 'radio' : 'checkbox'}
                        checked={option.isCorrect}
                        onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                        name={questionData.type === 'single' ? 'correctOption' : `correctOption-${index}`}
                        className={`h-4 w-4 ${questionData.type === 'single' ? 'rounded-full' : 'rounded'} text-indigo-600 border-gray-300 focus:ring-indigo-500`}
                      />
                    </div>
                    <div className="flex-grow">
                      <input
                        type="text"
                        value={option.content}
                        onChange={(e) => handleOptionChange(index, 'content', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Вариант ответа ${index + 1}`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="ml-2 p-2 text-red-600 hover:text-red-800"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <X size={20} className="mr-2" />
            Отмена
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Check size={20} className="mr-2" />
            {isEdit ? 'Сохранить изменения' : 'Добавить вопрос'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionForm; 