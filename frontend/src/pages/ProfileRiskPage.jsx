import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe2, UserCircle2, Link2, Twitter } from 'lucide-react'
import { analyzeProfileRisk } from '../api/client'
import ResultsPage from './ResultsPage'

const ProfileRiskPage = () => {
  const [source, setSource] = useState('LINKEDIN')
  const [identifier, setIdentifier] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const handleAnalyze = async () => {
    if (!identifier.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await analyzeProfileRisk({ source, identifier })
      setResult(data)
    } catch (err) {
      console.error(err)
      setError('Profile analysis failed. For demo mode, try a different input.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      <header className="text-center">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-900/40 border border-indigo-500/40 text-indigo-200 text-xs font-semibold uppercase tracking-wide mb-3">
          <Globe2 className="w-3 h-3 mr-2" /> Social Profile Check
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Check your public footprint
        </h1>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Enter a LinkedIn profile URL or X (Twitter) @username. We’ll simulate
          what an AI privacy engine might see and highlight potential risks.
        </p>
      </header>

      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap gap-3 mb-2">
          <button
            onClick={() => setSource('LINKEDIN')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              source === 'LINKEDIN'
                ? 'bg-sky-600 text-white border-sky-500'
                : 'bg-slate-900/40 text-slate-300 border-slate-600 hover:border-sky-500'
            }`}
          >
            <Link2 className="w-3 h-3" /> LinkedIn URL
          </button>
          <button
            onClick={() => setSource('X_TWITTER')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              source === 'X_TWITTER'
                ? 'bg-slate-100 text-slate-900 border-slate-200'
                : 'bg-slate-900/40 text-slate-300 border-slate-600 hover:border-slate-200'
            }`}
          >
            <Twitter className="w-3 h-3" /> X username (@handle)
          </button>
        </div>

        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            {source === 'LINKEDIN' ? 'LinkedIn profile URL' : 'X username (with or without @)'}
          </label>
          <div className="flex items-center gap-2">
            <div className="flex items-center px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 flex-1">
              <UserCircle2 className="w-4 h-4 text-slate-400 mr-2" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={
                  source === 'LINKEDIN'
                    ? 'https://www.linkedin.com/in/your-profile'
                    : '@username or just username'
                }
                className="bg-transparent border-none outline-none flex-1 text-sm text-white placeholder-slate-500"
                disabled={loading}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={loading || !identifier.trim()}
              onClick={handleAnalyze}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                loading || !identifier.trim()
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {loading ? 'Analyzing…' : 'Check risk'}
            </motion.button>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Demo mode: we do not actually scrape websites. The system generates
            representative text based on your input to demonstrate the risk
            analysis pipeline.
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-red-400 mt-2"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-slate-800/60 border border-slate-700 rounded-xl p-5"
          >
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-indigo-400" />
              Simulated profile analysis
            </h2>
            {/* Reuse ResultsPage layout logic by faking route state would be complex. 
                Here we simply summarize the key parts inline. */}
            <div className="space-y-3 text-sm text-slate-200">
              <p>
                <span className="font-semibold">Platform:</span> {result.source} ·{' '}
                <span className="font-semibold">Identifier:</span> {result.identifier}
              </p>
              <p>
                <span className="font-semibold">Risk score:</span> {result.risk_score.score.toFixed(0)} ({result.risk_score.level})
              </p>
              {result.recommendations?.length > 0 && (
                <div>
                  <div className="font-semibold mb-1">Top recommendations:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {result.recommendations.slice(0, 3).map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default ProfileRiskPage
