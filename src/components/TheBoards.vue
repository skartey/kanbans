<template>
  <div class="boards-container">
    <div class="boards-header">
      <div class="boards-title-section">
        <h2 class="boards-title">Доски</h2>
        <div class="boards-stats">
          <span class="stat">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 4H14M2 8H14M2 12H8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            Всего: {{ boards.length }}
          </span>
          <span class="stat">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M13 8H3M13 12H8M8 2V4M6 2H10M4 8H2V14H14V8H12" 
                    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Активных: {{ activeBoardsCount }}
          </span>
          <span class="stat">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2V14M2 8H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            Задач: {{ totalTasks }}
          </span>
        </div>
      </div>
      
      <div class="boards-controls">
        <div class="boards-search">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск досок..."
            class="search-input"
            @input="handleSearch"
          />
          <svg class="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
          </svg>
        </div>
        <div class="boards-sort">
          <select v-model="sortBy" @change="applySorting" class="sort-select">
            <option value="updatedAt">По дате обновления</option>
            <option value="createdAt">По дате создания</option>
            <option value="name">По названию</option>
            <option value="taskCount">По количеству задач</option>
          </select>
        </div>
        <div class="boards-view">
          <button
            @click="viewMode = 'grid'"
            :class="['view-btn', { active: viewMode === 'grid' }]"
            title="Сетка"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/>
              <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/>
              <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/>
              <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </button>
          <button
            @click="viewMode = 'list'"
            :class="['view-btn', { active: viewMode === 'list' }]"
            title="Список"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="1" width="14" height="3" rx="1" stroke="currentColor" stroke-width="1.5"/>
              <rect x="1" y="6" width="14" height="3" rx="1" stroke="currentColor" stroke-width="1.5"/>
              <rect x="1" y="11" width="14" height="3" rx="1" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </button>
        </div>
        <div class="boards-filter">
          <button
            @click="toggleFilters"
            :class="['filter-btn', { active: showFilters }]"
            title="Фильтры"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M15 1H1L6.5 8.345V13.25L9.5 14.75V8.345L15 1Z" 
                    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span v-if="activeFiltersCount" class="filter-badge">
              {{ activeFiltersCount }}
            </span>
          </button>
        </div>
        <button @click="handleCreateBoard" class="create-board-btn">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 4V16M4 10H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span>Новая доска</span>
        </button>
      </div>
    </div>
    <div v-if="showFilters" class="filters-panel">
      <div class="filters-content">
        <h3>Фильтры</h3>
        <div class="filters-grid">
          <div class="filter-group">
            <label>По типу</label>
            <select v-model="filters.type" @change="applyFilters">
              <option value="">Все доски</option>
              <option value="personal">Личные</option>
              <option value="team">Командные</option>
              <option value="project">Проектные</option>
            </select>
          </div>
          <div class="filter-group">
            <label>По активности</label>
            <select v-model="filters.activity" @change="applyFilters">
              <option value="">Все</option>
              <option value="active">Активные</option>
              <option value="archived">Архивные</option>
            </select>
          </div>
          <div class="filter-group">
            <label>По дате создания</label>
            <select v-model="filters.dateRange" @change="applyFilters">
              <option value="">Все время</option>
              <option value="week">За неделю</option>
              <option value="month">За месяц</option>
              <option value="year">За год</option>
            </select>
          </div>
        </div>
        <button @click="clearFilters" class="clear-filters-btn">
          Сбросить фильтры
        </button>
      </div>
    </div>
    <div v-if="isLoading" class="boards-loading">
      <div class="loading-spinner"></div>
      <p>Загрузка досок...</p>
    </div>
    
    <div v-else-if="filteredBoards.length === 0" class="boards-empty">
      <div class="empty-illustration">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="60" height="60" rx="12" fill="#F3F4F6"/>
          <rect x="15" y="15" width="50" height="50" rx="8" fill="white" stroke="#E5E7EB" stroke-width="2"/>
          <rect x="25" y="25" width="30" height="8" rx="4" fill="#D5CCFF"/>
          <rect x="25" y="40" width="20" height="8" rx="4" fill="#E5E7EB"/>
          <rect x="25" y="55" width="15" height="8" rx="4" fill="#E5E7EB"/>
          <path d="M65 25H75M65 40H70M65 55H68" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <h3>Нет досок</h3>
      <p v-if="searchQuery || activeFiltersCount">
        Попробуйте изменить параметры поиска или фильтры
      </p>
      <p v-else>
        Создайте свою первую доску для управления задачами
      </p>
      <button @click="handleCreateBoard" class="empty-action-btn">
        + Создать доску
      </button>
    </div>
    
    <div v-else class="boards-content">
      <div v-if="viewMode === 'grid'" class="boards-grid">
        <div
          v-for="board in filteredBoards"
          :key="board.id"
          :class="['board-card', { active: board.id === currentBoardId }]"
          @click="selectBoard(board)"
          @dblclick="openBoard(board)"
          @contextmenu.prevent="openContextMenu($event, board)"
        >
          <div class="board-card-header">
            <div class="board-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 4H18M2 8H18M2 12H10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <h3 class="board-title">{{ board.name || board.title || 'Без названия' }}</h3>
            <div class="board-actions">
              <button
                @click.stop="toggleStar(board)"
                class="board-action-btn"
                :title="board.starred ? 'Убрать из избранного' : 'Добавить в избранное'"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path v-if="board.starred" d="M8 1L10.472 5.396L15 6.292L11.5 9.708L12.472 14L8 11.396L3.528 14L4.5 9.708L1 6.292L5.528 5.396L8 1Z" 
                        fill="currentColor" stroke="currentColor" stroke-width="1.5"/>
                  <path v-else d="M8 1L10.472 5.396L15 6.292L11.5 9.708L12.472 14L8 11.396L3.528 14L4.5 9.708L1 6.292L5.528 5.396L8 1Z" 
                        stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button
                @click.stop="openBoardMenu(board)"
                class="board-action-btn"
                title="Действия"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <circle cx="8" cy="4" r="1" fill="currentColor"/>
                  <circle cx="8" cy="8" r="1" fill="currentColor"/>
                  <circle cx="8" cy="12" r="1" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>
          <p v-if="board.description" class="board-description">
            {{ truncateText(board.description, 80) }}
          </p>
          <div class="board-stats">
            <div class="stat-item">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <rect x="1" y="1" width="10" height="10" rx="1" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              <span>{{ board.taskCount || 0 }} задач</span>
            </div>
            <div class="stat-item">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M2 4H10M2 8H7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <span>{{ board.statuses?.length || 0 }} статусов</span>
            </div>
          </div>
          <div class="board-meta">
            <span class="meta-item">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 3V9M3 6H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              Создано: {{ formatDate(board.createdAt) }}
            </span>
            <span v-if="board.updatedAt !== board.createdAt" class="meta-item">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6C11 8.76142 8.76142 11 6 11" 
                      stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              Обновлено: {{ formatDate(board.updatedAt) }}
            </span>
          </div>
          <div v-if="board.tags && board.tags.length > 0" class="board-tags">
            <span
              v-for="tag in board.tags.slice(0, 2)"
              :key="tag"
              class="board-tag"
            >
              {{ tag }}
            </span>
            <span v-if="board.tags.length > 2" class="board-tag-more">
              +{{ board.tags.length - 2 }}
            </span>
          </div>
          <div v-if="board.members && board.members.length > 0" class="board-members">
            <div class="member-avatars">
              <div
                v-for="member in board.members.slice(0, 3)"
                :key="member.id"
                class="member-avatar"
                :title="member.name"
                :style="{ backgroundColor: stringToColor(member.name) }"
              >
                {{ getInitials(member.name) }}
              </div>
              <div v-if="board.members.length > 3" class="member-more">
                +{{ board.members.length - 3 }}
              </div>
            </div>
            <span class="members-count">{{ board.members.length }} участников</span>
          </div>
          <div v-if="board.lastActivity" class="board-activity">
            <div class="activity-dot" :class="{ active: isBoardActive(board) }"></div>
            <span class="activity-text">
              {{ getActivityText(board.lastActivity) }}
            </span>
          </div>
        </div>
        <div class="board-card create-board-card" @click="handleCreateBoard">
          <div class="create-board-content">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="currentColor">
              <path d="M24 8V40M8 24H40" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
            </svg>
            <h3>Создать новую доску</h3>
            <p>Начните организовывать свои задачи</p>
          </div>
        </div>
      </div>
      <div v-else class="boards-list">
        <table class="boards-table">
          <thead>
            <tr>
              <th @click="sortTable('name')" class="sortable">
                Название
                <svg v-if="sortBy === 'name'" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M6 9L3 6H9L6 9Z" fill="currentColor"/>
                </svg>
              </th>
              <th @click="sortTable('taskCount')" class="sortable">
                Задачи
                <svg v-if="sortBy === 'taskCount'" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M6 9L3 6H9L6 9Z" fill="currentColor"/>
                </svg>
              </th>
              <th @click="sortTable('statuses')" class="sortable">
                Статусы
                <svg v-if="sortBy === 'statuses'" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M6 9L3 6H9L6 9Z" fill="currentColor"/>
                </svg>
              </th>
              <th @click="sortTable('updatedAt')" class="sortable">
                Обновлено
                <svg v-if="sortBy === 'updatedAt'" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M6 9L3 6H9L6 9Z" fill="currentColor"/>
                </svg>
              </th>
              <th>Участники</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="board in filteredBoards"
              :key="board.id"
              :class="{ active: board.id === currentBoardId }"
              @click="selectBoard(board)"
              @dblclick="openBoard(board)"
            >
              <td class="board-name-cell">
                <div class="board-name-wrapper">
                  <div class="board-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M2 4H14M2 8H14M2 12H8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <div class="board-name">{{ board.name || board.title }}</div>
                    <div v-if="board.description" class="board-description-sm">
                      {{ truncateText(board.description, 60) }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="task-count">{{ board.taskCount || 0 }}</td>
              <td class="status-count">{{ board.statuses?.length || 0 }}</td>
              <td class="updated-at">{{ formatDate(board.updatedAt, true) }}</td>
              <td class="members-cell">
                <div class="member-avatars-sm">
                  <div
                    v-for="member in board.members?.slice(0, 3) || []"
                    :key="member.id"
                    class="member-avatar-sm"
                    :title="member.name"
                    :style="{ backgroundColor: stringToColor(member.name) }"
                  >
                    {{ getInitials(member.name) }}
                  </div>
                </div>
              </td>
              <td class="actions-cell">
                <div class="table-actions">
                  <button
                    @click.stop="toggleStar(board)"
                    class="table-action-btn"
                    :title="board.starred ? 'Убрать из избранного' : 'Добавить в избранное'"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                      <path v-if="board.starred" d="M7 1L9.472 5.396L14 6.292L10.5 9.708L11.472 14L7 11.396L2.528 14L3.5 9.708L0 6.292L4.528 5.396L7 1Z" 
                            fill="currentColor" stroke="currentColor" stroke-width="1.5"/>
                      <path v-else d="M7 1L9.472 5.396L14 6.292L10.5 9.708L11.472 14L7 11.396L2.528 14L3.5 9.708L0 6.292L4.528 5.396L7 1Z" 
                            stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                  <button
                    @click.stop="openBoard(board)"
                    class="table-action-btn"
                    title="Открыть"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                      <path d="M1 7H13M7 1V13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                  </button>
                  <button
                    @click.stop="editBoard(board)"
                    class="table-action-btn"
                    title="Редактировать"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                      <path d="M11.5 1.5C11.7761 1.22386 12.2239 1.22386 12.5 1.5L13.5 2.5C13.7761 2.77614 13.7761 3.22386 13.5 3.5L12.5 4.5L9.5 1.5L10.5 0.5C10.7761 0.223858 11.2239 0.223858 11.5 0.5L11.5 1.5Z"/>
                      <path d="M8.5 4.5L11.5 7.5M1 13L0.5 13.5C0.223858 13.5 0 13.2761 0 13V10.5C0 10.2239 0.223858 10 0.5 10L3.5 10C3.77614 10 4 10.2239 4 10.5V13C4 13.2761 3.77614 13.5 3.5 13.5L1 13ZM2 12L12 2" stroke="currentColor" stroke-width="1.5"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="totalPages > 1" class="boards-pagination">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        
        <div class="pagination-pages">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="['page-btn', { active: page === currentPage }]"
          >
            {{ page }}
          </button>
          <span v-if="showEllipsis" class="pagination-ellipsis">...</span>
        </div>
        
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
    <div
      v-if="contextMenu.show"
      class="context-menu"
      :style="{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }"
      @click.stop
    >
      <button @click="openBoard(contextMenu.board)" class="context-menu-item">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M1 7H15M7 1V13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span>Открыть</span>
      </button>
      <button @click="editBoard(contextMenu.board)" class="context-menu-item">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M11.5 1.5C11.7761 1.22386 12.2239 1.22386 12.5 1.5L13.5 2.5C13.7761 2.77614 13.7761 3.22386 13.5 3.5L12.5 4.5L9.5 1.5L10.5 0.5C10.7761 0.223858 11.2239 0.223858 11.5 0.5L11.5 1.5Z"/>
          <path d="M8.5 4.5L11.5 7.5M1 13L0.5 13.5C0.223858 13.5 0 13.2761 0 13V10.5C0 10.2239 0.223858 10 0.5 10L3.5 10C3.77614 10 4 10.2239 4 10.5V13C4 13.2761 3.77614 13.5 3.5 13.5L1 13ZM2 12L12 2" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        <span>Редактировать</span>
      </button>
      <button @click="toggleStar(contextMenu.board)" class="context-menu-item">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path v-if="contextMenu.board.starred" d="M8 1L10.472 5.396L15 6.292L11.5 9.708L12.472 14L8 11.396L3.528 14L4.5 9.708L1 6.292L5.528 5.396L8 1Z" 
                fill="currentColor" stroke="currentColor" stroke-width="1.5"/>
          <path v-else d="M8 1L10.472 5.396L15 6.292L11.5 9.708L12.472 14L8 11.396L3.528 14L4.5 9.708L1 6.292L5.528 5.396L8 1Z" 
                stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>{{ contextMenu.board.starred ? 'Убрать из избранного' : 'Добавить в избранное' }}</span>
      </button>
      <div class="context-menu-divider"></div>
      <button @click="deleteBoard(contextMenu.board)" class="context-menu-item delete">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2 4H14M5 4V2H11V4M6 7V11M10 7V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span>Удалить</span>
      </button>
    </div>
    <div v-if="notification.show" class="notification" :class="notification.type">
      {{ notification.message }}
      <button @click="notification.show = false" class="notification-close">
        ×
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()


const props = defineProps({
  boards: {
    type: Array,
    default: () => []
  },
  currentBoardId: {
    type: [String, Number],
    default: null
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'select',
  'create',
  'edit',
  'delete',
  'star',
  'search',
  'filter',
  'sort'
])


const searchQuery = ref('')
const viewMode = ref('grid')
const showFilters = ref(false)
const sortBy = ref('updatedAt')
const sortOrder = ref('desc')
const currentPage = ref(1)
const itemsPerPage = 12

const filters = reactive({
  type: '',
  activity: '',
  dateRange: ''
})

const contextMenu = reactive({
  show: false,
  x: 0,
  y: 0,
  board: null
})

const notification = reactive({
  show: false,
  message: '',
  type: 'success'
})

const activeBoardsCount = computed(() => {
  return props.boards.filter(board => !board.archived).length
})

const totalTasks = computed(() => {
  return props.boards.reduce((sum, board) => sum + (board.taskCount || 0), 0)
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.type) count++
  if (filters.activity) count++
  if (filters.dateRange) count++
  return count
})

const filteredBoards = computed(() => {
  let result = [...props.boards]
  
  if (searchQuery.value) {
    const search = searchQuery.value.toLowerCase()
    result = result.filter(board => 
      (board.name || board.title || '').toLowerCase().includes(search) ||
      (board.description || '').toLowerCase().includes(search) ||
      (board.tags || []).some(tag => tag.toLowerCase().includes(search))
    )
  }
  

  if (filters.type) {
    result = result.filter(board => board.type === filters.type)
  }
  
  if (filters.activity) {
    if (filters.activity === 'active') {
      result = result.filter(board => !board.archived)
    } else if (filters.activity === 'archived') {
      result = result.filter(board => board.archived)
    }
  }
  
  if (filters.dateRange) {
    const now = new Date()
    let cutoffDate = new Date()
    
    switch (filters.dateRange) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7)
        break
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1)
        break
    }
    
    result = result.filter(board => {
      const boardDate = new Date(board.createdAt)
      return boardDate >= cutoffDate
    })
  }
  
  result.sort((a, b) => {
    let aValue, bValue
    
    switch (sortBy.value) {
      case 'name':
        aValue = (a.name || a.title || '').toLowerCase()
        bValue = (b.name || b.title || '').toLowerCase()
        break
      case 'taskCount':
        aValue = a.taskCount || 0
        bValue = b.taskCount || 0
        break
      case 'statuses':
        aValue = a.statuses?.length || 0
        bValue = b.statuses?.length || 0
        break
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime()
        bValue = new Date(b.createdAt).getTime()
        break
      case 'updatedAt':
      default:
        aValue = new Date(a.updatedAt || a.createdAt).getTime()
        bValue = new Date(b.updatedAt || b.createdAt).getTime()
        break
    }
    
    if (sortOrder.value === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })
  
  return result
})

