import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileSearch, Upload, Loader2, AlertCircle } from 'lucide-react'
import { analyzeText } from '../api/client'

const AnalyzePage = () => {
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError('Please enter some text to analyze')
      return
    }
    
    if (text.length < 10) {
      setError('Text must be at least 10 characters long')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await analyzeText(text, {
        includeRecommendations: true,
        includeRewrite: true
      })
      
      // Navigate to results page
      navigate(`/results/${result.analysis_id}`, { state: { result } })
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Please try again.')
      console.error('Analysis error:', err)
    } finally {
      setLoading(false)
    }
  }
  
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      setText(event.target.result)
    }
    reader.readAsText(file)
  }
  
  const loadSample = () => {
    setText(`Hey everyone! I'm John Doe, living in New York City. 
Feel free to reach me at john.doe@email.com or call me at (555) 123-4567.
I work at TechCorp and my address is 123 Main Street, Manhattan, NY 10001.
Born on January 15, 1990. Looking forward to connecting!`)
  }
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          Analyze Your Privacy Footprint
        </h1>
        <p className="text-slate-300 text-lg">
          Paste your text below to detect privacy risks and get AI-powered recommendations
        </p>
      </div>
      
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-8">
        {/* Textarea */}
        <div className="mb-6">
          <label className="block text-white font-semibold mb-2">
            Input Text
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your social media post, bio, or any public text here..."
            className="w-full h-64 px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            disabled={loading}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-slate-400 text-sm">
              {text.length} / 10,000 characters
            </span>
            <button
              onClick={loadSample}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              disabled={loading}
            >
              Load Sample Text
            </button>
          </div>
        </div>
        
        {/* File Upload */}
        <div className="mb-6">
          <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-slate-500 transition">
            <Upload className="w-5 h-5 text-slate-400 mr-2" />
            <span className="text-slate-400">Or upload a text file (.txt)</span>
            <input
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="hidden"
              disabled={loading}
            />
          </label>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-600 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-red-200">{error}</p>
          </div>
        )}
        
        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={loading || !text.trim()}
          className={`w-full py-4 rounded-lg font-semibold text-lg flex items-center justify-center transition ${
            loading || !text.trim()
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-6 h-6 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <FileSearch className="w-6 h-6 mr-2" />
              Analyze Privacy Risk
            </>
          )}
        </button>
        
        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
          <h3 className="text-blue-300 font-semibold mb-2">What we analyze:</h3>
          <ul className="text-blue-200 text-sm space-y-1">
            <li>• Personal names, emails, phone numbers</li>
            <li>• Locations, addresses, organizations</li>
            <li>• Dates, sensitive keywords</li>
            <li>• Overall privacy risk score (0-100)</li>
            <li>• AI-generated recommendations & safe rewrites</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AnalyzePage
