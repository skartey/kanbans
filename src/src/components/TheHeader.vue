<template>
  <header class="header">
    <div class="header__container container">
      <div class="header__brand">
        <router-link to="/" class="header__logo-link">
          <div class="header__logo">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="4" y="4" width="24" height="24" rx="4" fill="url(#gradient)" />
              <path
                d="M12 12H20M12 16H20M12 20H16"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#6C63FF" />
                  <stop offset="100%" stop-color="#1C0E5E" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 class="header__title">Kanban Board</h1>
        </router-link>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  background-color: #1c0e5e;
  color: white;
  position: fixed;
  inset-inline: 0;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.container {
  margin: 0 auto;
  padding: 15px 0;
}

.header__container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.header__brand {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
}

.header__logo-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: inherit;
}

.header__logo {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header__title {
  font-size: 24px;
  margin: 0;
  background: linear-gradient(to right, #d5ccff, #ffffff);
  -webkit-background-clip: text;
  -moz-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  -moz-text-fill-color: transparent;
  font-weight: 600;
}
</style>
