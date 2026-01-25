import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, FolderOpen, LogOut } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const Layout = () => {
  const location = useLocation()
  const { admin, logout } = useAuthStore()

  const navigation = [
    { name: 'Дашборд', href: '/', icon: LayoutDashboard },
    { name: 'Товары', href: '/products', icon: Package },
    { name: 'Заказы', href: '/orders', icon: ShoppingBag },
    { name: 'Категории', href: '/categories', icon: FolderOpen },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-primary">Terra Admin</h1>
          <p className="text-sm text-gray-600 mt-1">Панель управления</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              const Icon = item.icon

              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-accent text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-bold">
              {admin?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-sm">{admin?.username}</p>
              <p className="text-xs text-gray-600">{admin?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors w-full"
          >
            <LogOut size={18} />
            <span>Выйти</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout
