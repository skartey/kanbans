import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios.client'

export const useTodoStore = defineStore('todo', () => {
  const boards = ref([])
  const tasks = ref([])
  const isLoading = ref(false)

  function getBoardById(boardId) {
    return boards.value.find((board) => board.id === boardId)
  }

  async function getUserBoards(userId) {
    try {
      isLoading.value = true

      const response = await api.get(`/user/${userId}/boards`)

      boards.value = response.data
      return boards.value
    } catch (err) {
      console.error('Ошибка при загрузке досок:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function createBoard(payload, userId) {
    try {
      isLoading.value = true

      await api.post(`/user/${userId}/boards`, {
        formData: {
          name: payload.name,
          description: payload.description
        }
      })

      await getUserBoards(userId)
    } catch (err) {
      console.error(err?.message || 'Ошибка при создании доски')
    } finally {
      isLoading.value = false
    }
  }

  async function getTasksForBoard(boardId) {
    try {
      isLoading.value = true

      const response = await api.get(`/boards/${boardId}/tasks`)

      tasks.value = response.data
      return tasks.value
    } catch (err) {
      console.error(err?.message || 'Ошибка загрузки задач')
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function deleteBoard(boardId, userId) {
    try {
      await api.delete(`/user/${userId}/boards/${boardId}`)
      await getUserBoards(userId)
    } catch (error) {
      console.error(error)
    }
  }

  async function addStatusToBoard(boardId, name) {
    try {
      await api.post(`/boards/${boardId}/statuses`, {
        formData: {
          name
        }
      })
      await getTasksForBoard(boardId)
    } catch (error) {
      console.error(error)
    }
  }

  async function updateStatus(boardId, statusId, name) {
    try {
      await api.put(`/boards/${boardId}/statuses/${statusId}`, {
        formData: {
          name
        }
      })
      await getTasksForBoard(boardId)
    } catch (error) {
      console.error(error)
    }
  }

  async function deleteStatus(boardId, statusId) {
    try {
      await api.delete(`/boards/${boardId}/statuses/${statusId}`)
      await getTasksForBoard(boardId)
    } catch (error) {
      console.error(error)
    }
  }

  async function createTask(boardId, statusId, payload) {
    try {
      await api.post(`/boards/${boardId}/tasks`, {
        formData: {
          statusId,
          name: payload.name,
          description: payload.description,
          plannedCompletionAt: payload.plannedCompletionAt
        }
      })
      await getTasksForBoard(boardId)
    } catch (error) {
      console.error(error)
    }
  }

  async function editTask(boardId, statusId, taskId, payload) {
    try {
      await api.put(`/boards/${boardId}/tasks/${taskId}`, {
        formData: {
          statusId,
          name: payload.name,
          description: payload.description,
          plannedCompletionAt: payload.plannedCompletionAt
        }
      })
      await getTasksForBoard(boardId)
    } catch (error) {
      console.error(error)
    }
  }

  async function deleteTask(boardId, taskId) {
    try {
      await api.delete(`/boards/${boardId}/tasks/${taskId}`)
      await getTasksForBoard(boardId)
    } catch (error) {
      console.error(error)
    }
  }

  async function moveTask(boardId, statusId, taskId) {
    try {
      await api.patch(`/boards/${boardId}/tasks/${taskId}`, {
        formData: {
          statusId
        }
      })
      await getTasksForBoard(boardId)
    } catch (error) {
      console.error(error)
    }
  }

  function clearAll() {
    boards.value = []
    tasks.value = []
  }

  return {
    boards,
    tasks,
    isLoading,
    getBoardById,
    getUserBoards,
    createBoard,
    getTasksForBoard,
    deleteBoard,
    updateStatus,
    addStatusToBoard,
    deleteStatus,
    createTask,
    editTask,
    deleteTask,
    clearAll,
    moveTask
  }
})
