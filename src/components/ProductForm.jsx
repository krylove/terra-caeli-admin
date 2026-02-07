import { useState } from 'react'
import { X, Upload } from 'lucide-react'
import { api } from '../store/authStore'
import toast from 'react-hot-toast'

const ProductForm = ({ product, categories, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    category: product?.category?._id || '',
    inStock: product?.inStock !== false,
    featured: product?.featured || false,
    quantity: product?.quantity || 1,
    material: product?.material || 'Керамика ручной работы',
    images: product?.images || [],
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value,
    })
  }

  // Валидация файла перед загрузкой
  const validateFile = (file) => {
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

    if (file.size > maxSize) {
      toast.error(`Файл ${file.name} слишком большой (макс 5MB)`)
      return false
    }
    if (!allowedTypes.includes(file.type)) {
      toast.error(`Файл ${file.name} имеет неподдерживаемый формат. Используйте JPEG, PNG, WebP или GIF`)
      return false
    }
    return true
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Ограничение на количество файлов
    if (files.length > 10) {
      toast.error('Можно загрузить не более 10 изображений за раз')
      return
    }

    // Валидация всех файлов
    const validFiles = files.filter(file => validateFile(file))
    if (validFiles.length === 0) return

    setUploading(true)
    const formDataUpload = new FormData()

    validFiles.forEach((file) => {
      formDataUpload.append('images', file)
    })

    try {
      const { data } = await api.post('/upload/multiple', formDataUpload, {
        timeout: 60000, // 60 секунд для загрузки файлов
      })

      if (data.success) {
        setFormData({
          ...formData,
          images: [...formData.images, ...data.urls],
        })
        toast.success(`Загружено ${validFiles.length} изображений`)
      }
    } catch (error) {
      const errorMsg = error.response?.status === 413
        ? 'Файлы слишком большие'
        : error.response?.status === 415
        ? 'Неподдерживаемый формат файла'
        : 'Ошибка загрузки изображений'
      toast.error(errorMsg)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const dataToSend = {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
      }

      if (product?._id) {
        await api.put(`/products/${product._id}`, dataToSend)
        toast.success('Товар обновлен')
      } else {
        await api.post('/products', dataToSend)
        toast.success('Товар создан')
      }

      onSuccess()
    } catch (error) {
      toast.error('Ошибка сохранения товара')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {product ? 'Редактировать товар' : 'Новый товар'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Название *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Описание *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Цена *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Количество</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Категория *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="">Выберите категорию</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Материал</label>
              <input
                type="text"
                name="material"
                value={formData.material}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="inStock"
                checked={formData.inStock}
                onChange={handleChange}
                className="mr-2"
              />
              <label className="text-sm font-medium">В наличии</label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="mr-2"
              />
              <label className="text-sm font-medium">Избранный товар (показывать на главной)</label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Изображения</label>
            <div className="grid grid-cols-4 gap-4 mb-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            <label className="btn-secondary cursor-pointer inline-flex items-center space-x-2">
              <Upload size={18} />
              <span>{uploading ? 'Загрузка...' : 'Загрузить изображения'}</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading || uploading}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductForm
