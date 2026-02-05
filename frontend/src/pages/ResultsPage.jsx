import { useEffect, useState } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { 
  ArrowLeft, Shield, AlertTriangle, CheckCircle, 
  FileText, Lightbulb, RefreshCw, Download 
} from 'lucide-react'
import { getRiskReport } from '../api/client'

const ResultsPage = () => {
  const { id } = useParams()
  const location = useLocation()
  const [result, setResult] = useState(location.state?.result || null)
  const [loading, setLoading] = useState(!result)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    if (!result) {
      fetchReport()
    }
  }, [id])
  
  const fetchReport = async () => {
    try {
      setLoading(true)
      const data = await getRiskReport(id)
      setResult(data)
    } catch (err) {
      setError('Failed to load report')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading report...</p>
        </div>
      </div>
    )
  }
  
  if (error || !result) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Report Not Found</h2>
        <p className="text-slate-400 mb-6">{error || 'Could not load the analysis report'}</p>
        <Link to="/analyze" className="btn-primary">
          New Analysis
        </Link>
      </div>
    )
  }
  
  const { risk_score, pii_entities, recommendations, safe_rewrite, input_text, processing_time } = result
  
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/analyze" className="flex items-center text-slate-300 hover:text-white transition">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Analyze
        </Link>
        <button className="flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </button>
      </div>
      
      {/* Risk Score Card */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Privacy Risk Analysis</h1>
          <p className="text-slate-400">Processed in {processing_time?.toFixed(2)}s</p>
        </div>
        
        <RiskScoreDisplay score={risk_score} />
      </div>
      
      {/* Detected Entities */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <Shield className="w-6 h-6 mr-2 text-blue-400" />
          Detected Personal Information
        </h2>
        
        {pii_entities && pii_entities.length > 0 ? (
          <div className="space-y-4">
            <HighlightedText text={input_text} entities={pii_entities} />
            <EntitiesTable entities={pii_entities} />
          </div>
        ) : (
          <p className="text-slate-400">No personal information detected</p>
        )}
      </div>
      
      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <Lightbulb className="w-6 h-6 mr-2 text-yellow-400" />
            AI Recommendations
          </h2>
          <ul className="space-y-3">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Before/After Comparison */}
      {safe_rewrite && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <FileText className="w-6 h-6 mr-2 text-green-400" />
            Privacy-Safe Rewrite
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-red-400 mb-2">⚠️ Original (Risky)</h3>
              <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg text-slate-300 text-sm">
                {input_text}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-green-400 mb-2">✅ Safe Version</h3>
              <div className="p-4 bg-green-900/20 border border-green-700/50 rounded-lg text-slate-300 text-sm">
                {safe_rewrite}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const RiskScoreDisplay = ({ score }) => {
  const getRiskColor = (level) => {
    switch (level) {
      case 'LOW': return 'text-green-400'
      case 'MEDIUM': return 'text-yellow-400'
      case 'HIGH': return 'text-red-400'
      default: return 'text-slate-400'
    }
  }
  
  const getRiskBgColor = (level) => {
    switch (level) {
      case 'LOW': return 'bg-green-500'
      case 'MEDIUM': return 'bg-yellow-500'
      case 'HIGH': return 'bg-red-500'
      default: return 'bg-slate-500'
    }
  }
  
  const Icon = score.level === 'LOW' ? CheckCircle : AlertTriangle
  
  return (
    <div className="text-center">
      <Icon className={`w-16 h-16 mx-auto mb-4 ${getRiskColor(score.level)}`} />
      
      <div className="mb-4">
        <div className="text-5xl font-bold text-white mb-2">
          {score.score.toFixed(0)}
        </div>
        <div className={`inline-block px-4 py-1 rounded-full text-lg font-semibold ${getRiskColor(score.level)}`}>
          {score.level} RISK
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="max-w-md mx-auto">
        <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getRiskBgColor(score.level)} transition-all duration-1000 ease-out`}
            style={{ width: `${score.score}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>0 (Safe)</span>
          <span>100 (High Risk)</span>
        </div>
      </div>
      
      <p className="text-slate-400 mt-4">
        ML Confidence: {(score.ml_probability * 100).toFixed(1)}%
      </p>
    </div>
  )
}

const HighlightedText = ({ text, entities }) => {
  if (!entities || entities.length === 0) return <p className="text-slate-300">{text}</p>
  
  // Sort entities by start position
  const sortedEntities = [...entities].sort((a, b) => a.start - b.start)
  
  const getEntityColor = (type) => {
    const colors = {
      'PERSON': 'bg-blue-500/30 border-blue-500',
      'EMAIL_ADDRESS': 'bg-red-500/30 border-red-500',
      'PHONE_NUMBER': 'bg-orange-500/30 border-orange-500',
      'LOCATION': 'bg-purple-500/30 border-purple-500',
      'GPE': 'bg-purple-500/30 border-purple-500',
      'DATE': 'bg-green-500/30 border-green-500',
      'ORGANIZATION': 'bg-yellow-500/30 border-yellow-500',
    }
    return colors[type] || 'bg-slate-500/30 border-slate-500'
  }
  
  let result = []
  let lastIndex = 0
  
  sortedEntities.forEach((entity, i) => {
    // Add text before entity
    if (entity.start > lastIndex) {
      result.push(
        <span key={`text-${i}`} className="text-slate-300">
          {text.substring(lastIndex, entity.start)}
        </span>
      )
    }
    
    // Add highlighted entity
    result.push(
      <span 
        key={`entity-${i}`}
        className={`px-1 border-b-2 ${getEntityColor(entity.type)}`}
        title={entity.type}
      >
        {entity.text}
      </span>
    )
    
    lastIndex = entity.end
  })
  
  // Add remaining text
  if (lastIndex < text.length) {
    result.push(
      <span key="text-end" className="text-slate-300">
        {text.substring(lastIndex)}
      </span>
    )
  }
  
  return (
    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-600">
      <h3 className="text-sm font-semibold text-slate-400 mb-2">Highlighted Text</h3>
      <p className="text-base leading-relaxed">{result}</p>
    </div>
  )
}

const EntitiesTable = ({ entities }) => {
  // Group by type
  const grouped = entities.reduce((acc, entity) => {
    if (!acc[entity.type]) acc[entity.type] = []
    acc[entity.type].push(entity)
    return acc
  }, {})
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-600">
            <th className="text-left py-2 px-4 text-slate-400 font-semibold">Type</th>
            <th className="text-left py-2 px-4 text-slate-400 font-semibold">Detected Items</th>
            <th className="text-left py-2 px-4 text-slate-400 font-semibold">Count</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(grouped).map(([type, items]) => (
            <tr key={type} className="border-b border-slate-700">
              <td className="py-3 px-4 text-slate-300 font-medium">{type}</td>
              <td className="py-3 px-4 text-slate-400">
                {items.map(item => item.text).join(', ')}
              </td>
              <td className="py-3 px-4 text-slate-300">{items.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ResultsPage
