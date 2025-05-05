import React, { useState } from 'react';
import { Save, Info } from 'lucide-react';

const QuizForm = ({ initialValues = {}, categories = [], onSubmit, isEdit = false }) => {
  const [quizData, setQuizData] = useState({
    title: initialValues.title || '',
    description: initialValues.description || '',
    category_id: initialValues.category_id || '',
    category_name: initialValues.category_name || '',
    isPublic: initialValues.isPublic || false,
    ...initialValues
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!quizData.title.trim()) newErrors.title = 'Название викторины обязательно';
    if (!quizData.description.trim()) newErrors.description = 'Описание викторины обязательно';
    if (!quizData.category_id) newErrors.category_id = 'Выберите категорию';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Если меняем категорию, то обновляем и category_name
    if (name === 'category_id' && value) {
      const selectedCategory = categories.find(cat => cat.id === value);
      setQuizData({
        ...quizData,
        category_id: value,
        category_name: selectedCategory ? selectedCategory.name : ''
      });
    } else {
      setQuizData({
        ...quizData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
    
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(quizData);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex items-center mb-4">
        <Info size={20} className="mr-2 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-800">
          {isEdit ? 'Редактирование информации о викторине' : 'Основная информация о викторине'}
        </h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
              Название викторины *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={quizData.title}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Введите название викторины"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
              Описание викторины *
            </label>
            <textarea
              id="description"
              name="description"
              value={quizData.description}
              onChange={handleChange}
              rows="3"
              className={`w-full px-4 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Введите описание викторины"
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category_id">
              Категория *
            </label>
            <select
              id="category_id"
              name="category_id"
              value={quizData.category_id}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${errors.category_id ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white`}
            >
              <option value="">Выберите категорию</option>
              {categories.length > 0 ? (
                categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))
              ) : (
                // Если категорий нет из API, но есть категория в данных - добавляем её для отображения
                quizData.category_name && <option value={quizData.category_id}>{quizData.category_name}</option>
              )}
            </select>
            {errors.category_id && <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>}
          </div>

          <div className="flex items-center">
            <input
              id="isPublic"
              name="isPublic"
              type="checkbox"
              checked={quizData.isPublic}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
              Сделать викторину публичной
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save size={20} className="mr-2" />
            {isEdit ? 'Сохранить изменения' : 'Создать викторину'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizForm; 