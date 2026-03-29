<template>
  <div class="kanban">
    <div class="kanban__header">
      <div class="kanban__info">
        <h2 class="kanban__title">{{ boardName }}</h2>
        <div class="kanban__stats">
          <span class="kanban__stat">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path
                d="M2 4H14M2 8H14M2 12H10"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
            Статусов: {{ columns.length }}
          </span>
          <span class="kanban__stat">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path
                d="M8 1V3M8 13V15M3 8H1M15 8H13M13.0711 2.92893L11.6569 4.34314M4.34315 11.6569L2.92893 13.0711M13.0711 13.0711L11.6569 11.6569M4.34315 4.34315L2.92893 2.92893"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
            Задач: {{ totalTasks }}
          </span>
        </div>
      </div>
    </div>

    <div class="kanban__columns" ref="columnsContainer">
      <div v-if="isLoading" class="kanban__loading">
        <div class="kanban__spinner"></div>
        <p>Загрузка задач...</p>
      </div>

      <template v-else>
        <TheColumn
          v-for="column in columns"
          :key="column.status.id"
          :status="column"
          :board-id="boardId"
        />

        <div class="kanban__add-column">
          <button
            v-if="showAddColumnForm === false"
            class="kanban__add-column-btn"
            @click="showAddColumnForm = true"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 4V20M4 12H20"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            <span>Добавить статус</span>
          </button>

          <form v-else @submit.prevent="addColumn" class="kanban__add-column-form">
            <input v-model="newColumnName" placeholder="Введите название..." minlength="5" />
            <button type="submit">Сохранить</button>
          </form>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTodoStore } from '@/stores/todo.store'
import TheColumn from './TheColumn.vue'

const todoStore = useTodoStore()

const props = defineProps({
  boardId: {
    type: [String, Number],
    required: true
  },
  showFilters: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'create-task',
  'edit-task',
  'delete-task',
  'move-task',
  'create-column',
  'edit-column',
  'delete-column',
  'reorder-columns',
  'search',
  'filter'
])

const isLoading = ref(false)
const showAddColumnForm = ref(false)
const newColumnName = ref('')

const board = computed(() => todoStore.getBoardById(props.boardId))
const boardName = computed(() => board.value?.name || 'Доска')

const columns = computed(() => todoStore.tasks || [])
const totalTasks = computed(() => {
  let taskCount = 0
  columns.value.forEach((col) => (taskCount += col.tasks.length))
  return taskCount
})

const handleDeleteTask = async (taskId) => {
  try {
    await todoStore.deleteTask(props.boardId, taskId)
    showNotification('Задача удалена', 'success')
  } catch (error) {
    showNotification('Ошибка удаления задачи', 'error')
  }
}

const addColumn = async () => {
  await todoStore.addStatusToBoard(props.boardId, newColumnName.value)

  newColumnName.value = ''
  showAddColumnForm.value = false
}

onMounted(async () => {
  await loadBoardData()
})

