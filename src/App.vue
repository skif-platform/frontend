<script setup>
import { computed } from 'vue'
import ExperimentPlanner from '@/components/ExperimentPlanner.vue'
import ConfigurationList from '@/components/ConfigurationList.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeRoute = computed(() => route.name)
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <nav class="main-nav">
        <RouterLink 
          to="/" 
          :class="{ active: activeRoute === 'planner' }"
          class="nav-link"
        >
          Планировщик
        </RouterLink>
        
        <RouterLink 
          to="/configurations" 
          :class="{ active: ['configurations', 'configuration-details'].includes(activeRoute) }"
          class="nav-link"
        >
          Конфигурации
        </RouterLink>
      </nav>
    </header>

    <main class="app-main">
      <RouterView v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>

    <footer class="app-footer">
      <p>Experiment Planner © 2025</p>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}

.app-header {
  background-color: #2c3e50;
  padding: 1rem 2rem;
}

.main-nav {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  color: #ecf0f1;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: #34495e;
}

.nav-link.active {
  background-color: #42b983;
  font-weight: bold;
}

.app-main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.app-footer {
  background-color: #2c3e50;
  color: #ecf0f1;
  text-align: center;
  padding: 1rem;
}

/* Анимации переходов */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>