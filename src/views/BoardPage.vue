<template>
  <div class="board-page">
    <TheHeader
      :board="board"
      @create-task="handleCreateTask"
      @create-status="handleCreateStatus"
      @edit-board="handleEditBoard"
      @delete-board="handleDeleteBoard"
      @go-home="goHome"
    />

    <main class="board-main">
      <div v-if="isLoading" class="loading-container">
        <div class="spinner"></div>
        <p>Загрузка доски...</p>
      </div>

      <div v-else-if="apiError" class="error-container">
        <div class="error-message">
          <h3>Ошибка загрузки</h3>
          <p>{{ apiError }}</p>
          <button @click="goHome" class="home-btn">На главную</button>
        </div>
      </div>

      <TheKanban v-else :boardId="boardId" :key="boardKey" />
    </main>

    <TheFooter />

    <div v-if="notification.show" class="notification" :class="notification.type">
      {{ notification.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTodoStore } from '@/stores/todo.store'
import TheHeader from '@/components/TheHeader.vue'
import TheKanban from '@/components/TheKanban.vue'
import TheFooter from '@/components/TheFooter.vue'

const route = useRoute()
const router = useRouter()
const todoStore = useTodoStore()

const boardId = computed(() => route.params.id);
const isLoading = ref(false)
const apiError = ref('')
const boardKey = ref(0)
const showTaskModal = ref(false)
const modalType = ref('task')

const board = computed(() => todoStore.getBoardById(boardId))


const notification = ref({
  show: false,
  message: '',
  type: 'success'
})

onMounted(() => {
  loadBoardData()
})

watch(
  () => boardId.value,
  () => {
    loadBoardData()
  }
)

const loadBoardData = async () => {
  try {
    isLoading.value = true
    apiError.value = ''

    await todoStore.getTasksForBoard(boardId)
  } catch (error) {
    console.error('Ошибка загрузки доски:', error)
    apiError.value = error.message || 'Не удалось загрузить доску'
  } finally {
    isLoading.value = false
  }
}

const handleCreateTask = () => {
  modalType.value = 'task'
  showTaskModal.value = true
}

const handleCreateStatus = () => {
  modalType.value = 'status'
  showTaskModal.value = true
}

const handleEditBoard = () => {
  modalType.value = 'board'
  showTaskModal.value = true
}

const handleDeleteBoard = async () => {
  if (!confirm(`Удалить доску "${board.value?.name}"? Это действие нельзя отменить.`)) {
    return
  }

  try {
    await todoStore.deleteBoard(boardId)
    showNotification('Доска удалена', 'success')
    router.push('/')
  } catch (error) {
    console.error('Ошибка удаления доски:', error)
    showNotification('Ошибка удаления доски', 'error')
  }
}

const handleTaskSave = async (taskData) => {
  try {
    if (modalType.value === 'task') {
      await todoStore.createTask(boardId, taskData)
      showNotification('Задача создана', 'success')
    } else if (modalType.value === 'status') {
      await todoStore.createStatus(boardId, taskData)
      showNotification('Статус создан', 'success')
    } else if (modalType.value === 'board') {
      await todoStore.updateBoard(boardId, taskData)
      showNotification('Доска обновлена', 'success')
    }

    closeModal()

    await loadBoardData()
  } catch (error) {
    console.error('Ошибка сохранения:', error)
    showNotification(`Ошибка: ${error.message}`, 'error')
  }
}

const closeModal = () => {
  showTaskModal.value = false
}

const goHome = () => {
  router.push('/')
}

const showNotification = (message, type = 'success') => {
  notification.value = {
    show: true,
    message,
    type
  }

  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}
</script>

<style scoped>
.board-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.board-main {
  flex: 1;
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e0e0e0;
  border-top: 4px solid #1c0e5e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.error-message {
  text-align: center;
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.error-message h3 {
  color: #dc3545;
  margin-bottom: 10px;
}

.error-message p {
  color: #666;
  margin-bottom: 20px;
}

.home-btn {
  padding: 10px 20px;
  background: #1c0e5e;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
}

.home-btn:hover {
  background: #2b1887;
}

.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 5px;
  color: white;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.notification.success {
  background: #28a745;
}

.notification.error {
  background: #dc3545;
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
</style>
