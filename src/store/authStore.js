import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
})

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      admin: null,
      isAuthenticated: false,

      login: async (username, password) => {
        try {
          const { data } = await api.post('/auth/login', { username, password })

          if (data.success) {
            set({
              token: data.token,
              admin: data.admin,
              isAuthenticated: true,
            })

            // Устанавливаем токен для всех запросов
            api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`

            return { success: true }
          }

          return { success: false, message: data.message }
        } catch (error) {
          return {
            success: false,
            message: error.response?.data?.message || 'Ошибка входа',
          }
        }
      },

      register: async (username, email, password) => {
        try {
          const { data } = await api.post('/auth/register', {
            username,
            email,
            password,
          })

          if (data.success) {
            set({
              token: data.token,
              admin: data.admin,
              isAuthenticated: true,
            })

            api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`

            return { success: true }
          }

          return { success: false, message: data.message }
        } catch (error) {
          return {
            success: false,
            message: error.response?.data?.message || 'Ошибка регистрации',
          }
        }
      },

      logout: () => {
        set({
          token: null,
          admin: null,
          isAuthenticated: false,
        })
        delete api.defaults.headers.common['Authorization']
      },

      getApi: () => {
        const token = get().token
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        }
        return api
      },
    }),
    {
      name: 'admin-auth',
    }
  )
)

// Устанавливаем токен при загрузке, если он есть
const token = useAuthStore.getState().token
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export { api }
