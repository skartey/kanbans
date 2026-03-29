<template>
  <div class="home-page">
    <main class="main-content">
      <div v-if="!authStore.isAuthenticated" class="welcome-section">
        <div class="welcome-card">
          <h2>Добро пожаловать в Todo List!</h2>
          <p>Организуйте свои задачи эффективно с помощью удобных досок</p>
          <div class="auth-actions">
            <router-link to="/login" class="auth-btn login-btn"> Войти в систему </router-link>
            <router-link to="/register" class="auth-btn register-btn">
              Создать аккаунт
            </router-link>
          </div>
          <div class="features">
            <div class="feature">
              <span class="feature-icon">📋</span>
              <span>Создавайте доски</span>
            </div>
            <div class="feature">
              <span class="feature-icon">🗂️</span>
              <span>Группируйте задачи</span>
            </div>
            <div class="feature">
              <span class="feature-icon">📊</span>
              <span>Отслеживайте прогресс</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="dashboard">
        <div class="dashboard-header">
          <div class="dashboard-title">
            <h2>Ваши доски</h2>
            <p class="dashboard-subtitle">Создавайте и управляйте своими проектами</p>
          </div>
          <button @click="showCreateBoard = true" class="create-btn">
            <span class="btn-icon">+</span>
            Создать доску
          </button>
        </div>

        <div v-if="todoStore.isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Загружаем ваши доски...</p>
        </div>

        <div v-else-if="!todoStore.boards || todoStore.boards.length === 0" class="empty-state">
          <div class="empty-illustration">📋</div>
          <h3>У вас пока нет досок</h3>
          <p>Создайте свою первую доску для организации задач</p>
          <button @click="showCreateBoard = true" class="create-btn primary">
            Создать первую доску
          </button>
        </div>

        <div v-else class="boards-grid">
          <div
            v-for="board in todoStore.boards || []"
            :key="board?.id"
            class="board-card"
            @click="selectBoard(board)"
            :style="board?.id ? { background: getBoardColor(board.id) } : {}"
          >
            <div class="board-card-header">
              <h3 class="board-title">{{ board?.name || board?.title || 'Без названия' }}</h3>
              <div class="board-actions">
                <button
                  @click.stop="deleteBoard(board.id)"
                  class="delete-board-btn"
                  title="Удалить доску"
                >
                  ×
                </button>
              </div>
            </div>

            <p v-if="board?.description" class="board-description">{{ board.description }}</p>

            <div class="board-footer">
              <span class="board-date">
                {{ formatDate(board?.createdAt || board?.created_at) }}
              </span>
              <span class="board-action" @click.stop="selectBoard(board)"> Открыть → </span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div v-if="showCreateBoard" class="modal-overlay" @click.self="showCreateBoard = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Создать новую доску</h3>
          <button @click="cancelCreateBoard" class="modal-close">×</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label for="boardName">Название доски <span class="required">*</span></label>
            <input
              id="boardName"
              v-model="newBoardData.name"
              placeholder="Например: Рабочие задачи"
              @keyup.enter="createBoard"
              @blur="nameTouched = true"
              :class="{ error: !newBoardData.name.trim() && nameTouched }"
              autofocus
            />
            <div v-if="!newBoardData.name.trim() && nameTouched" class="field-error">
              Введите название доски
            </div>
          </div>

          <div class="form-group">
            <label for="boardDescription">Описание</label>
            <textarea
              id="boardDescription"
              v-model="newBoardData.description"
              placeholder="Краткое описание вашей доски..."
              rows="3"
              maxlength="200"
            ></textarea>
            <div class="char-count">{{ newBoardData.description.length }}/200</div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="cancelCreateBoard" class="cancel-btn">Отмена</button>
          <button
            @click="createBoard"
            :disabled="!newBoardData.name.trim() || isCreating"
            class="confirm-btn"
            :class="{ loading: isCreating }"
          >
            <span v-if="isCreating" class="spinner"></span>
            <span>{{ isCreating ? 'Создание...' : 'Создать доску' }}</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="cancelDelete">
      <div class="modal delete-modal">
        <div class="modal-header">
          <h3>Удалить доску?</h3>
        </div>

        <div class="modal-body">
          <div class="warning-icon">⚠️</div>
          <p>
            Вы уверены, что хотите удалить доску
            <strong>"{{ boardToDelete?.name || boardToDelete?.title || '' }}"</strong>?
          </p>
          <p class="warning-text">
            Это действие нельзя отменить. Все задачи и статусы будут удалены.
          </p>
        </div>

        <div class="modal-footer">
          <button @click="cancelDelete" class="cancel-btn">Отмена</button>
          <button
            @click="confirmDeleteBoard"
            :disabled="isDeleting"
            class="delete-confirm-btn"
            :class="{ loading: isDeleting }"
          >
            <span v-if="isDeleting" class="spinner"></span>
            <span>{{ isDeleting ? 'Удаление...' : 'Удалить' }}</span>
          </button>
        </div>
      </div>
    </div>

    <transition name="fade">
      <div v-if="notification.show" class="notification-toast" :class="notification.type">
        <div class="toast-content">
          <span class="toast-icon">
            {{ notification.type === 'success' ? '✓' : '✗' }}
          </span>
          <span class="toast-message">{{ notification.message }}</span>
          <button @click="notification.show = false" class="toast-close">×</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useTodoStore } from '@/stores/todo.store'
import TheHeader from '@/components/TheHeader.vue'

const router = useRouter()
const authStore = useAuthStore()
const todoStore = useTodoStore()

const showCreateBoard = ref(false)
const showDeleteConfirm = ref(false)
const boardToDelete = ref(null)
const isCreating = ref(false)
const isDeleting = ref(false)
const nameTouched = ref(false)

const newBoardData = reactive({
  name: '',
  description: ''
})

const notification = reactive({
  show: false,
  message: '',
  type: 'success'
})

const getInitials = (name) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const getBoardColor = (id) => {
  const colors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)'
  ]
  return colors[id % colors.length]
}

const loadUserBoards = async () => {
  if (!authStore.userId) {
    console.warn('Нет ID пользователя для загрузки досок')
    return
  }

  try {
    await todoStore.getUserBoards(authStore.userId)
  } catch (error) {
    console.error('Ошибка загрузки досок в HomePage:', error)
    showNotification('Ошибка загрузки досок', 'error')
  }
}

const createBoard = async () => {
  if (!newBoardData.name.trim()) {
    nameTouched.value = true
    showNotification('Введите название доски', 'error')
    return
  }

  if (!authStore.userId) {
    showNotification('Пользователь не найден', 'error')
    return
  }

  try {
    isCreating.value = true

    const boardData = {
      name: newBoardData.name.trim(),
      description: newBoardData.description.trim() || undefined
    }

    await todoStore.createBoard(boardData, authStore.userId)

    showNotification('Доска успешно создана!', 'success')
    resetCreateForm()
    showCreateBoard.value = false

    await loadUserBoards()
  } catch (error) {
    console.error('Ошибка создания доски:', error)
    showNotification('Ошибка создания доски', 'error')
  } finally {
    isCreating.value = false
  }
}

const deleteBoard = (boardId) => {
  const board = todoStore.getBoardById(boardId)
  if (!board) return

  boardToDelete.value = board
  showDeleteConfirm.value = true
}

const confirmDeleteBoard = async () => {
  if (!boardToDelete.value?.id) return

  try {
    isDeleting.value = true

    await todoStore.deleteBoard(boardToDelete.value.id, authStore.userId)

    showNotification('Доска удалена', 'success')
    cancelDelete()

    await loadUserBoards()
  } catch (error) {
    console.error('Ошибка удаления доски:', error)
    showNotification('Ошибка удаления доски', 'error')
  } finally {
    isDeleting.value = false
  }
}

const cancelDelete = () => {
  boardToDelete.value = null
  showDeleteConfirm.value = false
}

const selectBoard = (board) => {
  if (!board?.id) return
  router.push(`/board/${board.id}`)
}

const formatDate = (dateString) => {
  if (!dateString) return 'Не указано'

  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return 'Сегодня'
    } else if (diffDays === 1) {
      return 'Вчера'
    } else if (diffDays < 7) {
      return `${diffDays} дня назад`
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
  } catch (e) {
    return 'Неизвестно'
  }
}

const resetCreateForm = () => {
  newBoardData.name = ''
  newBoardData.description = ''
  nameTouched.value = false
}

const cancelCreateBoard = () => {
  showCreateBoard.value = false
  resetCreateForm()
}

const showNotification = (message, type = 'success') => {
  notification.message = message
  notification.type = type
  notification.show = true

  setTimeout(() => {
    notification.show = false
  }, 3000)
}

