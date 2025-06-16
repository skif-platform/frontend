import { createRouter, createWebHistory } from 'vue-router'
import ConfigurationsList from '@/components/ConfigurationList.vue'
import ConfigurationDetails from '@/components/ConfigurationDetails.vue'
import ExperimentPlanner from '@/components/ExperimentPlanner.vue'
import ModelList from '@/components/ModelList.vue'

const routes = [
  {
    path: '/',
    name: 'planner',
    component: ExperimentPlanner,
    meta: { title: 'Планировщик' }
  },
  {
    path: '/configurations',
    name: 'configurations',
    component: ConfigurationsList,
    meta: { title: 'Конфигурации' }
  },
  {
    path: '/configurations/:id',
    name: 'configuration-details',
    component: ConfigurationDetails,
    props: true,
    meta: { title: 'Детали конфигурации' }
  },
  {
    path: '/models',
    name: 'models',
    component: ModelList,
    meta: { title: 'Модели' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  }
})

// Динамическое изменение title страницы
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Experiment Planner'
  next()
})

export default router