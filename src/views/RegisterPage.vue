<template>
  <div class="register-page">
    <form class="register-form" @submit.prevent="register">
      <h1>Регистрация</h1>

      <input v-model="name" type="text" placeholder="Имя" />

      <input v-model="email" type="email" placeholder="Email" />

      <input v-model="password" type="password" placeholder="Пароль" />

      <button type="submit" :disabled="loading">
        {{ loading ? 'Регистрация...' : 'Создать аккаунт' }}
      </button>

      <p v-if="error" class="error">{{ error }}</p>

      <router-link to="/login">Уже есть аккаунт</router-link>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function register() {
  if (!name.value || !email.value || !password.value) {
    error.value = 'Заполните все поля'
    return
  }

  try {
    loading.value = true
    error.value = ''

    await authStore.signup({
      name: name.value,
      email: email.value,
      password: password.value
    })

    await authStore.signin({
      email: email.value,
      password: password.value
    })

    router.push('/')
  } catch (e) {
    error.value = e?.response?.data?.cause || e?.response?.data?.message || 'Ошибка регистрации'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1c0e5e 0%, #2b1887 100%);
  padding: 20px;
}

.register-form {
  width: 100%;
  max-width: 450px;
  background: #ffffff;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: slideUp 0.5s ease;
}

.register-form h1 {
  margin: 0 0 10px;
  text-align: center;
  font-size: 28px;
  color: #1c0e5e;
}

.register-form input {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  transition:
    border-color 0.3s,
    box-shadow 0.3s;
}

.register-form input:focus {
  outline: none;
  border-color: #1c0e5e;
  box-shadow: 0 0 0 3px rgba(28, 14, 94, 0.1);
}

.register-form button {
  width: 100%;
  padding: 15px;
  background: #1c0e5e;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.3s,
    transform 0.2s,
    box-shadow 0.2s;
}

.register-form button:hover:not(:disabled) {
  background: #2b1887;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(28, 14, 94, 0.2);
}

.register-form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #dc3545;
  font-size: 13px;
  text-align: center;
}

.register-form a {
  margin-top: 10px;
  text-align: center;
  color: #1c0e5e;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
}

.register-form a:hover {
  text-decoration: underline;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 480px) {
  .register-form {
    padding: 25px;
  }

  .register-form h1 {
    font-size: 24px;
  }
}
</style>
