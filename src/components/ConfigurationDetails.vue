<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchConfigurationById, fetchModelDatatypes } from '@/services/api'
import { connectToWebSocket, disconnectFromWebSocket } from '@/services/websocket'
import GraphVisualization from '@/components/GraphVisualization.vue'

const route = useRoute()
const router = useRouter()
const config = ref({
  experimentId: '',
  name: '',
  description: '',
  createdAt: '',
  models: []
})
const isLoading = ref(true)
const error = ref(null)

const handleResultUpdate = (resultDto) => {
  const model = config.value.models.find(m => m.id === resultDto.modelId)
  if (!model) return

  try {
    const parsed = JSON.parse(resultDto.data)
    model.outputDatatypes?.forEach(output => {
      if (parsed.hasOwnProperty(output.name)) {
        // Инициализация истории значений
        if (!output.history) {
          output.history = []
        }
        // Добавление нового значения в историю
        console.log(resultDto.tick)
        output.history.push({
          tick: resultDto.tick,
          value: parsed[output.name]
        })
        console.log(output.history)
        output.currentValue = parsed[output.name]
      }
    })
  } catch (err) {
    console.error('Ошибка парсинга JSON:', err)
  }
}

onMounted(async () => {
  try {
    const data = await fetchConfigurationById(route.params.id)

    config.value = {
      name: data.name || 'N/A',
      description: data.description || 'N/A',
      createdAt: data.createdAt || new Date().toISOString(),
      models: data.models
    }

    if (config.value.models.length > 0) {
      config.value.models = await Promise.all(
        config.value.models.map(async model => {
          try {
            const datatypes = await fetchModelDatatypes(model.id)
            return {
              ...model,
              inputDatatypes: Array.isArray(datatypes.inputDatatypes)
                ? datatypes.inputDatatypes.map(d => ({
                    ...d,
                    currentValue: d.defaultValue || ''
                  }))
                : [],
              outputDatatypes: Array.isArray(datatypes.outputDatatypes)
                ? datatypes.outputDatatypes.map(d => ({
                    ...d,
                    currentValue: '',
                    history: []
                  }))
                : []             
            }
          } catch (err) {
            console.error(`Ошибка загрузки типов данных для модели ${model.id}:`, err)
            return {
              ...model,
              inputDatatypes: [],
              outputDatatypes: []
            }
          }
        })
      )
    }

    connectToWebSocket(handleResultUpdate)

  } catch (err) {
    error.value = `Ошибка загрузки конфигурации: ${err.message}`
    console.error('Ошибка загрузки:', err)
  } finally {
    isLoading.value = false
  }
})

onBeforeUnmount(() => {
  disconnectFromWebSocket()
})

const goBack = () => {
    router.push({ name: 'configurations' })
}
</script>