const totalPages = computed(() => {
  return Math.ceil(filteredBoards.value.length / itemsPerPage)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  
  if (totalPages.value <= maxVisible) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    let start = Math.max(1, currentPage.value - 2)
    let end = Math.min(totalPages.value, start + maxVisible - 1)
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
  }
  
  return pages
})

const showEllipsis = computed(() => {
  return totalPages.value > 5 && 
         (visiblePages.value[visiblePages.value.length - 1] < totalPages.value ||
          visiblePages.value[0] > 1)
})

const paginatedBoards = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredBoards.value.slice(start, end)
})

const selectBoard = (board) => {
  emit('select', board.id)
}

const openBoard = (board) => {
  router.push(`/board/${board.id}`)
}

const handleCreateBoard = () => {
  emit('create')
}

const editBoard = (board) => {
  emit('edit', board)
}

const deleteBoard = (board) => {
  if (confirm(`Удалить доску "${board.name || board.title}"?`)) {
    emit('delete', board.id)
    showNotification('Доска удалена', 'success')
    closeContextMenu()
  }
}

const toggleStar = (board) => {
  emit('star', { boardId: board.id, starred: !board.starred })
  showNotification(
    board.starred ? 'Убрано из избранного' : 'Добавлено в избранное',
    'success'
  )
  closeContextMenu()
}

