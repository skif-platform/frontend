const API_BASE = 'http://localhost:6969'

export const fetchModels = async () => {
  const response = await fetch(`${API_BASE}/models`)
  if (!response.ok) {
    throw new Error('Failed to fetch models')
  }
  return await response.json()
}

export const fetchConfigurations = async () => {
  const response = await fetch(`${API_BASE}/configurations`)
  if (!response.ok) {
    throw new Error('Failed to fetch configurations')
  }
  return await response.json()
}

export const fetchConfigurationById = async (experimentId) => {
  const response = await fetch(`${API_BASE}/configuration/${experimentId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch configuration')
  }
  return await response.json()
}

export const saveConfiguration = async (models) => {
  alert(JSON.stringify({ models }))
  const response = await fetch(`${API_BASE}/configuration`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ models }),
  })
  
  if (!response.ok) {
    throw new Error('Failed to save configuration')
  }
  
  return await response.json()
}

export const deleteConfiguration = async (experimentId) => {
  const response = await fetch(`${API_BASE}/delete/${experimentId}`, {
    method: 'DELETE'
  })
  
  if (!response.ok) {
    throw new Error('Failed to delete configuration')
  }
}