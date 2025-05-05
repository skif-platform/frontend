<script setup>
defineProps({
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

const onDragStart = (model) => {
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
          :key="model.modelId" 
          class="model-item"
          draggable="true"
          @dragstart="() => onDragStart(model)"
          @click="$emit('select-model', model)"
        >
          <div class="model-name">{{ model.name }}</div>
          <div class="model-details">
            <span class="model-version">v{{ model.version }}</span>
            <span class="model-id">ID: {{ model.modelId }}</span>
          </div>
          <div class="model-url">{{ model.url }}</div>
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
  cursor: pointer;
  transition: all 0.2s;
  border-left: 4px solid transparent;
}

.model-item:hover {
  background-color: #f0f0f0;
  border-left-color: #42b983;
  transform: translateX(5px);
}

.model-item:active {
  cursor: grabbing;
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
</style>