const handleSearch = () => {
  emit('search', searchQuery.value)
  currentPage.value = 1
}

const applyFilters = () => {
  emit('filter', filters)
  currentPage.value = 1
}

const clearFilters = () => {
  filters.type = ''
  filters.activity = ''
  filters.dateRange = ''
  applyFilters()
  showFilters.value = false
}

const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

const applySorting = () => {
  emit('sort', { sortBy: sortBy.value, sortOrder: sortOrder.value })
}

const sortTable = (column) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'desc'
  }
  applySorting()
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const goToPage = (page) => {
  currentPage.value = page
}

const formatDate = (dateString, short = false) => {
  if (!dateString) return 'Не указано'
  
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    
    if (short) {
      if (diffDays === 0) return 'Сегодня'
      if (diffDays === 1) return 'Вчера'
      if (diffDays < 7) return `${diffDays} д. назад`
    }
    
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: short ? undefined : 'numeric'
    })
  } catch {
    return 'Неверная дата'
  }
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const stringToColor = (str) => {
  if (!str) return '#6C63FF'
  
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ]
  
  return colors[Math.abs(hash) % colors.length]
}

const isBoardActive = (board) => {
  if (!board.lastActivity) return false
  const lastActivity = new Date(board.lastActivity)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  return lastActivity > weekAgo
}

