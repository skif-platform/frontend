<script setup>
import { ref, onMounted } from 'vue'
import { fetchConfigurations, fetchConfigurationById, deleteConfiguration } from '@/services/api'

const configurations = ref([])
const selectedConfig = ref(null)
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
    console.error('Error loading configurations:', err)
  } finally {
    isLoading.value = false
  }
}

const showConfigurationDetails = async (experimentId) => {
  try {
    isLoading.value = true
    selectedConfig.value = await fetchConfigurationById(experimentId)
  } catch (err) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}

const handleDelete = async (experimentId) => {
  if (!confirm('Are you sure you want to delete this configuration?')) return
  
  try {
    isLoading.value = true
    await deleteConfiguration(experimentId)
    await loadConfigurations()
    if (selectedConfig.value?.experimentId === experimentId) {
      selectedConfig.value = null
    }
  } catch (err) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="configuration-list">
    <h2>Saved Configurations</h2>
    <div v-if="isLoading && !selectedConfig">Loading...</div>
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
        >
          <div class="config-info" @click="showConfigurationDetails(config.experimentId)">
            <div class="config-id">ID: {{ config.experimentId }}</div>
            <div class="config-meta">
              <span>Models: {{ config.models.length }}</span>
              <span v-if="config.createdAt">
                Created: {{ new Date(config.createdAt).toLocaleString() }}
              </span>
            </div>
          </div>
          <button 
            @click.stop="handleDelete(config.experimentId)"
            class="delete-btn"
            :disabled="isLoading"
          >
            Delete
          </button>
        </li>
      </ul>
    </div>

    <div v-if="selectedConfig" class="config-details">
      <h3>Configuration Details</h3>
      <div class="models-chain">
        <div 
          v-for="(model, index) in selectedConfig.models" 
          :key="index" 
          class="model-item"
        >
          {{ index + 1 }}. {{ model.name }} (v{{ model.version }})
          <div class="model-url">{{ model.url }}</div>
        </div>
      </div>
      <button @click="selectedConfig = null" class="close-btn">
        Close
      </button>
    </div>
  </div>
</template>

<style scoped>
.configuration-list {
  max-width: 800px;
  margin: 0 auto;
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

.configurations {
  list-style: none;
  padding: 0;
  margin: 0;
}

.configuration-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  margin-bottom: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.configuration-item:hover {
  background-color: #f0f0f0;
}

.config-info {
  flex: 1;
  cursor: pointer;
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

.config-details {
  margin-top: 30px;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.models-chain {
  margin: 20px 0;
}

.model-item {
  padding: 10px 15px;
  margin-bottom: 8px;
  background-color: #e9f5ff;
  border-radius: 4px;
}

.model-url {
  color: #666;
  font-size: 0.8em;
  margin-top: 3px;
}

.close-btn {
  padding: 8px 16px;
  background-color: #666;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 15px;
}

.close-btn:hover {
  background-color: #555;
}
</style>