import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const Login = () => {
  const [isRegister, setIsRegister] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)

  const { login, register } = useAuthStore()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = isRegister
        ? await register(formData.username, formData.email, formData.password)
        : await login(formData.username, formData.password)

      if (result.success) {
        toast.success(isRegister ? 'Регистрация успешна!' : 'Вход выполнен!')
      } else {
        toast.error(result.message || 'Ошибка авторизации')
      }
    } catch (error) {
      toast.error('Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="card p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-primary mb-2 text-center">
          Terra Admin
        </h1>
        <p className="text-gray-600 mb-8 text-center">
          {isRegister ? 'Создание первого администратора' : 'Панель управления'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Имя пользователя
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Пароль</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="input-field"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading
              ? 'Загрузка...'
              : isRegister
              ? 'Зарегистрироваться'
              : 'Войти'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-accent hover:underline text-sm"
          >
            {isRegister
              ? 'Уже есть аккаунт? Войти'
              : 'Нет администраторов? Зарегистрировать'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
