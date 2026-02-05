import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Orders from './pages/Orders'
import Categories from './pages/Categories'
import Layout from './components/Layout'

// Компонент защиты маршрутов
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, token } = useAuthStore()

  // Проверяем и авторизацию и наличие токена
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)

  return (
    <Routes>
      {/* Публичный маршрут логина */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <Login />
      } />

      {/* Защищенные маршруты */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="orders" element={<Orders />} />
        <Route path="categories" element={<Categories />} />
      </Route>

      {/* Редирект на логин для неизвестных маршрутов */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
    </Routes>
  )
}

export default App
