<script setup>
import { ref, onMounted } from 'vue'
import ModelList from '@/components/ModelList.vue'
import { fetchModels, saveConfiguration, fetchModelDatatypes } from '@/services/api'
import { useRouter } from 'vue-router'

const router = useRouter()
const models = ref([])
const selectedModels = ref([])
const isLoading = ref(false)
const error = ref(null)
const draggedItem = ref(null)
const dragOverIndex = ref(null)

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2)

onMounted(async () => {
  try {
    isLoading.value = true
    models.value = await fetchModels()
  } catch (err) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
})

const addModelToExperiment = async (model) => {
  try {
    const datatypes = await fetchModelDatatypes(model.id)
    selectedModels.value.push({
      ...model,
      uniqueId: generateId(),
      datatypes
    })
  } catch (err) {
    console.error('Failed to load datatypes:', err)
    selectedModels.value.push({
      ...model,
      uniqueId: generateId(),
      datatypes: null
    })
  }
}

const removeModelFromExperiment = (uniqueId) => {
  selectedModels.value = selectedModels.value.filter(m => m.uniqueId !== uniqueId)
}

const handleDragStart = (event, model, uniqueId) => {
  draggedItem.value = { model, uniqueId }
  event.dataTransfer.effectAllowed = 'move'
}

const handleDragOver = (event, index) => {
  event.preventDefault()
  dragOverIndex.value = index
}

const handleDrop = (event, targetIndex) => {
  event.preventDefault()
  
  if (!draggedItem.value) return

  if (!draggedItem.value.uniqueId) {
    addModelToExperiment(draggedItem.value.model)
  } else {
    const fromIndex = selectedModels.value.findIndex(m => m.uniqueId === draggedItem.value.uniqueId)
    let toIndex = targetIndex ?? selectedModels.value.length
    
    if (fromIndex < toIndex) toIndex--
    
    if (fromIndex !== toIndex) {
      const modelToMove = selectedModels.value[fromIndex]
      selectedModels.value.splice(fromIndex, 1)
      selectedModels.value.splice(toIndex, 0, modelToMove)
    }
  }
  
  draggedItem.value = null
  dragOverIndex.value = null
}

const saveExperiment = async () => {
  if (selectedModels.value.length === 0) {
    alert('Добавьте хотя бы одну модель в эксперимент')
    return
  }
  
  try {
    isLoading.value = true
    const result = await saveConfiguration(
      selectedModels.value.map(({ uniqueId, datatypes, ...model }) => model)
    )
    router.push({ 
      name: 'configuration-details', 
      params: { id: result.experimentId }
    })
    selectedModels.value = []
  } catch (err) {
    error.value = err.message
    alert(`Ошибка: ${err.message}`)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="experiment-planner">
    <div class="layout">
      <div class="model-selection">
        <h2>Доступные модели</h2>
        <ModelList 
          :models="models" 
          :isLoading="isLoading"
          :error="error"
          @select-model="addModelToExperiment"
          @drag-start="(model) => draggedItem = { model }"
        />
      </div>
      
      <div class="experiment-config">
        <h2>Конфигурация эксперимента</h2>
        <div 
          v-if="selectedModels.length === 0" 
          class="empty-message"
          @dragover.prevent
          @drop="handleDrop"
        >
          Перетащите сюда модели или выберите из списка
        </div>
        <div v-else>
          <div 
            class="model-chain"
            @dragover.prevent
          >
            <div 
              v-for="(model, index) in selectedModels" 
              :key="model.uniqueId"
              class="model-item"
              :class="{ 
                'drag-over': dragOverIndex === index,
                'dragging': draggedItem?.uniqueId === model.uniqueId
              }"
              draggable="true"
              @dragstart="(e) => handleDragStart(e, model, model.uniqueId)"
              @dragover="(e) => handleDragOver(e, index)"
              @drop="(e) => handleDrop(e, index)"
              @dragend="dragOverIndex = null"
            >
              <span class="drag-handle">☰</span>
              <span class="model-info">
                {{ index + 1 }}. {{ model.name }} (v{{ model.version }})
                <span class="instance-id">#{{ model.uniqueId.slice(-4) }}</span>
              </span>
              <span 
                class="remove-btn"
                @click.stop="removeModelFromExperiment(model.uniqueId)"
              >
                ×
              </span>
              
              <div class="model-datatypes" v-if="model.datatypes">
                <div class="datatype-badge" 
                     v-for="input in model.datatypes.inputDatatypes" 
                     :key="'in-'+input.id"
                     :title="input.description">
                  ← {{ input.name }}
                </div>
                <div class="datatype-badge"
                     v-for="output in model.datatypes.outputDatatypes"
                     :key="'out-'+output.id"
                     :title="output.description">
                  → {{ output.name }}
                </div>
              </div>
            </div>
          </div>
          
          <button 
            @click="saveExperiment" 
            :disabled="selectedModels.length === 0 || isLoading"
            class="save-btn"
          >
            {{ isLoading ? 'Сохранение...' : 'Сохранить конфигурацию' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  gap: 30px;
  min-height: 500px;
}

.model-selection, .experiment-config {
  flex: 1;
  padding: 15px;
  border-radius: 8px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
}

.empty-message {
  color: #6c757d;
  font-style: italic;
  padding: 40px 20px;
  border: 2px dashed #adb5bd;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.empty-message:hover {
  background-color: #e9ecef;
  border-color: #6c757d;
}

.model-chain {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
  min-height: 100px;
}

.model-item {
  padding: 12px 15px;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.2s;
}

.model-item:hover {
  background-color: #f1f3f5;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.model-item.drag-over {
  border-top: 2px solid #0d6efd;
  background-color: #e7f1ff;
}

.model-item.dragging {
  opacity: 0.5;
  background-color: #f8f9fa;
}

.drag-handle {
  cursor: grab;
  color: #6c757d;
  user-select: none;
}

.model-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.instance-id {
  font-size: 0.8em;
  color: #6c757d;
  background-color: #e9ecef;
  padding: 2px 6px;
  border-radius: 4px;
}

.remove-btn {
  cursor: pointer;
  color: #dc3545;
  font-weight: bold;
  font-size: 1.2em;
  padding: 0 5px;
  transition: color 0.2s;
}

.remove-btn:hover {
  color: #bb2d3b;
}

.model-datatypes {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 8px;
}

.datatype-badge {
  font-size: 0.7em;
  padding: 2px 6px;
  background-color: #e0f2fe;
  border-radius: 10px;
  color: #0369a1;
  cursor: help;
}

.datatype-badge:nth-child(even) {
  background-color: #f0fdf4;
  color: #15803d;
}

.save-btn {
  padding: 10px 20px;
  background-color: #0d6efd;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.2s;
}

.save-btn:hover:not(:disabled) {
  background-color: #0b5ed7;
}

.save-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}
</style>