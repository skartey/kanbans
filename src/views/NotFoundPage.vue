<template>
  <div class="not-found-page">
    <div class="not-found-container">
      <h1>404</h1>
      <p>Страница не найдена</p>
      <router-link to="/" class="home-link">Вернуться на главную</router-link>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

setTimeout(() => {
  router.push('/')
}, 5000)
</script>

<style scoped>
.not-found-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1C0E5E 0%, #2B1887 100%);
}

.not-found-container {
  text-align: center;
  background: white;
  padding: 50px;
  border-radius: 15px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
}

h1 {
  font-size: 100px;
  color: #1C0E5E;
  margin: 0;
}

p {
  font-size: 20px;
  color: #666;
  margin: 20px 0 30px 0;
}

.home-link {
  display: inline-block;
  padding: 12px 24px;
  background: #1C0E5E;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: background 0.3s;
}

.home-link:hover {
  background: #2B1887;
}
</style>