const getActivityText = (lastActivity) => {
  if (!lastActivity) return 'Нет активности'
  
  const activityDate = new Date(lastActivity)
  const now = new Date()
  const diffHours = Math.floor((now - activityDate) / (1000 * 60 * 60))
  
  if (diffHours === 0) return 'Только что'
  if (diffHours === 1) return '1 час назад'
  if (diffHours < 24) return `${diffHours} ч. назад`
  
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Вчера'
  if (diffDays < 7) return `${diffDays} д. назад`
  
  return formatDate(lastActivity, true)
}

const openContextMenu = (event, board) => {
  event.preventDefault()
  contextMenu.show = true
  contextMenu.x = event.clientX
  contextMenu.y = event.clientY
  contextMenu.board = board
}

const closeContextMenu = () => {
  contextMenu.show = false
}

const openBoardMenu = (board) => {
  console.log('Open board menu:', board)
}

const showNotification = (message, type = 'success') => {
  notification.message = message
  notification.type = type
  notification.show = true
  
  setTimeout(() => {
    notification.show = false
  }, 3000)
}

const handleClickOutside = (event) => {
  if (contextMenu.show && !event.target.closest('.context-menu')) {
    closeContextMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.boards-container {
  padding: 24px;
  background: #f8f9fa;
  min-height: 100vh;
}

.boards-header {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.boards-title-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.boards-title {
  margin: 0;
  color: #1C0E5E;
  font-size: 28px;
  font-weight: 600;
}

.boards-stats {
  display: flex;
  gap: 20px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.stat svg {
  color: #6C63FF;
}

.boards-controls {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.boards-search {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: 10px 16px 10px 40px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
  background: #f8f9fa;
}

.search-input:focus {
  outline: none;
  border-color: #6C63FF;
  background: white;
  box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.1);
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.boards-sort {
  min-width: 200px;
}

.sort-select {
  width: 100%;
  padding: 10px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  color: #333;
  cursor: pointer;
}

.sort-select:focus {
  outline: none;
  border-color: #6C63FF;
}

.boards-view {
  display: flex;
  gap: 8px;
  background: #f8f9fa;
  padding: 4px;
  border-radius: 8px;
}

.view-btn {
  padding: 8px;
  border: none;
  background: none;
  color: #999;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.view-btn:hover {
  background: #e9ecef;
  color: #666;
}

.view-btn.active {
  background: white;
  color: #6C63FF;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.boards-filter {
  position: relative;
}

.filter-btn {
  padding: 10px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background: white;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.filter-btn:hover {
  border-color: #6C63FF;
  color: #6C63FF;
}

.filter-btn.active {
  border-color: #6C63FF;
  background: #6C63FF;
  color: white;
}

.filter-badge {
  background: #ff4757;
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.create-board-btn {
  padding: 10px 20px;
  background: #6C63FF;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  white-space: nowrap;
}

.create-board-btn:hover {
  background: #5a52e0;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(108, 99, 255, 0.2);
}
.filters-panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filters-content h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 16px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.filter-group select {
  padding: 8px 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  color: #333;
  cursor: pointer;
}

.filter-group select:focus {
  outline: none;
  border-color: #6C63FF;
}

.clear-filters-btn {
  padding: 8px 16px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.clear-filters-btn:hover {
  background: #e9ecef;
  color: #333;
}

.boards-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e9ecef;
  border-top: 3px solid #6C63FF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.boards-empty {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.empty-illustration {
  margin-bottom: 24px;
}

.boards-empty h3 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 20px;
  font-weight: 600;
}

.boards-empty p {
  margin: 0 0 24px 0;
  color: #666;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;
}

.empty-action-btn {
  padding: 12px 24px;
  background: #6C63FF;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.empty-action-btn:hover {
  background: #5a52e0;
}

.boards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.board-card {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  overflow: hidden;
}

.board-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  border-color: #6C63FF;
}

.board-card.active {
  border-color: #6C63FF;
  background: rgba(108, 99, 255, 0.05);
}

.board-card.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #6C63FF;
}

.board-card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.board-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #6C63FF, #1C0E5E);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.board-title {
  margin: 0;
  flex: 1;
  color: #1C0E5E;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
}

.board-actions {
  display: flex;
  gap: 4px;
}

.board-action-btn {
  padding: 4px;
  border: none;
  background: none;
  color: #999;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.board-action-btn:hover {
  background: #f8f9fa;
  color: #6C63FF;
}

.board-description {
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  flex: 1;
}

.board-stats {
  display: flex;
  gap: 16px;
  padding: 12px 0;
  border-top: 1px solid #e9ecef;
  border-bottom: 1px solid #e9ecef;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 13px;
  font-weight: 500;
}

.stat-item svg {
  color: #6C63FF;
}

.board-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #999;
  font-size: 12px;
}

.meta-item svg {
  color: #999;
}

.board-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.board-tag {
  padding: 2px 8px;
  background: #f3f4f6;
  color: #666;
  font-size: 11px;
  font-weight: 500;
  border-radius: 12px;
  white-space: nowrap;
}

.board-tag-more {
  padding: 2px 8px;
  background: #e9ecef;
  color: #999;
  font-size: 11px;
  font-weight: 500;
  border-radius: 12px;
}

.board-members {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #e9ecef;
}

.member-avatars {
  display: flex;
}

.member-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: white;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: -8px;
  border: 2px solid white;
  position: relative;
}

.member-avatar:first-child {
  margin-left: 0;
}

.member-more {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f8f9fa;
  color: #666;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: -8px;
  border: 2px solid white;
}

.members-count {
  color: #999;
  font-size: 12px;
}

.board-activity {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #e9ecef;
}

.activity-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ddd;
}

