import api from '@/api/axios.client.js'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const userId = ref(null)

  const isAuthenticated = computed(() => userId.value !== null)

  async function signin(payload) {
    try {
      const response = await api.post('/auth/signin', {
        formData: {
          email: payload.email,
          password: payload.password
        }
      })

      const token = response.data.token
      const id = response.data.userId

      userId.value = id
      api.defaults.headers.common['X-Base-Auth'] = token

     localStorage.setItem('userId', String(userId.value))
      localStorage.setItem('token', token)
    } catch (error) {
      console.error(error)
    }
  }

  async function signup(payload) {
    try {
      const response = await api.put('/auth/signup', {
        formData: {
          name: payload.name,
          email: payload.email,
          password: payload.password
        }
      })

      if (response.status === 400) {
        return false
      }

      await signin({ email: payload.email, password: payload.password })

      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  function logout() {
    userId.value = null
    delete api.defaults.headers.common['X-Base-Auth']

    localStorage.clear('userId')
    localStorage.clear('token')
  }

  function restore() {
    const storedToken = localStorage.getItem('token')
    const storedUserId = localStorage.getItem('userId')

    if (storedToken && storedUserId) {
      userId.value = Number(storedUserId)
      api.defaults.headers.common['X-Base-Auth'] = storedToken

      return true
    }

    return false
  }

  return {
    userId,
    isAuthenticated,
    signin,
    signup,
    logout,
    restore
  }
})
