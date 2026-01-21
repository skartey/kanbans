<template>
  <section
    class="kanban__column"
    :data-column-id="status.status.id"
    @dragover.prevent
    @drop="onDrop"
  >
    <div class="kanban__header">
      <div class="kanban__header-content">
        <template v-if="isEditing === false">
          <h2 class="kanban__title">{{ status.status.name }}</h2>
          <span class="task-count">({{ status.tasks.length }})</span>
        </template>
        <form v-else @submit.prevent="submitEditForm" class="kanban__edit-title">
          <input v-model="statusName" placeholder="Введите название..." minlength="5" />
          <button type="submit" class="board-action-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 6L9 17l-5-5"
              />
            </svg>
          </button>
        </form>
      </div>

      <div v-if="isEditing === false" class="kanban__header-content">
        <button class="add-task-btn" @click="openCreateTask" title="Добавить задачу">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19" stroke="white" stroke-width="2" stroke-linecap="round" />
            <path d="M5 12H19" stroke="white" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>

        <button class="board-action-btn" @click="isEditing = true">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            >
              <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path
                d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"
              />
            </g>
          </svg>
        </button>

        <button class="board-action-btn" @click="handleDelete">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 11v6m4-6v6m5-11v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
            />
          </svg>
        </button>
      </div>
    </div>

    <div class="kanban__list">
      <TaskItem
        v-for="task in status.tasks"
        :key="task.id"
        :task="task"
        draggable="true"
        @edit="handleEditTask(task)"
      />

      <div v-if="status.tasks.length === 0" class="empty-column">
        <p>Задач пока нет</p>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <form
        @submit.prevent="currentOperation === 'create' ? handleCreateTask() : handleEditSubmit()"
        class="modal"
      >
        <div class="modal-header">
          <h3>{{ currentOperation === 'create' ? 'Создать новую' : 'Редактировать' }} задачу</h3>
          <button @click="showModal = false" class="modal-close">×</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label for="taskName">Название задачи <span class="required">*</span></label>
            <input
              id="taskName"
              v-model="formModel.name"
              @keyup.enter="createTask"
              :class="{ error: !formModel.name.trim() }"
              autofocus
              minlength="5"
            />
            <div v-if="!formModel.name.trim()" class="field-error">Введите название задачи</div>
          </div>

          <div class="form-group">
            <label for="taskDescription">Описание <span class="required">*</span></label>
            <textarea
              id="taskDescription"
              v-model="formModel.description"
              placeholder="Краткое описание вашей задачи..."
              rows="3"
              minlength="5"
              maxlength="200"
            ></textarea>
            <div class="char-count">{{ formModel.description.length }}/200</div>
          </div>

          <div class="form-group">
            <label for="taskDate">Плановая дата окончания</label>
            <input id="taskDate" type="date" v-model="formModel.plannedCompletionAt" />
          </div>
        </div>

        <div class="modal-footer">
          <button @click="showModal = false" class="cancel-btn">Отмена</button>
          <button
            type="submit"
            :disabled="formModel.name.trim().length < 5 || formModel.description.trim().length < 5"
            class="confirm-btn"
          >
            <span>{{ currentOperation === 'create' ? 'Создать' : 'Сохранить' }} задачу</span>
          </button>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useTodoStore } from '@/stores/todo.store'
import TaskItem from './TaskItem.vue'

const props = defineProps({
  status: { type: Object, required: true },
  boardId: { type: [Number, String], required: true }
})

const todoStore = useTodoStore()

const isEditing = ref(false)
const statusName = ref(props.status.status.name)

const showModal = ref(false)
const currentOperation = ref('create')
const currentTask = ref(null)

const formModel = reactive({
  name: '',
  description: '',
  plannedCompletionAt: ''
})

function openCreateTask() {
  currentOperation.value = 'create'
  showModal.value = true
}

async function handleCreateTask() {
  await todoStore.createTask(props.boardId, props.status.status.id, {
    ...formModel,
    plannedCompletionAt: formModel.plannedCompletionAt
      ? new Date(formModel.plannedCompletionAt).toISOString()
      : undefined
  })

  Object.assign(formModel, {
    name: '',
    description: '',
    plannedCompletionAt: ''
  })

  showModal.value = false
}

async function submitEditForm() {
  await todoStore.updateStatus(props.boardId, props.status.status.id, statusName.value)
  isEditing.value = false
}

async function handleDelete() {
  await todoStore.deleteStatus(props.boardId, props.status.status.id)
}

function handleEditTask(task) {
  currentOperation.value = 'edit'

  formModel.name = task.name
  formModel.description = task.description
  formModel.plannedCompletionAt = task.plannedCompletionAt.slice(0, 10)

  showModal.value = true
  currentTask.value = task
}

async function handleEditSubmit() {
  await todoStore.editTask(props.boardId, props.status.status.id, currentTask.value.id, {
    ...formModel,
    plannedCompletionAt: formModel.plannedCompletionAt
      ? new Date(formModel.plannedCompletionAt).toISOString()
      : undefined
  })

  Object.assign(formModel, {
    name: '',
    description: '',
    plannedCompletionAt: ''
  })

  showModal.value = false
}

async function onDrop(event) {
  await todoStore.moveTask(
    props.boardId,
    props.status.status.id,
    event.dataTransfer.getData('taskId')
  )
}
</script>

<style scoped>
.kanban__column {
  background: #d5ccff;
  padding: 20px;
  border-radius: 16px;
  width: 100%;
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

.kanban__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.kanban__header-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.kanban__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1c0e5e;
}

.kanban__edit-title {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.task-count {
  font-size: 14px;
  color: #2d41a7;
}

.kanban__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.empty-column {
  text-align: center;
  padding: 40px 20px;
  color: rgba(28, 14, 94, 0.6);
  font-style: italic;
}

.add-task-btn {
  background: #2d41a7;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.board-action-btn {
  background: none;
  border: none;
  margin-left: 8px;
  cursor: pointer;
  transition: opacity 0.2s ease-in-out;
  opacity: 0.8;
}

.board-action-btn:hover {
  opacity: 1;
}
</style>