const loadBoardData = async () => {
  try {
    isLoading.value = true
    await todoStore.getTasksForBoard(props.boardId)
  } catch (error) {
    console.error('Ошибка загрузки данных доски:', error)
    showNotification('Ошибка загрузки данных доски', 'error')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.kanban {
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
}

/* Заголовок */
.kanban__header {
  background: white;
  padding: 20px 30px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.kanban__info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.kanban__title {
  margin: 0;
  color: #1c0e5e;
  font-size: 24px;
  font-weight: 600;
}

.kanban__stats {
  display: flex;
  gap: 20px;
}

.kanban__stat {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.kanban__stat svg {
  color: #6c63ff;
}

.kanban__controls {
  display: flex;
  align-items: center;
  gap: 20px;
}

.kanban__filters {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8f9fa;
  padding: 8px;
  border-radius: 8px;
}

.kanban__filter-select {
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: white;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  min-width: 140px;
}

.kanban__filter-select:focus {
  outline: none;
  border-color: #6c63ff;
}

.kanban__search-input {
  padding: 8px 12px 8px 35px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: white;
  color: #333;
  font-size: 14px;
  width: 200px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='%23666'%3E%3Cpath d='M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: 12px center;
  background-size: 16px;
}

.kanban__search-input::placeholder {
  color: #999;
}

.kanban__search-input:focus {
  outline: none;
  border-color: #6c63ff;
}

.kanban__filter-btn {
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: white;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  transition: all 0.3s;
}

.kanban__filter-btn:hover {
  border-color: #6c63ff;
  color: #6c63ff;
}

.kanban__filter-btn.active {
  border-color: #6c63ff;
  background: #6c63ff;
  color: white;
}

.kanban__filter-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff4757;
  color: white;
  font-size: 12px;
  font-weight: 600;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kanban__actions {
  display: flex;
  gap: 10px;
}

.kanban__action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: white;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.kanban__action-btn:hover {
  border-color: #6c63ff;
  color: #6c63ff;
}

.kanban__action-btn--primary {
  background: #6c63ff;
  border-color: #6c63ff;
  color: white;
}

.kanban__action-btn--primary:hover {
  background: #5a52e0;
  border-color: #5a52e0;
  color: white;
}

.kanban__action-btn--secondary {
  background: #f8f9fa;
  border-color: #dee2e6;
}

.kanban__action-btn--secondary:hover {
  background: #e9ecef;
  border-color: #ced4da;
}

.kanban__columns {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  min-height: 500px;
  width: 100%;
  place-content: stretch;
}

/* Загрузка */
.kanban__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  gap: 20px;
}

.kanban__spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e9ecef;
  border-top: 4px solid #6c63ff;
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

.kanban__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  gap: 20px;
  text-align: center;
  color: #666;
}

.kanban__empty h3 {
  margin: 0;
  color: #333;
  font-size: 20px;
  font-weight: 600;
}

.kanban__empty p {
  margin: 0;
  max-width: 400px;
  line-height: 1.5;
}

.kanban__empty-btn {
  padding: 12px 24px;
  background: #6c63ff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.3s;
}

.kanban__empty-btn:hover {
  background: #5a52e0;
}

.kanban__add-column {
  min-width: 280px;
  flex-shrink: 0;
}

.kanban__add-column-btn {
  width: 100%;
  height: 100%;
  min-height: 500px;
  border: 2px dashed #dee2e6;
  border-radius: 12px;
  background: rgba(248, 249, 250, 0.5);
  color: #666;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.3s;
}

.kanban__add-column-btn:hover {
  border-color: #6c63ff;
  background: rgba(108, 99, 255, 0.05);
  color: #6c63ff;
}

.kanban__add-column-btn svg {
  width: 32px;
  height: 32px;
  color: inherit;
}

.kanban__add-column-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  height: 100%;
  min-height: 500px;
  border: 2px dashed #dee2e6;
  border-radius: 12px;
  background: rgba(248, 249, 250, 0.5);
  padding: 1rem;
}

.kanban__add-column-form button {
  width: 100%;
  font-size: 1rem;
  border-radius: 12px;
  background: #6c63ff;
  border: none;
  padding: 1rem;
}

.kanban__quick-view-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.kanban__quick-view {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
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

.kanban__notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 8px;
  color: white;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  z-index: 1001;
  display: flex;
  align-items: center;
  gap: 15px;
  animation: slideIn 0.3s ease;
}

.kanban__notification.success {
  background: #28a745;
}

.kanban__notification.error {
  background: #dc3545;
}

.kanban__notification-close {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.kanban__notification-close:hover {
  background: rgba(255, 255, 255, 0.2);
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

@media (max-width: 1200px) {
  .kanban__header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .kanban__controls {
    flex-direction: column;
    align-items: stretch;
  }

  .kanban__filters {
    justify-content: space-between;
  }

  .kanban__search-input {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .kanban {
    height: auto;
    min-height: calc(100vh - 120px);
  }

  .kanban__header {
    padding: 15px;
  }

  .kanban__columns-container {
    padding: 15px;
  }

  .kanban__stats {
    flex-wrap: wrap;
    gap: 10px;
  }

  .kanban__filters {
    flex-wrap: wrap;
  }

  .kanban__search-input {
    width: 100%;
  }

  .kanban__actions {
    flex-wrap: wrap;
  }

  .kanban__action-btn span {
    display: none;
  }

  .kanban__action-btn {
    padding: 10px;
  }

  .kanban__columns {
    flex-direction: column;
  }

  .kanban__columns-wrapper {
    flex-direction: column;
  }

  .kanban__add-column {
    min-width: auto;
  }

  .kanban__add-column-btn {
    min-height: 100px;
  }
}
</style>
