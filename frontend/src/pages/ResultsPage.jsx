import { useEffect, useState } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { 
  ArrowLeft, Shield, AlertTriangle, CheckCircle, 
  FileText, Lightbulb, RefreshCw, Download 
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
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

  const handleExport = () => {
    if (!result) return

    const { risk_score, pii_entities, recommendations, safe_rewrite, input_text, processing_time } = result

    const lines = []
    lines.push('AI Privacy Footprint Report')
    lines.push('================================')
    lines.push('')
    if (risk_score) {
      lines.push(`Risk Score: ${risk_score.score?.toFixed ? risk_score.score.toFixed(1) : risk_score.score}`)
      if (risk_score.level) lines.push(`Risk Level: ${risk_score.level}`)
      if (typeof risk_score.ml_probability === 'number') {
        lines.push(`AI Confidence: ${(risk_score.ml_probability * 100).toFixed(0)}%`)
      }
      lines.push('')
    }

    if (typeof processing_time === 'number') {
      lines.push(`Processing Time: ${processing_time.toFixed(2)}s`)
      lines.push('')
    }

    if (pii_entities && pii_entities.length > 0) {
      lines.push('Detected Personal Data:')
      pii_entities.forEach((e, idx) => {
        lines.push(`${idx + 1}. [${e.type}] ${e.text}`)
      })
      lines.push('')
    } else {
      lines.push('Detected Personal Data: None')
      lines.push('')
    }

    if (recommendations && recommendations.length > 0) {
      lines.push('Recommendations:')
      recommendations.forEach((rec, idx) => {
        lines.push(`${idx + 1}. ${rec}`)
      })
      lines.push('')
    }

    if (input_text) {
      lines.push('Original Text:')
      lines.push(input_text)
      lines.push('')
    }

    if (safe_rewrite) {
      lines.push('Safe Rewrite:')
      lines.push(safe_rewrite)
      lines.push('')
    }

    const reportText = lines.join('\n')
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `privacy-report-${id || 'analysis'}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExportPDF = async () => {
    if (!result || !id) return

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
      const response = await fetch(`${API_BASE_URL}/export-pdf/${id}`)
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `privacy-report-${id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('PDF export failed:', error)
      alert('Failed to export PDF. Please try again.')
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <RefreshCw className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading analysis report...</p>
        </motion.div>
      </div>
    )
  }
  
  if (error || !result) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto text-center"
      >
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Report Not Found</h2>
        <p className="text-slate-400 mb-6">{error || 'Could not load the analysis report'}</p>
        <Link to="/analyze" className="btn-primary inline-flex items-center px-6 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition">
          New Analysis
        </Link>
      </motion.div>
    )
  }
  
  const { risk_score, pii_entities, recommendations, safe_rewrite, input_text, processing_time } = result
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/analyze" className="flex items-center text-slate-300 hover:text-white transition group">
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Analyze
        </Link>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition shadow hover:shadow-lg"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export TXT
          </button>
          <button 
            onClick={handleExportPDF}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition shadow hover:shadow-lg"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </button>
        </div>
      </div>
      
      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Score & Stats */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-1 space-y-6"
        >
          {/* Risk Score Card */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-8 shadow-xl">
            <div className="text-center mb-6">
               <h3 className="text-slate-400 uppercase tracking-wider text-sm font-semibold">Privacy Risk Score</h3>
            </div>
            <RiskScoreGauge score={risk_score} />
            <div className="text-center mt-4 text-slate-500 text-sm">
              Processed in {processing_time?.toFixed(2)}s
            </div>
          </div>

          {/* Entity Distribution Chart */}
          {pii_entities && pii_entities.length > 0 && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 shadow-lg">
              <h3 className="text-white font-semibold mb-4 text-center">Entity Breakdown</h3>
              <EntityPieChart entities={pii_entities} />
            </div>
          )}
        </motion.div>

        {/* Right Column: Detailed Info */}
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="md:col-span-2 space-y-6"
        >
          {/* Detected Information */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-400" />
              Detected Personal Data
            </h2>
            
            {pii_entities && pii_entities.length > 0 ? (
              <div className="space-y-6">
                <HighlightedText text={input_text} entities={pii_entities} />
              </div>
             ) : (
               <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-900/30 rounded-lg border border-slate-700/50">
                 <CheckCircle className="w-12 h-12 text-green-500 mb-2" />
                 <p className="text-slate-300">No personal information detected. Great job!</p>
               </div>
             )}
          </div>

           {/* Tabs for Recommendations / Rewrite */}
           <TabbedContent recommendations={recommendations} safe_rewrite={safe_rewrite} original_text={input_text} />

        </motion.div>
      </div>
    </motion.div>
  )
}

