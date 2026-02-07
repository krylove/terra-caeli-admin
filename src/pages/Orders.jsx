import { useEffect, useState } from 'react'
import { Eye, Send, Package } from 'lucide-react'
import { api } from '../store/authStore'
import toast from 'react-hot-toast'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [paymentLinkInput, setPaymentLinkInput] = useState('')
  const [trackingInput, setTrackingInput] = useState('')
  const [sendingPaymentLink, setSendingPaymentLink] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders')
      setOrders(data.data || [])
    } catch (error) {
      toast.error('Ошибка загрузки заказов')
    } finally {
      setLoading(false)
    }
  }

  const openOrder = (order) => {
    setSelectedOrder(order)
    setPaymentLinkInput(order.paymentLink || '')
    setTrackingInput(order.trackingNumber || '')
  }

  const updateStatus = async (orderId, newStatus) => {
    try {
      const body = { orderStatus: newStatus }
      // При смене на "Отправлен" отправляем трек-номер если заполнен
      if (newStatus === 'shipped' && trackingInput.trim()) {
        body.trackingNumber = trackingInput.trim()
      }
      await api.put(`/orders/${orderId}/status`, body)
      toast.success(newStatus === 'shipped' ? 'Заказ отправлен, клиент уведомлён' : 'Статус обновлён')
      fetchOrders()
      setSelectedOrder(null)
    } catch (error) {
      toast.error('Ошибка обновления статуса')
    }
  }

  const updatePaymentStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { paymentStatus: newStatus })
      toast.success(newStatus === 'paid' ? 'Оплата подтверждена' : 'Статус оплаты обновлён')
      fetchOrders()
      setSelectedOrder(null)
    } catch (error) {
      toast.error('Ошибка обновления статуса оплаты')
    }
  }

  const sendPaymentLink = async (orderId) => {
    if (!paymentLinkInput.trim()) {
      toast.error('Вставьте ссылку на оплату')
      return
    }
    setSendingPaymentLink(true)
    try {
      await api.post(`/orders/${orderId}/send-payment-link`, {
        paymentLink: paymentLinkInput.trim()
      })
      toast.success('Ссылка на оплату отправлена клиенту на email')
      fetchOrders()
      setSelectedOrder(null)
    } catch (error) {
      toast.error('Ошибка отправки ссылки')
    } finally {
      setSendingPaymentLink(false)
    }
  }

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

  const getPaymentBadge = (status) => {
    const statusMap = {
      pending: { text: 'Ожидает', class: 'bg-gray-100 text-gray-800' },
      paid: { text: 'Оплачено', class: 'bg-green-100 text-green-800' },
      failed: { text: 'Ошибка', class: 'bg-red-100 text-red-800' },
      refunded: { text: 'Возврат', class: 'bg-orange-100 text-orange-800' },
    }
    const s = statusMap[status] || statusMap.pending
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.class}`}>
        {s.text}
      </span>
    )
  }

  if (loading) {
    return <div className="text-center py-12">Загрузка...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-8">Заказы</h1>

      {orders.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4">Номер заказа</th>
                  <th className="text-left py-3 px-4">Клиент</th>
                  <th className="text-left py-3 px-4">Сумма</th>
                  <th className="text-left py-3 px-4">Статус заказа</th>
                  <th className="text-left py-3 px-4">Оплата</th>
                  <th className="text-left py-3 px-4">Дата</th>
                  <th className="text-left py-3 px-4">Действия</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">
                          {order.customer.firstName} {order.customer.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{order.customer.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      {order.totalAmount.toLocaleString('ru-RU')} ₽
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(order.orderStatus)}</td>
                    <td className="py-3 px-4">{getPaymentBadge(order.paymentStatus)}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => openOrder(order)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card p-12 text-center">
          <p className="text-gray-600">Заказов пока нет</p>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Заказ {selectedOrder.orderNumber}</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-bold mb-2">Информация о клиенте</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm">
                  <p>
                    <strong>Имя:</strong> {selectedOrder.customer.firstName}{' '}
                    {selectedOrder.customer.lastName}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedOrder.customer.email}
                  </p>
                  <p>
                    <strong>Телефон:</strong> {selectedOrder.customer.phone}
                  </p>
                  <p>
                    <strong>Оплата:</strong>{' '}
                    {selectedOrder.paymentMethod === 'cash_courier'
                      ? 'Наличными курьеру'
                      : 'СБП'}
                  </p>
                </div>
              </div>

              {/* Shipping Info */}
              <div>
                <h3 className="font-bold mb-2">Доставка</h3>
                <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
                  <p>
                    <strong>Способ:</strong>{' '}
                    {{ own_courier: 'Курьер по Москве и МО', cdek_pvz: 'СДЭК ПВЗ', cdek_courier: 'СДЭК Курьер', post: 'Почта России' }[selectedOrder.shipping?.method] || selectedOrder.shipping?.method || '—'}
                  </p>
                  <p>{selectedOrder.shipping.address}</p>
                  <p>
                    {selectedOrder.shipping.city}, {selectedOrder.shipping.postalCode}
                  </p>
                  <p>{selectedOrder.shipping.country}</p>
                </div>
              </div>

              {/* Tracking Number */}
              <div>
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Package size={18} />
                  Трек-номер
                </h3>
                <input
                  type="text"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="Введите трек-номер отправления"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Трек-номер будет отправлен клиенту при смене статуса на «Отправлен»
                </p>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-bold mb-2">Товары</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3"
                    >
                      <img
                        src={item.image || '/placeholder.jpg'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} x {item.price.toLocaleString('ru-RU')} ₽
                        </p>
                      </div>
                      <div className="font-bold">
                        {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-4 pt-4 text-right">
                  <p className="text-xl font-bold">
                    Итого: {selectedOrder.totalAmount.toLocaleString('ru-RU')} ₽
                  </p>
                </div>
              </div>

              {/* Payment Link */}
              <div>
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Send size={18} />
                  Ссылка на оплату (СБП)
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={paymentLinkInput}
                    onChange={(e) => setPaymentLinkInput(e.target.value)}
                    placeholder="Вставьте ссылку на оплату из банка"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                  <button
                    onClick={() => sendPaymentLink(selectedOrder._id)}
                    disabled={sendingPaymentLink || !paymentLinkInput.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 whitespace-nowrap"
                  >
                    {sendingPaymentLink ? 'Отправка...' : selectedOrder.paymentLink ? 'Отправить повторно' : 'Отправить клиенту'}
                  </button>
                </div>
                {selectedOrder.paymentLink && (
                  <p className="text-xs text-green-600 mt-1">
                    Ссылка уже отправлена ранее
                  </p>
                )}
              </div>

              {/* Status Update */}
              <div>
                <h3 className="font-bold mb-2">Статус заказа</h3>
                <div className="flex flex-wrap gap-2">
                  {['new', 'processing', 'shipped', 'delivered', 'cancelled'].map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() => updateStatus(selectedOrder._id, status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                          selectedOrder.orderStatus === status
                            ? 'bg-accent text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {getStatusBadge(status).props.children}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Payment Status Update */}
              <div>
                <h3 className="font-bold mb-2">Статус оплаты</h3>
                <div className="flex flex-wrap gap-2">
                  {['pending', 'paid', 'refunded'].map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() => updatePaymentStatus(selectedOrder._id, status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                          selectedOrder.paymentStatus === status
                            ? status === 'paid' ? 'bg-green-600 text-white'
                              : status === 'refunded' ? 'bg-orange-500 text-white'
                              : 'bg-gray-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {getPaymentBadge(status).props.children}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders
