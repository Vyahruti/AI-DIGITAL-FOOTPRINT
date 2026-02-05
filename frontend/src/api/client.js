import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// API functions
export const analyzeText = async (text, options = {}) => {
  const response = await api.post('/analyze-text', {
    text,
    include_recommendations: options.includeRecommendations ?? true,
    include_rewrite: options.includeRewrite ?? true,
    user_id: options.userId,
  })
  return response.data
}

export const getRiskReport = async (analysisId) => {
  const response = await api.get(`/risk-report/${analysisId}`)
  return response.data
}

export const getHistory = async (userId = null, limit = 50) => {
  const params = new URLSearchParams()
  if (userId) params.append('user_id', userId)
  params.append('limit', limit)
  
  const response = await api.get(`/history?${params.toString()}`)
  return response.data
}

export const getStats = async () => {
  const response = await api.get('/stats')
  return response.data
}

export const deleteAnalysis = async (analysisId) => {
  const response = await api.delete(`/analysis/${analysisId}`)
  return response.data
}

export default api
