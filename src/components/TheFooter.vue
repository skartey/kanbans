<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-links">
        <router-link to="/about" class="footer-link">О проекте</router-link>
        <router-link to="/help" class="footer-link">Помощь</router-link>
        <router-link to="/contact" class="footer-link">Контакты</router-link>
      </div>
      <div class="footer-copyright">
        © {{ currentYear }} Todo List. Все права защищены моей молитвой.
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.footer {
  background: #1c0e5e;
  color: white;
  padding: 20px 0;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.footer-links {
  display: flex;
  gap: 30px;
}

.footer-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.footer-link:hover {
  color: white;
  text-decoration: underline;
}

.footer-copyright {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }

  .footer-links {
    gap: 20px;
  }
}
</style>
