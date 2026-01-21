<template>
  <div class="profile-page">
    <div class="profile-container">
      <h1>Профиль</h1>
      <div class="profile-content">
        <div class="profile-info">
          <div class="profile-avatar">
            {{ userInitials }}
          </div>
          <div class="profile-details">
            <h2>{{ userName }}</h2>
            <p class="profile-email">{{ userEmail }}</p>
          </div>
        </div>

        <div class="profile-stats">
          <div class="stat-card">
            <h3>Досок</h3>
            <p class="stat-number">{{ boardsCount }}</p>
          </div>
          <div class="stat-card">
            <h3>Задач</h3>
            <p class="stat-number">{{ tasksCount }}</p>
          </div>
          <div class="stat-card">
            <h3>Активность</h3>
            <p class="stat-number">{{ lastActivity }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'

const auth = useAuth()

const userInitials = computed(() => auth.userInitials)
const userName = computed(() => auth.user?.name || 'Пользователь')
const userEmail = computed(() => auth.user?.email || 'Не указан')
const boardsCount = computed(() => 0)
const tasksCount = computed(() => 0)
const lastActivity = computed(() => 'Сегодня')
</script>

<style scoped>
.profile-page {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.profile-container {
  background: white;
  border-radius: 15px;
  padding: 40px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

h1 {
  color: #1c0e5e;
  margin-bottom: 30px;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 30px;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6c63ff, #1c0e5e);
  color: white;
  font-size: 36px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-details h2 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 28px;
}

.profile-email {
  color: #666;
  font-size: 16px;
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 12px;
  text-align: center;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-card h3 {
  margin: 0 0 15px 0;
  color: #666;
  font-size: 16px;
  font-weight: 500;
}

.stat-number {
  margin: 0;
  font-size: 32px;
  font-weight: bold;
  color: #1c0e5e;
}

@media (max-width: 768px) {
  .profile-info {
    flex-direction: column;
    text-align: center;
  }

  .profile-stats {
    grid-template-columns: 1fr;
  }
}
</style>
