<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>Вход в Todo List</h1>
        <p>Управляйте своими задачами эффективно</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            required
            placeholder="Введите email"
            :class="{ error: errors.email }"
            @blur="validateField('email')"
            @input="clearError('email')"
            autocomplete="email"
          />
          <div v-if="errors.email" class="field-error">
            {{ errors.email }}
          </div>
        </div>

        <div class="form-group">
          <label for="password">Пароль</label>
          <div class="password-input">
            <input
              id="password"
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="Введите пароль"
              :class="{ error: errors.password }"
              @blur="validateField('password')"
              @input="clearError('password')"
              autocomplete="current-password"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
              tabindex="-1"
              aria-label="Показать/скрыть пароль"
            >
              {{ showPassword ? '🙈' : '👁' }}
            </button>
          </div>
          <div v-if="errors.password" class="field-error">
            {{ errors.password }}
          </div>
        </div>

        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" v-model="rememberMe" />
            <span>Запомнить меня</span>
          </label>
        </div>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="login-btn"
          :class="{ loading: isSubmitting }"
        >
          <span v-if="isSubmitting"> <span class="spinner"></span> Вход... </span>
          <span v-else>Войти</span>
        </button>

        <div class="divider">
          <span>или</span>
        </div>

        <button type="button" @click="loginAsGuest" class="guest-btn" :disabled="isSubmitting">
          Войти как гость
        </button>

        <div class="register-section">
          <p>Нет аккаунта?</p>
          <router-link to="/register" class="register-link"> Создать аккаунт </router-link>
        </div>
      </form>
    </div>

    <transition name="fade">
      <div v-if="apiError" class="error-toast">
        <div class="error-content">
          <span class="error-icon">⚠️</span>
          <span>{{ apiError }}</span>
          <button @click="apiError = ''" class="close-error" aria-label="Закрыть">&times;</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const formData = reactive({
  email: '',
  password: ''
})

const showPassword = ref(false)
const rememberMe = ref(false)
const isSubmitting = ref(false)
const apiError = ref('')

const errors = reactive({
  email: '',
  password: ''
})

const validateForm = () => {
  let valid = true
  errors.email = ''
  errors.password = ''

  if (!formData.email.trim()) {
    errors.email = 'Email обязателен'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Введите корректный email'
    valid = false
  }

  if (!formData.password.trim()) {
    errors.password = 'Пароль обязателен'
    valid = false
  } else if (formData.password.length < 6) {
    errors.password = 'Пароль должен содержать минимум 6 символов'
    valid = false
  }

  return valid
}

const validateField = (field) => {
  if (field === 'email') {
    errors.email = ''
    if (!formData.email.trim()) {
      errors.email = 'Email обязателен'
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Введите корректный email'
    }
  }

  if (field === 'password') {
    errors.password = ''
    if (!formData.password.trim()) {
      errors.password = 'Пароль обязателен'
      return
    }
    if (formData.password.length < 6) {
      errors.password = 'Пароль должен содержать минимум 6 символов'
    }
  }
}

const clearError = (field) => {
  errors[field] = ''
  apiError.value = ''
}

const handleLogin = async () => {
  if (!validateForm()) {
    return
  }

  try {
    isSubmitting.value = true
    apiError.value = ''

    await authStore.signin({
      email: formData.email,
      password: formData.password
    })

    const redirect = route.query.redirect
    router.push(redirect ?? '/')
  } catch (error) {
    apiError.value = error.response?.data?.cause || 'Ошибка входа'
    formData.password = ''
  } finally {
    isSubmitting.value = false
  }
}

const loginAsGuest = async () => {
  formData.email = 'guest@guest.com'
  formData.password = 'secret'
  await handleLogin()
}

const handleKeyPress = (event) => {
  if (event.key === 'Enter' && !isSubmitting.value) {
    handleLogin()
  }
}

onMounted(async () => {
  window.addEventListener('keypress', handleKeyPress)

  const isAuthentificated = await authStore.restore()
  if (isAuthentificated === true) {
    router.push(route.query.redirect ?? '/')
  }
})

onUnmounted(() => {
  window.removeEventListener('keypress', handleKeyPress)
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 450px;
  overflow: hidden;
}

.login-header {
  padding: 2rem 2rem 1.5rem;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.login-header h1 {
  color: #1c0e5e;
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: 700;
}

.login-header p {
  color: #666;
  margin: 0;
  font-size: 1rem;
}

.login-form {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
  font-size: 0.875rem;
}

.form-group input {
  width: 100%;
  padding: 0.875rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.3s;
  font-family: inherit;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input.error {
  border-color: #dc3545;
}

.form-group input.error:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 4px;
  color: #666;
  z-index: 2;
}

.toggle-password:hover {
  color: #667eea;
}

.field-error {
  color: #dc3545;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.form-options {
  margin-bottom: 1.5rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: #666;
  font-size: 0.875rem;
}

.remember-me input {
  width: auto;
  margin: 0;
}

.login-btn {
  width: 100%;
  padding: 1rem;
  background: #1c0e5e;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.login-btn:hover:not(:disabled) {
  background: #2b1887;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(28, 14, 94, 0.2);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-btn.loading {
  opacity: 0.8;
  cursor: wait;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
  color: #888;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e0e0e0;
}

.divider span {
  padding: 0 1rem;
  font-size: 0.875rem;
}

.guest-btn {
  width: 100%;
  padding: 1rem;
  background: #f8f9fa;
  color: #666;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 1.5rem;
}

.guest-btn:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #1c0e5e;
  color: #1c0e5e;
}

.guest-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.register-section {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.register-section p {
  color: #666;
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
}

.register-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
}

.register-link:hover {
  text-decoration: underline;
}

.error-toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  z-index: 1001;
  border-left: 4px solid #dc3545;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.error-content {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  gap: 1rem;
}

.error-icon {
  font-size: 1.25rem;
}

.close-error {
  background: none;
  border: none;
  color: #888;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-left: 0.5rem;
}

.close-error:hover {
  background: #f8f9fa;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 480px) {
  .login-container {
    border-radius: 16px;
  }

  .login-header {
    padding: 1.5rem 1.5rem 1rem;
  }

  .login-form {
    padding: 1.5rem;
  }

  .error-toast {
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
  }
}
</style>