const handleLogout = async () => {
  try {
    authStore.logout()
    showNotification('Вы успешно вышли', 'success')

    router.push('/login')
  } catch (error) {
    console.error('Ошибка при выходе:', error)
    showNotification('Ошибка при выходе', 'error')
  }
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    loadUserBoards()
  } else {
    router.push('/login')
  }
})
</script>

<style scoped>
.home-page {
  padding-top: 8px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
}

.main-content {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
}

.welcome-section {
  animation: slideUp 0.5s ease;
}

.welcome-card {
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.welcome-card h2 {
  color: #1c0e5e;
  margin-bottom: 1rem;
  font-size: 2rem;
}

.welcome-card p {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.auth-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
}

.auth-btn {
  padding: 1rem 2rem;
  border-radius: 10px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
  border: 2px solid;
}

.login-btn {
  background: #1c0e5e;
  color: white;
  border-color: #1c0e5e;
}

.login-btn:hover {
  background: #2b1887;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(28, 14, 94, 0.2);
}

.register-btn {
  background: white;
  color: #1c0e5e;
  border-color: #1c0e5e;
}

.register-btn:hover {
  background: #f8f9fa;
  transform: translateY(-2px);
}

.features {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.feature {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #f8f9fa;
  border-radius: 10px;
  color: #333;
}

.feature-icon {
  font-size: 1.25rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  animation: slideUp 0.5s ease 0.2s both;
}

.dashboard-title h2 {
  color: #1c0e5e;
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
}

.dashboard-subtitle {
  color: #666;
  margin: 0;
}

.create-btn {
  padding: 0.875rem 1.5rem;
  background: #1c0e5e;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.create-btn:hover:not(:disabled) {
  background: #2b1887;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(28, 14, 94, 0.2);
}

.create-btn.primary {
  background: #4caf50;
}

.create-btn.primary:hover {
  background: #388e3c;
}

.btn-icon {
  font-size: 1.25rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(28, 14, 94, 0.1);
  border-radius: 50%;
  border-top-color: #1c0e5e;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.5s ease 0.4s both;
}

.empty-illustration {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #1c0e5e;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #666;
  margin-bottom: 2rem;
}

.boards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  animation: slideUp 0.5s ease 0.6s both;
}

.board-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  border: none;
}

.board-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.board-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.board-title {
  margin: 0;
  color: #1c0e5e;
  font-size: 1.25rem;
  font-weight: 600;
  flex: 1;
}

.delete-board-btn {
  background: rgba(220, 53, 69, 0.1);
  border: none;
  color: #dc3545;
  font-size: 1.5rem;
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.delete-board-btn:hover {
  background: #dc3545;
  color: white;
}

.board-description {
  color: #666;
  margin: 1rem 0;
  line-height: 1.5;
  font-size: 0.95rem;
}

.board-stats {
  display: flex;
  gap: 1rem;
  margin: 1.5rem 0;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f8f9fa;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
}

.stat-icon {
  font-size: 1rem;
}

.stat-label {
  color: #333;
}

.board-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.board-date {
  color: #888;
  font-size: 0.75rem;
}

.board-action {
  color: #1c0e5e;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: color 0.3s;
}

.board-action:hover {
  color: #2b1887;
}

.notification-toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  z-index: 1001;
  overflow: hidden;
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

.notification-toast.success {
  border-left: 4px solid #4caf50;
}

.notification-toast.error {
  border-left: 4px solid #dc3545;
}

.toast-content {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  gap: 1rem;
}

.toast-icon {
  font-size: 1.25rem;
  font-weight: bold;
}

.notification-toast.success .toast-icon {
  color: #4caf50;
}

.notification-toast.error .toast-icon {
  color: #dc3545;
}

.toast-message {
  color: #333;
  font-weight: 500;
  flex: 1;
}

.toast-close {
  background: none;
  border: none;
  color: #888;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.toast-close:hover {
  background: #f8f9fa;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .user-info {
    width: 100%;
    justify-content: center;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .boards-grid {
    grid-template-columns: 1fr;
  }

  .auth-actions {
    flex-direction: column;
  }

  .features {
    flex-direction: column;
    align-items: center;
  }

  .modal {
    width: 95%;
    margin: 1rem;
  }

  .modal-footer {
    flex-direction: column;
  }

  .cancel-btn,
  .confirm-btn,
  .delete-confirm-btn {
    width: 100%;
  }
}
</style>
