import React, { useState } from 'react';
import './InputForm.css';

const InputForm = ({ onGenerate, isLoading }) => {
  const [formData, setFormData] = useState({
    theme: '',
    audience: '',
    style: 'Корпоративный',
    content: '',
    files: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prevState => ({ ...prevState, files: e.target.files }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate(formData);
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="theme">Тема презентации</label>
          <input
            type="text"
            id="theme"
            name="theme"
            value={formData.theme}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="audience">Целевая аудитория</label>
          <input
            type="text"
            id="audience"
            name="audience"
            value={formData.audience}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="style">Стиль</label>
          <select
            id="style"
            name="style"
            value={formData.style}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option>Корпоративный</option>
            <option>Минимализм</option>
            <option>Технологичный</option>
            <option>Креативный</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="content">Контент по слайдам</label>
          <textarea
            id="content"
            name="content"
            rows="10"
            value={formData.content}
            onChange={handleChange}
            placeholder="Слайд 1: Заголовок..."
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="files">Загрузить файлы (PNG, JPG, SVG)</label>
          <input
            type="file"
            id="files"
            name="files"
            multiple
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/svg+xml"
            disabled={isLoading}
          />
        </div>
        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? 'Генерация...' : 'Сгенерировать'}
        </button>
      </form>
    </div>
  );
};

export default InputForm;
