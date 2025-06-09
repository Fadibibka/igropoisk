import { useState, useEffect } from 'react';
import axios from 'axios';
import { createPlatformArticle } from '@api/articles/createPlatformArticle';
import {editArticle} from '@api/articles/editArticle'

interface AddArticleProps {
  editArticleId: string | null;
  setEditArticleId: (id: string | null) => void;
  setActiveTab: React.Dispatch<React.SetStateAction<'games' | 'articles' | 'add_article' | 'users' | 'verif'>>
}

export default function Add_article({ editArticleId, setEditArticleId, setActiveTab }: AddArticleProps) {
  const isEditMode = Boolean(editArticleId);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    article_photo: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [existingImage, setExistingImage] = useState('');

  useEffect(() => {
    if (isEditMode && editArticleId) {
      const fetchArticle = async () => {
        try {
          const response = await axios.get(`/api/articles/${editArticleId}`);
          const article = response.data;
          setFormData({
            title: article.title,
            description: article.description,
            content: article.content,
            article_photo: article.article_photo,
          });
          setExistingImage(article.article_photo);
        } catch (error) {
          console.error('Error fetching article:', error);
        }
      };
      fetchArticle();
    }
  }, [editArticleId, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let article_photo = existingImage;

    try {
      if (image) {
        const formData = new FormData();
        formData.append('file', image);

        const uploadRes = await axios.post<{ filename: string }>(
          '/api/uploads/image',
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );

        article_photo = uploadRes.data.filename;
      }

      if (isEditMode && editArticleId) {
        await editArticle({
          article_id: editArticleId,
          title: formData.title,
          description: formData.description,
          content: formData.content,
          article_photo,
        });
      } else {
        await createPlatformArticle({
          title: formData.title,
          description: formData.description,
          content: formData.content,
          article_photo,
        });
      }

      setSubmitted(true);
      setEditArticleId(null);
      setTimeout(() => {
        setActiveTab('articles');
      }, 2000);
    } catch (err) {
      console.error('Error submitting article:', err);
      alert(`Ошибка при ${isEditMode ? 'редактировании' : 'создании'} статьи`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'description' ? value.slice(0, 200) : value
    }));
  };

  return (
    <div className="w-full p-6 bg-purple rounded-2xl shadow-md mt-6">
      <h2 className="text-2xl font-bold mb-6 text-white">
        {isEditMode ? 'Редактировать статью' : 'Написать статью'}
      </h2>

      {submitted ? (
        <div className="p-4 text-green-700 bg-green-100 border border-green-300 rounded-xl">
          Статья {isEditMode ? 'отредактирована' : 'отправлена на верификацию'}. 
          {!isEditMode && ' Ожидайте подтверждения администратора.'}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-medium text-white mb-1">Название статьи</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-white mb-1">Краткое описание</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-xl resize-none"
              rows={3}
              maxLength={200}
              required
            />
            <p className="text-sm text-white text-right">{formData.description.length}/200</p>
          </div>

          <div>
            <label className="block font-medium text-white mb-1 custom-scroll">Текст статьи</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-xl min-h-[200px]"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-white mb-1">Фото для статьи</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="w-1/3 bg-gray rounded-xl p-2"
              required={!isEditMode}
            />
            {existingImage && !image && (
              <div className="mt-2">
                <p className="text-white text-sm">Текущее изображение:</p>
                <img 
                  src={`http://localhost:8000/public/${existingImage}`} 
                  alt="Current article" 
                  className="w-32 h-32 object-cover mt-2"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="bg-gray hover:bg-orange-700 text-white py-3 px-6 rounded-xl"
          >
            {isEditMode ? 'Сохранить изменения' : 'Отправить на верификацию'}
          </button>
        </form>
      )}
    </div>
  );
}