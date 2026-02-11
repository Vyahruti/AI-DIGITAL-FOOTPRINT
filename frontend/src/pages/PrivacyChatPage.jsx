import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircleQuestion, Send, ShieldCheck } from 'lucide-react'
import { askPrivacyQuestion } from '../api/client'

const PrivacyChatPage = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'In general, be careful with sharing government IDs (like Aadhaar), live or precise locations, work IDs, and financial details on chat apps or social media. Prefer official apps or websites with two-factor authentication for sensitive actions, and review privacy settings on each platform you use.',
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage = { sender: 'user', text: inputValue }
    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setLoading(true)
    setError(null)

    try {
      const data = await askPrivacyQuestion(inputValue)
      const assistantMessage = { sender: 'assistant', text: data.answer }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      console.error(err)
      setError('Could not get an answer right now. Please try again.')
      const errorMessage = {
        sender: 'assistant',
        text: 'Sorry, I ran into an error. Please try again.',
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <header className="mb-8 text-center">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-900/40 border border-emerald-500/40 text-emerald-200 text-xs font-semibold uppercase tracking-wide mb-3">
          <MessageCircleQuestion className="w-3 h-3 mr-2" /> Privacy Assistant
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Ask about online privacy
        </h1>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Not sure if it’s safe to post something? Ask a question and get
          practical, human-readable guidance before you share.
        </p>
      </header>

      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
        <div className="space-y-4 h-96 overflow-y-auto pr-2">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex gap-3 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-8 h-8 bg-emerald-600 rounded-full flex-shrink-0 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-md p-3 rounded-xl ${
                    msg.sender === 'user'
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-900/80 text-slate-300'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 justify-start"
            >
              <div className="w-8 h-8 bg-emerald-600 rounded-full flex-shrink-0 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="max-w-md p-3 rounded-xl bg-slate-900/80">
                <p className="text-sm text-slate-400 italic">Thinking...</p>
              </div>
            </motion.div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              rows={2}
              maxLength={1000}
              placeholder="Ask a question..."
              className="w-full px-3 py-2 pr-12 rounded-lg bg-slate-900/50 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 resize-none"
              disabled={loading}
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading || !inputValue.trim()}
              onClick={handleSendMessage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-white disabled:text-slate-500 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-red-400 mt-2 text-center"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default PrivacyChatPage
