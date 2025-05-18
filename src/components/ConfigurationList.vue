<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchConfigurations, deleteConfiguration } from '@/services/api'

const router = useRouter()
const configurations = ref([])
const isLoading = ref(false)
const error = ref(null)

onMounted(async () => {
  await loadConfigurations()
})

const loadConfigurations = async () => {
  try {
    isLoading.value = true
    configurations.value = await fetchConfigurations()
  } catch (err) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}

const handleDelete = async (experimentId, event) => {
  event.stopPropagation()
  if (!confirm('Are you sure you want to delete this configuration?')) return
  
  try {
    isLoading.value = true
    await deleteConfiguration(experimentId)
    await loadConfigurations()
  } catch (err) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}

const openConfiguration = (experimentId) => {
  router.push({
    name: 'configuration-details',
    params: { id: experimentId }
  })
}
</script>

<template>
  <div class="configuration-list">
    <h2>Saved Configurations</h2>
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else>
      <div v-if="configurations.length === 0" class="empty-message">
        No saved configurations
      </div>
      <ul v-else class="configurations">
        <li 
          v-for="config in configurations" 
          :key="config.experimentId" 
          class="configuration-item"
          @click="openConfiguration(config.experimentId)"
        >
          <div class="config-info">
            <div class="config-id">ID: {{ config.experimentId }}</div>
            <div class="config-meta">
              <span>Models: {{ config.models.length }}</span>
              <span>Created: {{ new Date(config.createdAt).toLocaleString() }}</span>
            </div>
          </div>
          <button 
            @click.stop="handleDelete(config.experimentId, $event)"
            class="delete-btn"
            :disabled="isLoading"
          >
            Delete
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.configuration-list {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.configurations {
  list-style: none;
  padding: 0;
}

.configuration-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  margin-bottom: 10px;
  background-color: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.configuration-item:hover {
  background-color: #e0e0e0;
  transform: translateX(5px);
}

.config-info {
  flex: 1;
}

.config-id {
  font-weight: bold;
  margin-bottom: 5px;
}

.config-meta {
  display: flex;
  gap: 15px;
  color: #666;
  font-size: 0.9em;
}

.delete-btn {
  padding: 5px 10px;
  background-color: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.delete-btn:hover:not(:disabled) {
  background-color: #cc0000;
}

.delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #ff4444;
  padding: 10px;
  background-color: #ffeeee;
  border-radius: 4px;
  margin-bottom: 20px;
}

.empty-message {
  color: #999;
  font-style: italic;
  padding: 20px;
  text-align: center;
  border: 1px dashed #ccc;
  border-radius: 4px;
}
</style>