import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileSearch, Upload, Loader2, AlertCircle, Wand2, RefreshCw, X, Sparkles, Check, Copy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { analyzeText } from '../api/client'

const AnalyzePage = () => {
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isFocused, setIsFocused] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  
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

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type === "text/plain") {
        const reader = new FileReader()
        reader.onload = (event) => {
          setText(event.target.result)
        }
        reader.readAsText(file)
      }
    }
  }
  
  const loadSample = () => {
    setText(`Hey everyone! I'm John Doe, living in New York City. 
Feel free to reach me at john.doe@email.com or call me at (555) 123-4567.
I work at TechCorp and my address is 123 Main Street, Manhattan, NY 10001.
Born on January 15, 1990. Looking forward to connecting!`)
  }

  const clearText = () => {
    setText('')
    setError(null)
  }

  const getCharCountColor = () => {
    const length = text.length
    if (length > 8000) return 'text-red-400'
    if (length > 5000) return 'text-orange-400'
    if (length > 2000) return 'text-yellow-400'
    return 'text-blue-400'
  }
  
  return (
    <div className="max-w-5xl mx-auto relative">
      {/* Floating Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 80, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 relative z-10"
      >
        <motion.div
          animate={{ 
            boxShadow: [
              "0 0 20px rgba(59, 130, 246, 0.3)",
              "0 0 40px rgba(168, 85, 247, 0.5)",
              "0 0 20px rgba(59, 130, 246, 0.3)",
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="inline-block mb-4"
        >
          <FileSearch className="w-16 h-16 text-blue-500 mx-auto" />
        </motion.div>
        <h1 className="text-5xl font-black bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
          Analyze Your Privacy Footprint
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-lg max-w-2xl mx-auto">
          Paste your text below to detect privacy risks and get AI-powered recommendations
        </p>
      </motion.div>
      
      {/* Main Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-2xl relative overflow-hidden"
      >
        
        {/* Loading Overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center rounded-3xl"
            >
              <div className="relative w-32 h-32 mb-6">
                <motion.div 
                  className="absolute inset-0 border-4 border-blue-500/20 rounded-full"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div 
                  className="absolute inset-0 border-t-4 border-r-4 border-blue-500 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                <motion.div 
                  className="absolute inset-0 border-b-4 border-l-4 border-purple-500 rounded-full"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <FileSearch className="absolute inset-0 m-auto w-12 h-12 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Analyzing Privacy Risks...</h3>
              <p className="text-slate-600 dark:text-slate-300">Scanning for PII, estimating risk, generating insights</p>
              
              {/* Progress dots */}
              <div className="flex gap-2 mt-6">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 bg-blue-500 rounded-full"
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Textarea Section */}
        <div className="mb-6 relative">
          <div className="flex justify-between items-end mb-3">
            <motion.label 
              className="text-slate-900 dark:text-white font-bold text-lg"
              animate={{ y: isFocused && text ? -5 : 0 }}
            >
              {isFocused && text ? '✨ Your Text' : 'Input Text'}
            </motion.label>
            <div className="flex items-center gap-4">
              <span className={`text-sm font-semibold ${getCharCountColor()}`}>
                {text.length.toLocaleString()} / 10,000
              </span>
              {text && (
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={clearText}
                  className="text-slate-500 hover:text-red-500 transition"
                  title="Clear text"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          </div>
          
          <div className="relative group">
            {/* Animated gradient border */}
            {isFocused && (
              <motion.div
                layoutId="textarea-border"
                className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-75"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            )}
            
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="✍️ Paste your social media post, bio, or any public text here..."
              className="relative w-full h-64 px-6 py-4 bg-slate-50 dark:bg-slate-900/70 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-transparent transition-all resize-none shadow-inner font-mono text-sm"
              disabled={loading}
              maxLength={10000}
            />
            
            {/* Word count badge */}
            {text && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 right-4 px-3 py-1 bg-blue-500/90 backdrop-blur text-white text-xs font-bold rounded-full"
              >
                {text.split(/\s+/).filter(w => w).length} words
              </motion.div>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadSample}
              className="flex items-center px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-sm font-semibold transition"
              disabled={loading}
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Load Sample Text
            </motion.button>
            
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Press <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs">Ctrl</kbd> + <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs">Enter</kbd> to analyze
            </div>
          </div>
        </div>
        
        {/* File Upload Area */}
        <div className="mb-8">
          <label 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`group relative flex flex-col items-center justify-center w-full min-h-[120px] border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden ${
              dragActive 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105' 
                : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
             {/* Animated dashed border rotation */}
             <motion.div
               animate={{ rotate: dragActive ? 360 : 0 }}
               transition={{ duration: 2, repeat: dragActive ? Infinity : 0, ease: "linear" }}
               className="absolute inset-0 rounded-2xl"
               style={{ 
                 background: dragActive ? 'conic-gradient(from 0deg, transparent, rgba(59, 130, 246, 0.3), transparent)' : 'none'
               }}
             />
             
             {/* Particles on hover */}
             {dragActive && (
               <>
                 {[...Array(8)].map((_, i) => (
                   <motion.div
                     key={i}
                     initial={{ scale: 0, opacity: 0 }}
                     animate={{ 
                       scale: [0, 1, 0],
                       opacity: [0, 1, 0],
                       x: Math.cos(i * 45 * Math.PI / 180) * 50,
                       y: Math.sin(i * 45 * Math.PI / 180) * 50,
                     }}
                     transition={{ duration: 1, repeat: Infinity }}
                     className="absolute w-2 h-2 bg-blue-500 rounded-full"
                   />
                 ))}
               </>
             )}
             
             <div className="flex flex-col items-center justify-center py-6 relative z-10">
                <motion.div
                  animate={{ y: dragActive ? [-5, 5, -5] : 0 }}
                  transition={{ duration: 0.6, repeat: dragActive ? Infinity : 0 }}
                >
                  <Upload className={`w-10 h-10 mb-3 transition-colors ${
                    dragActive ? 'text-blue-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-500'
                  }`} />
                </motion.div>
                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                  {dragActive ? (
                    <span className="text-blue-600 dark:text-blue-400 font-bold">📂 Drop your file here!</span>
                  ) : (
                    <>
                      <span className="font-bold text-blue-600 dark:text-blue-400">Click to upload</span> or drag and drop
                    </>
                  )}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">.txt files supported • Max 10,000 characters</p>
             </div>
             
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
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-500/50 rounded-xl flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 dark:text-red-200 font-medium">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Analyze Button */}
        <motion.button
          whileHover={{ scale: text.trim() ? 1.02 : 1 }}
          whileTap={{ scale: text.trim() ? 0.98 : 1 }}
          onClick={handleAnalyze}
          disabled={loading || !text.trim()}
          className={`relative w-full py-5 rounded-2xl font-bold text-xl flex items-center justify-center shadow-2xl transition-all overflow-hidden ${
            loading || !text.trim()
              ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-blue-500/50'
          }`}
        >
          {/* Shimmer effect */}
          {text.trim() && !loading && (
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
            />
          )}
          
          {/* Button content */}
          <span className="relative z-10 flex items-center">
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 mr-3" />
                Analyze Privacy Risk
              </>
            )}
          </span>
        </motion.button>
        
        {/* Info Box */}
        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700/50 grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-xl p-5 border border-blue-100 dark:border-blue-500/20"
          >
             <h3 className="text-slate-900 dark:text-white font-bold mb-2 flex items-center text-lg">
               <motion.div
                 animate={{ rotate: 360 }}
                 transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
               >
                 <RefreshCw className="w-5 h-5 mr-2 text-blue-500" />
               </motion.div>
               How it works
             </h3>
             <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Our multi-layer AI engine combines <strong>NLP</strong> for entity detection, <strong>ML</strong> for risk scoring, and <strong>LLMs</strong> for contextual recommendations.
             </p>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-xl p-5 border border-green-100 dark:border-green-500/20"
          >
            <h3 className="text-slate-900 dark:text-white font-bold mb-3 text-sm uppercase tracking-wider flex items-center">
              <Check className="w-4 h-4 mr-2 text-green-500" />
              Detection Coverage
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {['Names', 'Emails', 'Phones', 'Locations', 'Dates', 'SSNs', 'Addresses', 'Credit Cards'].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center text-slate-700 dark:text-slate-300 text-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2" />
                  {item}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default AnalyzePage
