<template>
  <div class="task-item" draggable="true" @dragstart="handleDragStart" @dragend="handleDragEnd">
    <div class="task-header">
      <h4 class="task-title">
        {{ task.name }}
      </h4>

      <div class="task-actions">
        <button @click="$emit('edit')" class="btn-action">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
              <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path
                d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
            </g>
          </svg>
        </button>
        <button @click="handleDelete" class="btn-action">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M10 11v6m4-6v6m5-11v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>

    <p v-if="task.description" class="task-description">
      {{ task.description }}
    </p>

    <div v-if="task.plannedCompletionAt" class="task-deadline">
      Дедлайн: {{ formatDate(task.plannedCompletionAt) }}
    </div>
  </div>
</template>

<script setup>
import { useTodoStore } from '@/stores/todo.store'

const props = defineProps({
  task: { type: Object, required: true }
})

const emit = defineEmits(['edit', 'dragstart', 'dragend'])

const handleDragStart = (e) => {
  e.dataTransfer.setData('text/plain', props.task.id)
  emit('dragstart', props.task)
}

const handleDragEnd = () => {
  emit('dragend', props.task)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU')
}

async function handleDelete() {
  await useTodoStore().deleteTask(props.task.boardId, props.task.id)
}
</script>

<style scoped>
.task-item {
  background: #fff;
  border-radius: 10px;
  padding: 12px;
  cursor: grab;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .05);
}

.task-header {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: space-between;
}

.task-title {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 600;
}

.task-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: space-between;
}

.btn-action {
  padding: 0;
  border: none;
  background: none;
  opacity: 0.7;
  cursor: pointer;
  transition: opacity 0.2s ease-in-out;
}

.btn-action:hover {
  opacity: 0.9
}

.task-description {
  margin: 0 0 6px;
  font-size: 13px;
  color: #555;
}

.task-deadline {
  font-size: 12px;
  color: #777;
}
</style>