.activity-dot.active {
  background: #28a745;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.activity-text {
  color: #999;
  font-size: 12px;
}

.create-board-card {
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.create-board-card:hover {
  background: #e9ecef;
  border-color: #6C63FF;
  transform: translateY(-2px);
}

.create-board-content {
  text-align: center;
  color: #666;
}

.create-board-content svg {
  color: #999;
  margin-bottom: 12px;
}

.create-board-content h3 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.create-board-content p {
  margin: 0;
  font-size: 14px;
}

.boards-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 32px;
}

.boards-table {
  width: 100%;
  border-collapse: collapse;
}

.boards-table thead {
  background: #f8f9fa;
}

.boards-table th {
  padding: 16px;
  text-align: left;
  color: #666;
  font-size: 14px;
  font-weight: 600;
  border-bottom: 2px solid #e9ecef;
  user-select: none;
}

.sortable {
  cursor: pointer;
  transition: color 0.3s;
}

.sortable:hover {
  color: #333;
}

.sortable svg {
  margin-left: 4px;
  vertical-align: middle;
}

.boards-table tbody tr {
  border-bottom: 1px solid #e9ecef;
  cursor: pointer;
  transition: background 0.3s;
}

.boards-table tbody tr:hover {
  background: #f8f9fa;
}

.boards-table tbody tr.active {
  background: rgba(108, 99, 255, 0.05);
}

