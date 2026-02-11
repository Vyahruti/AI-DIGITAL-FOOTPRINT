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

// Privacy training mode
export const getTrainingChallenge = async (challengeId = null) => {
  const params = new URLSearchParams()
  if (challengeId) params.append('challenge_id', challengeId)
  const qs = params.toString()
  const url = qs ? `/training/challenge?${qs}` : '/training/challenge'
  const response = await api.get(url)
  return response.data
}

export const submitTrainingAttempt = async (challengeId, userText) => {
  const response = await api.post('/training/attempt', {
    challenge_id: challengeId,
    user_text: userText,
  })
  return response.data
}

// Privacy chatbot assistant
export const askPrivacyQuestion = async (question, locale = 'IN') => {
  const response = await api.post('/privacy-chat', { question, locale })
  return response.data
}

// Social profile risk analysis (LinkedIn / X)
export const analyzeProfileRisk = async ({ source, identifier, includeRecommendations = true, includeRewrite = true }) => {
  const response = await api.post('/profile-risk', {
    source,
    identifier,
    include_recommendations: includeRecommendations,
    include_rewrite: includeRewrite,
  })
  return response.data
}

export default api
