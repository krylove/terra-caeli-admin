import { useEffect, useState } from 'react'
import { Package, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react'
import { api } from '../store/authStore'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        api.get('/products'),
        api.get('/orders'),
      ])

      const products = productsRes.data.data || []
      const orders = ordersRes.data.data || []

      const revenue = orders
        .filter(order => order.paymentStatus === 'paid')
        .reduce((sum, order) => sum + order.totalAmount, 0)

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue: revenue,
        recentOrders: orders.slice(0, 5),
      })
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error)
    }
  }

  const statCards = [
    {
      title: 'Всего товаров',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: 'Всего заказов',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'bg-green-500',
    },
    {
      title: 'Выручка',
      value: `${stats.totalRevenue.toLocaleString('ru-RU')} ₽`,
      icon: DollarSign,
      color: 'bg-yellow-500',
    },
    {
      title: 'Рост',
      value: '+12%',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ]

  const getStatusBadge = (status) => {
    const statusMap = {
      new: { text: 'Новый', class: 'bg-blue-100 text-blue-800' },
      processing: { text: 'В обработке', class: 'bg-yellow-100 text-yellow-800' },
      shipped: { text: 'Отправлен', class: 'bg-purple-100 text-purple-800' },
      delivered: { text: 'Доставлен', class: 'bg-green-100 text-green-800' },
      cancelled: { text: 'Отменен', class: 'bg-red-100 text-red-800' },
    }

    const s = statusMap[status] || statusMap.new
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.class}`}>
        {s.text}
      </span>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-8">Дашборд</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Recent Orders */}
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Последние заказы</h2>

        {stats.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Номер заказа</th>
                  <th className="text-left py-3 px-4">Клиент</th>
                  <th className="text-left py-3 px-4">Сумма</th>
                  <th className="text-left py-3 px-4">Статус</th>
                  <th className="text-left py-3 px-4">Дата</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-4">
                      {order.customer.firstName} {order.customer.lastName}
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      {order.totalAmount.toLocaleString('ru-RU')} ₽
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(order.orderStatus)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">Заказов пока нет</p>
        )}
      </div>
    </div>
  )
}

export default Dashboard