.boards-table td {
  padding: 16px;
  color: #333;
  font-size: 14px;
}

.board-name-cell {
  width: 35%;
}

.board-name-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.board-name {
  font-weight: 500;
  color: #1C0E5E;
  margin-bottom: 4px;
}

.board-description-sm {
  color: #666;
  font-size: 12px;
  line-height: 1.4;
}

.task-count, .status-count, .updated-at {
  color: #666;
  font-weight: 500;
}

.members-cell {
  width: 15%;
}

.member-avatars-sm {
  display: flex;
}

.member-avatar-sm {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  color: white;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: -6px;
  border: 2px solid white;
}

.member-avatar-sm:first-child {
  margin-left: 0;
}

.actions-cell {
  width: 10%;
}

.table-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.boards-table tbody tr:hover .table-actions {
  opacity: 1;
}

.table-action-btn {
  padding: 6px;
  border: none;
  background: none;
  color: #999;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.table-action-btn:hover {
  background: #f8f9fa;
  color: #6C63FF;
}
.boards-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.pagination-btn {
  padding: 8px 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background: white;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #6C63FF;
  color: #6C63FF;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  gap: 8px;
}

.page-btn {
  padding: 8px 12px;
  border: 2px solid transparent;
  border-radius: 8px;
  background: #f8f9fa;
  color: #666;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.page-btn:hover {
  background: #e9ecef;
  color: #333;
}

