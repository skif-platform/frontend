<script setup>
  import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
  import Chart from 'chart.js/auto'
  
  const props = defineProps({
    title: String,
    data: {
      type: Array,
      default: () => []
    },
    ticks: {
      type: Array,
      default: () => []
    }
  })
  
  const showModal = ref(false)
  const miniCanvas = ref(null)
  const fullCanvas = ref(null)
  let miniChart = null
  let fullChart = null
  
  const createChart = (canvas, isMini = false) => {
    return new Chart(canvas, {
      type: 'line',
      data: {
        labels: props.ticks.length > 0 ? props.ticks : props.data.map((_, index) => index + 1),
        datasets: [{
          label: props.title,
          data: props.data,
          borderColor: '#4a6fa5',
          backgroundColor: 'rgba(74, 111, 165, 0.1)',
          borderWidth: 2,
          pointRadius: isMini ? 0 : 3,
          tension: 0.1,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: !isMini,
        scales: {
          x: {
            title: {
              display: !isMini,
              text: 'Время'
            }
          },
          y: {
            beginAtZero: false,
            title: {
              display: !isMini,
              text: 'Значение'
            }
          }
        },
        plugins: {
          legend: {
            display: !isMini
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${props.title}: ${context.parsed.y}`
            },
            title: function(context) {
              return `Время: ${context[0].label}`
            }
          }
        }
      }
    })
  }
  
  const updateCharts = () => {
    if (miniChart) {
      miniChart.data.labels = props.ticks
      miniChart.data.datasets[0].data = props.data
      miniChart.update()
    }
  
    if (fullChart) {
      fullChart.data.labels = props.ticks
      fullChart.data.datasets[0].data = props.data
      fullChart.update()
    }
  }
  
  const openModal = () => {
    showModal.value = true
    nextTick(() => {
      if (fullCanvas.value) {
      // Уничтожаем предыдущий график, если он существует
      if (fullChart) {
        fullChart.destroy()
        fullChart = null
      }
      // Создаём новый график
      fullChart = createChart(fullCanvas.value)
    }
    })
  }
  
  const closeModal = () => {
    showModal.value = false
  }
  
  onMounted(() => {
    if (miniCanvas.value) {
      miniChart = createChart(miniCanvas.value, true)
    }
  })
  
  watch(() => [props.data, props.ticks], () => {
    updateCharts()
  }, { deep: true })
  
  onBeforeUnmount(() => {
    if (miniChart) {
      miniChart.destroy()
      miniChart = null
    }
    if (fullChart) {
      fullChart.destroy()
      fullChart = null
    }
  })
  
  const downloadPNG = () => {
    if (!fullChart) return
    
    const link = document.createElement('a')
    link.download = `${props.title.replace(/[/\\?%*:|"<>]/g, '-')}_graph.png`
    link.href = fullChart.toBase64Image('image/png', 1)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  const downloadCSV = () => {
    const headers = ['time', props.title]
    const rows = props.data.map((value, index) => [
      props.ticks[index] || index + 1,
      value
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.download = `${props.title.replace(/[/\\?%*:|"<>]/g, '-')}_data.csv`
    link.href = url
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }
</script>

<template>
  <div class="graph-container">
    <!-- Мини-график -->
    <div class="mini-graph" @click="openModal">
      <canvas ref="miniCanvas"></canvas>
    </div>

    <!-- Модальное окно с увеличенным графиком -->
    <div v-if="showModal" class="graph-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ title }}</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <canvas ref="fullCanvas"></canvas>
        </div>
        <div class="modal-footer">
          <button @click="downloadPNG" class="download-btn">Сохранить как PNG</button>
          <button @click="downloadCSV" class="download-btn" v-if="data.length > 0">Сохранить как CSV</button>
        </div>
      </div>
    </div>
  </div>
</template>
  
<style scoped>
  .graph-container {
    display: inline-block;
    margin-top: 0.5rem;
  }
  
  .mini-graph {
    width: 100px;
    height: 50px;
    cursor: pointer;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 2px;
    background-color: white;
  }
  
  .graph-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background-color: white;
    border-radius: 8px;
    width: 80%;
    max-width: 800px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
  }
  
  .modal-header {
    padding: 1rem;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .modal-body {
    padding: 1rem;
    flex-grow: 1;
    min-height: 300px;
    position: relative;
  }
  
  .modal-body canvas {
    width: 100% !important;
    height: 100% !important;
  }
  
  .modal-footer {
    padding: 1rem;
    border-top: 1px solid #eee;
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
  }
  
  .download-btn {
    padding: 0.5rem 1rem;
    background-color: #4a6fa5;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .download-btn:hover {
    background-color: #3a5a8c;
  }
</style>