<template>
  <div class="configuration-details">
    <button @click="goBack" class="back-btn">
      ← Назад к конфигурациям
    </button>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      Загрузка деталей конфигурации...
    </div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <template v-else>
      <header class="config-header">
        <h2>Конфигурация: {{ config.name }}</h2>
        <h3>Описание: {{ config.description }}</h3>
        <div class="config-meta">
          <span class="meta-item">
            <strong>Создано:</strong> {{ new Date(config.createdAt).toLocaleString() }}
          </span>
          <span class="meta-item">
            <strong>Моделей:</strong> {{ config.models.length }}
          </span>
        </div>
      </header>

      <div v-if="config.models.length > 0" class="models-chain">
        <div 
          v-for="(model, index) in config.models" 
          :key="model.id || index"
          class="model-card"
        >
          <div class="model-header">
            <span class="model-index">{{ index + 1 }}.</span>
            <div class="model-info">
              <h3 class="model-name">{{ model.name || 'Безымянная модель' }}</h3>
              <div class="model-details">
                <span class="model-version">v{{ model.version || '1.0' }}</span>
                <span class="model-id">ID: {{ model.id }}</span>
              </div>
              <div class="model-url">{{ model.url || 'URL не указан' }}</div>
            </div>
          </div>

          <div v-if="model.inputDatatypes?.length" class="datatypes-section">
            <h4 class="section-title">Входные параметры</h4>
            <div class="datatype-grid">
              <div 
                v-for="input in model.inputDatatypes" 
                :key="`input-${model.id}-${input.id}`"
                class="datatype-item"
              >
                <label :for="`input-${model.id}-${input.id}`">
                  {{ input.name || 'Безымянный вход' }}
                </label>
                <input
                  :id="`input-${model.id}-${input.id}`"
                  type="text"
                  v-model="input.currentValue"
                  :placeholder="input.defaultValue || 'Введите значение'"
                />
                <div v-if="input.description" class="datatype-description">
                  {{ input.description }}
                </div>
              </div>
            </div>
          </div>
          <div v-else class="no-datatypes">
            Нет входных параметров
          </div>

          <div v-if="model.outputDatatypes?.length" class="datatypes-section">
            <h4 class="section-title">Выходные параметры</h4>
            <div class="datatype-grid">
              <div 
                v-for="output in model.outputDatatypes" 
                :key="`output-${model.id}-${output.id}`"
                class="datatype-item"
              >
                <div class="output-name">
                  {{ output.name || 'Безымянный выход' }}
                </div>
                <div class="output-value">
                  {{ output.currentValue || 'Ещё не выполнено' }}
                </div>
                <GraphVisualization 
                  v-if="output.history && output.history.length > 0"
                  :title="output.name"
                  :data="output.history.map(item => item.value)"
                  :ticks="output.history.map(item => item.tick)"
                />
                <div v-if="output.description" class="datatype-description">
                  {{ output.description }}
                </div>
              </div>
            </div>
          </div>
          <div v-else class="no-datatypes">
            Нет выходных параметров
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>Нет моделей в этой конфигурации</h3>
        <p>Эта конфигурация пока не содержит ни одной модели.</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.configuration-details {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.back-btn {
  padding: 0.5rem 1rem;
  background-color: #4a6fa5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 1.5rem;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background-color: #3a5a8c;
}

.loading-state {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  color: #555;
}

.spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #4a6fa5;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  padding: 1rem;
  background-color: #ffebee;
  color: #c62828;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.config-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.config-header h2 {
  margin: 0;
  color: #2c3e50;
}

.config-header h3 {
  margin: 0;
  color: #2c3e50;
}

.config-meta {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.meta-item {
  display: flex;
  gap: 0.3rem;
}

.models-chain {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.model-card {
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.model-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.model-index {
  font-weight: bold;
  color: #4a6fa5;
  font-size: 1.1rem;
}

.model-info {
  flex: 1;
}

.model-name {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.model-details {
  display: flex;
  gap: 1rem;
  margin: 0.3rem 0;
  font-size: 0.85rem;
  color: #666;
}

.model-url {
  font-size: 0.8rem;
  color: #888;
  word-break: break-all;
}

.datatypes-section {
  margin-top: 1.5rem;
}

.section-title {
  margin: 0 0 1rem 0;
  color: #4a6fa5;
  font-size: 1rem;
}

.datatype-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.datatype-item {
  padding: 1rem;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.datatype-item label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.datatype-item input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.output-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 0.3rem;
}

.output-value {
  padding: 0.5rem;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.datatype-description {
  font-size: 0.8rem;
  color: #666;
  line-height: 1.4;
}

.no-datatypes {
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 4px;
  color: #666;
  font-style: italic;
  text-align: center;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-top: 2rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.empty-state p {
  margin: 0;
  color: #666;
}

.datatype-item {
  position: relative;
}

.output-value {
  font-family: monospace;
  font-size: 1.1rem;
  padding: 0.5rem;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.datatype-grid {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}
</style>