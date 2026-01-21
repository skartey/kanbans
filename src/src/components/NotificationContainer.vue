<template>
  <div class="notifications-container">
    <transition-group name="notification" tag="div">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="['notification', `notification-${notification.type}`]"
        @click="removeNotification(notification.id)"
      >
        <div class="notification-icon">
          <svg
            v-if="notification.type === 'success'"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z"
              stroke="currentColor"
              stroke-width="2"
            />
            <path
              d="M7 10L9 12L13 8"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <svg
            v-if="notification.type === 'error'"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z"
              stroke="currentColor"
              stroke-width="2"
            />
            <path
              d="M10 6V10M10 14V14.01"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          <svg
            v-if="notification.type === 'warning'"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z"
              stroke="currentColor"
              stroke-width="2"
            />
            <path
              d="M10 6V10M10 14V14.01"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          <svg
            v-if="notification.type === 'info'"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z"
              stroke="currentColor"
              stroke-width="2"
            />
            <path
              d="M10 6V10M10 14V14.01"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <div class="notification-content">
          <div class="notification-title">{{ notification.title }}</div>
          <div class="notification-message">{{ notification.message }}</div>
        </div>
        <button class="notification-close" @click.stop="removeNotification(notification.id)">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path
              d="M12 4L4 12M4 4L12 12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'

const notifications = ref([])
let notificationId = 0
let eventHandler = null

const showNotification = (title, message, type = 'info', duration = 5000) => {
  const id = ++notificationId
  const notification = {
    id,
    title,
    message,
    type,
    timeout: setTimeout(() => {
      removeNotification(id)
    }, duration)
  }

  notifications.value.push(notification)

  if (notifications.value.length > 5) {
    const oldest = notifications.value.shift()
    clearTimeout(oldest.timeout)
  }
}

const removeNotification = (id) => {
  const index = notifications.value.findIndex((n) => n.id === id)
  if (index !== -1) {
    clearTimeout(notifications.value[index].timeout)
    notifications.value.splice(index, 1)
  }
}

onUnmounted(() => {
  notifications.value.forEach((notification) => {
    clearTimeout(notification.timeout)
  })
})

defineExpose({ showNotification })

if (!window.$notification) {
  window.$notification = { show: showNotification }
}
</script>

<style scoped>
.notifications-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
}

.notification {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  transition:
    transform 0.3s,
    opacity 0.3s;
  animation: slideIn 0.3s ease;
  border-left: 4px solid transparent;
}

.notification:hover {
  transform: translateX(-5px);
}

.notification-success {
  border-left-color: #28a745;
  background: linear-gradient(to right, rgba(40, 167, 69, 0.1), white);
}

.notification-error {
  border-left-color: #dc3545;
  background: linear-gradient(to right, rgba(220, 53, 69, 0.1), white);
}

.notification-warning {
  border-left-color: #ffc107;
  background: linear-gradient(to right, rgba(255, 193, 7, 0.1), white);
}

.notification-info {
  border-left-color: #17a2b8;
  background: linear-gradient(to right, rgba(23, 162, 184, 0.1), white);
}

.notification-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-success .notification-icon {
  color: #28a745;
}

.notification-error .notification-icon {
  color: #dc3545;
}

.notification-warning .notification-icon {
  color: #ffc107;
}

.notification-info .notification-icon {
  color: #17a2b8;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
  color: #333;
}

.notification-success .notification-title {
  color: #28a745;
}

.notification-error .notification-title {
  color: #dc3545;
}

.notification-warning .notification-title {
  color: #856404;
}

.notification-info .notification-title {
  color: #0c5460;
}

.notification-message {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.notification-close {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.3s;
}

.notification-close:hover {
  background: #f8f9fa;
  color: #666;
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