const RiskScoreGauge = ({ score }) => {
  const radius = 80;
  const stroke = 12;
  const normalizedScore = Math.min(Math.max(score.score, 0), 100);
  const circumference = normalizedScore * 2 * Math.PI; // For full circle, but we want different visual
  
  // Color logic
  let color = '#22c55e'; // green
  if (score.level === 'MEDIUM') color = '#eab308'; // yellow
  if (score.level === 'HIGH') color = '#ef4444'; // red

  return (
    <div className="relative flex flex-col items-center justify-center py-4">
      <div className="relative w-48 h-48">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="#1e293b"
            strokeWidth={stroke}
            fill="transparent"
          />
          <motion.circle
            initial={{ strokeDasharray: "0 1000" }}
            animate={{ strokeDasharray: `${(normalizedScore / 100) * (2 * Math.PI * radius)} 1000` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            cx="96"
            cy="96"
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            fill="transparent"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-5xl font-bold text-white"
          >
            {score.score.toFixed(0)}
          </motion.span>
          <span className={`text-sm font-bold mt-1 px-2 py-0.5 rounded-full ${color === '#ef4444' ? 'bg-red-500/20 text-red-400' : color === '#eab308' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
            {score.level} RISK
          </span>
        </div>
      </div>
      <p className="text-center text-slate-400 mt-2 text-sm">
        AI Confidence: {(score.ml_probability * 100).toFixed(0)}%
      </p>
    </div>
  )
}

const EntityPieChart = ({ entities }) => {
  // Aggregate data
  const data = Object.values(entities.reduce((acc, curr) => {
     if (!acc[curr.type]) acc[curr.type] = { name: curr.type, value: 0 };
     acc[curr.type].value += 1;
     return acc;
  }, {}));

  const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6'];

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem' }} 
            itemStyle={{ color: '#e2e8f0' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-2 mt-2">
         {data.map((entry, index) => (
           <div key={entry.name} className="flex items-center text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              {entry.name} ({entry.value})
           </div>
         ))}
      </div>
    </div>
  )
}

const TabbedContent = ({ recommendations, safe_rewrite, original_text }) => {
  const [activeTab, setActiveTab] = useState('recommendations');

  // If no recommendations, default to rewrite
  useEffect(() => {
    if ((!recommendations || recommendations.length === 0) && safe_rewrite) {
      setActiveTab('rewrite');
    }
  }, [recommendations, safe_rewrite]);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden shadow-xl">
       <div className="flex border-b border-slate-700">
         <button 
           onClick={() => setActiveTab('recommendations')}
           className={`flex-1 py-4 text-center font-medium transition ${activeTab === 'recommendations' ? 'bg-slate-700/50 text-white border-b-2 border-blue-500' : 'text-slate-400 hover:text-white hover:bg-slate-700/30'}`}
         >
           Recommendations
         </button>
         <button 
           onClick={() => setActiveTab('rewrite')}
           className={`flex-1 py-4 text-center font-medium transition ${activeTab === 'rewrite' ? 'bg-slate-700/50 text-white border-b-2 border-blue-500' : 'text-slate-400 hover:text-white hover:bg-slate-700/30'}`}
         >
           Safe Rewrite
         </button>
       </div>

       <div className="p-6 min-h-[300px]">
         <AnimatePresence mode="wait">
            {activeTab === 'recommendations' && (
              <motion.div
                key="recommendations"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                 <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
                    Actionable Insights
                  </h2>
                  {recommendations && recommendations.length > 0 ? (
                    <ul className="space-y-3">
                      {recommendations.map((rec, i) => (
                        <motion.li 
                          key={i} 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-start bg-slate-900/30 p-3 rounded-lg"
                        >
                          <CheckCircle className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-300">{rec}</span>
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-400">No specific recommendations found.</p>
                  )}
              </motion.div>
            )}

            {activeTab === 'rewrite' && (
               <motion.div
                key="rewrite"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
               >
                 <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-green-400" />
                    Before & After Comparison
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <span className="text-xs font-bold text-red-400 uppercase tracking-wide">Original</span>
                       <div className="p-4 bg-red-900/10 border border-red-500/20 rounded-lg text-slate-300 text-sm leading-relaxed">
                          {original_text}
                       </div>
                    </div>
                    <div className="space-y-2">
                       <span className="text-xs font-bold text-green-400 uppercase tracking-wide">Safe Version</span>
                       <div className="p-4 bg-green-900/10 border border-green-500/20 rounded-lg text-slate-300 text-sm leading-relaxed">
                          {safe_rewrite || "No rewrite needed."}
                       </div>
                    </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
       </div>
    </div>
  )
}

const HighlightedText = ({ text, entities }) => {
  // Same logic as before but wrapped in a scrollable div
  if (!entities || entities.length === 0) return <p className="text-slate-300">{text}</p>
  
  const sortedEntities = [...entities].sort((a, b) => a.start - b.start)
  const getEntityColor = (type) => {
    const colors = {
      'PERSON': 'bg-blue-500/30 border-blue-500 text-blue-200',
      'EMAIL_ADDRESS': 'bg-red-500/30 border-red-500 text-red-200',
      'PHONE_NUMBER': 'bg-orange-500/30 border-orange-500 text-orange-200',
      'LOCATION': 'bg-purple-500/30 border-purple-500 text-purple-200',
      'GPE': 'bg-purple-500/30 border-purple-500 text-purple-200',
      'DATE': 'bg-green-500/30 border-green-500 text-green-200',
      'ORGANIZATION': 'bg-yellow-500/30 border-yellow-500 text-yellow-200',
    }
    return colors[type] || 'bg-slate-500/30 border-slate-500 text-slate-200'
  }
  
  let result = []
  let lastIndex = 0
  
  sortedEntities.forEach((entity, i) => {
    if (entity.start > lastIndex) {
      result.push(<span key={`text-${i}`} className="text-slate-300">{text.substring(lastIndex, entity.start)}</span>)
    }
    result.push(
      <span 
        key={`entity-${i}`}
        className={`px-1 rounded border-b-2 cursor-help transition-all hover:opacity-80 ${getEntityColor(entity.type)}`}
        title={`${entity.type}: ${entity.text}`}
      >
        {entity.text}
      </span>
    )
    lastIndex = entity.end
  })
  
  if (lastIndex < text.length) {
    result.push(<span key="text-end" className="text-slate-300">{text.substring(lastIndex)}</span>)
  }
  
  return (
    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-600 max-h-64 overflow-y-auto">
      <p className="text-base leading-loose whitespace-pre-wrap">{result}</p>
    </div>
  )
}

export default ResultsPage
