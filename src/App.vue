<script setup>
import { ref } from 'vue'
import ExperimentPlanner from '@/components/ExperimentPlanner.vue'
import ConfigurationList from '@/components/ConfigurationList.vue'

const activeTab = ref('planner')
</script>

<template>
  <div class="app-container">
    <h1>Experiment Planning System</h1>
    <div class="tabs">
      <button 
        @click="activeTab = 'planner'" 
        :class="{ active: activeTab === 'planner' }"
      >
        Planner
      </button>
      <button 
        @click="activeTab = 'configurations'" 
        :class="{ active: activeTab === 'configurations' }"
      >
        Configurations
      </button>
    </div>
    
    <ExperimentPlanner v-if="activeTab === 'planner'" />
    <ConfigurationList v-else />
  </div>
</template>

<style>
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #2c3e50;
  margin-bottom: 30px;
  text-align: center;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tabs button {
  padding: 8px 16px;
  background-color: #e0e0e0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.tabs button.active {
  background-color: #42b983;
  color: white;
}

.tabs button:hover:not(.active) {
  background-color: #d0d0d0;
}
</style>