.page-btn.active {
  background: #6C63FF;
  color: white;
  border-color: #6C63FF;
}

.pagination-ellipsis {
  padding: 8px 4px;
  color: #999;
}

.context-menu {
  position: fixed;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  min-width: 200px;
  overflow: hidden;
}

.context-menu-item {
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  text-align: left;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: background 0.3s;
}

.context-menu-item:hover {
  background: #f8f9fa;
}

.context-menu-item.delete {
  color: #dc3545;
}

.context-menu-item.delete:hover {
  background: #f8d7da;
}

.context-menu-divider {
  height: 1px;
  background: #e9ecef;
  margin: 4px 0;
}

.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 8px;
  color: white;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  z-index: 1001;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: slideIn 0.3s ease;
}

.notification.success {
  background: #28a745;
}

.notification.error {
  background: #dc3545;
}

.notification-close {
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

.notification-close:hover {
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
  .boards-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .boards-container {
    padding: 16px;
  }
  
  .boards-header {
    padding: 16px;
  }
  
  .boards-title-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .boards-stats {
    width: 100%;
    justify-content: space-between;
  }
  
  .boards-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .boards-search,
  .boards-sort {
    min-width: auto;
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
  }
  
  .boards-grid {
    grid-template-columns: 1fr;
  }
  
  .boards-table {
    display: block;
    overflow-x: auto;
  }
  
  .context-menu {
    min-width: 180px;
  }
}

@media (max-width: 480px) {
  .board-card {
    padding: 16px;
  }
  
  .board-stats {
    flex-direction: column;
    gap: 8px;
  }
  
  .boards-pagination {
    flex-wrap: wrap;
  }
  
  .pagination-pages {
    order: 1;
    width: 100%;
    justify-content: center;
    margin: 12px 0;
  }
}
</style>