<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { fetchModelDatatypes } from '@/services/api'

const router = useRouter()
const props = defineProps({
  models: {
    type: Array,
    required: true
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['select-model', 'drag-start'])

const expandedModels = ref({})

const toggleModelExpansion = async (modelId, event) => {
  // Останавливаем всплытие, если клик был по кнопке раскрытия
  if (event.target.classList.contains('expand-btn')) {
    event.stopPropagation()
    
    if (!expandedModels.value[modelId]) {
      try {
        expandedModels.value[modelId] = {
          loading: true,
          error: null,
          datatypes: null
        }
        
        const data = await fetchModelDatatypes(modelId)
        expandedModels.value[modelId] = {
          loading: false,
          datatypes: data,
          expanded: true
        }
      } catch (err) {
        expandedModels.value[modelId] = {
          loading: false,
          error: err.message,
          expanded: true
        }
      }
    } else {
      expandedModels.value[modelId].expanded = !expandedModels.value[modelId].expanded
    }
  }
}

const handleDragStart = (event, model) => {
  event.stopPropagation()
  emit('drag-start', model)
}
</script>

<template>
  <div class="model-list">
    <div v-if="isLoading">Загрузка моделей...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else>
      <div v-if="models.length === 0" class="empty-message">
        Нет доступных моделей
      </div>
      <ul v-else class="models">
        <li 
          v-for="model in models" 
          :key="model.id" 
          class="model-item"
          draggable="true"
          @dragstart="(e) => handleDragStart(e, model)"
          @click="(e) => toggleModelExpansion(model.id, e)"
        >
          <div class="model-header">
            <button class="expand-btn">▶</button>
            <div class="model-info">
              <div class="model-name">{{ model.name }}</div>
              <div class="model-details">
                <span class="model-version">v{{ model.version }}</span>
                <span class="model-id">ID: {{ model.id }}</span>
              </div>
              <div class="model-url">{{ model.url }}</div>
            </div>
          </div>
          
          <div 
            v-if="expandedModels[model.id]?.expanded" 
            class="model-datatypes"
            @click.stop
          >
            <div v-if="expandedModels[model.id].loading">Loading datatypes...</div>
            <div v-else-if="expandedModels[model.id].error" class="error">
              {{ expandedModels[model.id].error }}
            </div>
            <template v-else-if="expandedModels[model.id].datatypes">
              <div class="datatype-section">
                <h4>Input Types</h4>
                <ul>
                  <li v-for="datatype in expandedModels[model.id].datatypes.inputDatatypes" 
                      :key="'in-'+datatype.id">
                    <strong>{{ datatype.name }}</strong>: {{ datatype.description }}
                    <div class="default-value">Default: {{ datatype.defaultValue }}</div>
                  </li>
                </ul>
              </div>
              
              <div class="datatype-section">
                <h4>Output Types</h4>
                <ul>
                  <li v-for="datatype in expandedModels[model.id].datatypes.outputDatatypes" 
                      :key="'out-'+datatype.id">
                    <strong>{{ datatype.name }}</strong>: {{ datatype.description }}
                  </li>
                </ul>
              </div>
            </template>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.model-list {
  height: 100%;
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
}

.models {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 600px;
  overflow-y: auto;
}

.model-item {
  padding: 12px 15px;
  margin-bottom: 8px;
  background-color: #f9f9f9;
  border-radius: 4px;
  cursor: grab;
  transition: all 0.2s;
  border-left: 4px solid transparent;
}

.model-item:hover {
  background-color: #f0f0f0;
  border-left-color: #42b983;
}

.model-item:active {
  cursor: grabbing;
}

.model-header {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.expand-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 0.8em;
  color: #666;
  transition: transform 0.2s;
}

.expand-btn:hover {
  color: #42b983;
}

.model-info {
  flex: 1;
}

.model-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.model-details {
  display: flex;
  gap: 10px;
  margin-bottom: 5px;
  font-size: 0.9em;
}

.model-version {
  color: #42b983;
}

.model-id {
  color: #666;
}

.model-url {
  color: #888;
  font-size: 0.8em;
  word-break: break-all;
}

.model-datatypes {
  margin-top: 10px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
  border-left: 3px solid #42b983;
}

.datatype-section {
  margin-bottom: 15px;
}

.datatype-section h4 {
  margin: 10px 0 5px 0;
  color: #2c3e50;
}

.datatype-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.datatype-section li {
  padding: 8px;
  margin-bottom: 5px;
  background-color: white;
  border-radius: 3px;
}

.default-value {
  font-size: 0.8em;
  color: #666;
  margin-top: 3px;
}

.error {
  color: #ff4444;
  padding: 5px;
}
</style>