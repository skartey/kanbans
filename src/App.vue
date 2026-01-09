<template>
  <NotificationContainer />

  <div v-if="appLoading" class="app-loading">
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <p>Загрузка приложения...</p>
    </div>
  </div>

  <template v-else>
    <the-header />
    <div class="content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </template>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import TheHeader from './components/TheHeader.vue'
import NotificationContainer from '@/components/NotificationContainer.vue'
const appLoading = ref(true)

const authStore = useAuthStore()

async function initApp() {
  authStore.restore()

  setTimeout(() => {
    appLoading.value = false
  }, 300)
}

onMounted(initApp)
</script>

<style>
.content {
  margin-top: 62px;
}

.app-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1c0e5e 0%, #2b1887 100%);
}

.loading-content {
  text-align: center;
  color: white;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
