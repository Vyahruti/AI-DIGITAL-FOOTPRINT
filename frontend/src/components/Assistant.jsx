import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, Sparkles, MessageCircle } from 'lucide-react'

const Assistant = () => {
  const [message, setMessage] = useState('')
  const [chat, setChat] = useState([])
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat])

  const sendMessage = async () => {
    if (!message.trim()) return

    const userMessage = message.trim()
    const newChat = [...chat, { user: userMessage }]
    setChat(newChat)
    setMessage('')
    setLoading(true)

    try {
      const res = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      })

      const data = await res.json()
      setChat([...newChat, { bot: data.reply }])
    } catch (error) {
      console.error(error)
      setChat([
        ...newChat,
        { bot: 'Sorry, unable to connect to the assistant. Please try again.' }
      ])
    }

    setLoading(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <header className="mb-8 text-center">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/40 text-purple-200 text-xs font-semibold uppercase tracking-wide mb-3">
          <Sparkles className="w-3 h-3 mr-2" /> AI Privacy Assistant
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          SafeBuddy – Your Privacy Advisor
        </h1>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Ask me anything about online privacy, cyber safety, and protecting your personal information
        </p>
      </header>

      <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">SafeBuddy</h2>
            <p className="text-purple-100 text-xs">Online and ready to help</p>
          </div>
        </div>

        {/* Chat Box */}
        <div className="h-[500px] overflow-y-auto bg-slate-900/40 p-6 space-y-4">
          {chat.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                <MessageCircle className="w-10 h-10 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Start a conversation</h3>
                <p className="text-slate-400 text-sm max-w-md">
                  Ask me about privacy settings, safe browsing, social media safety, or any cybersecurity concern
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                {[
                  'How can I protect my social media privacy?',
                  'What are common phishing signs?',
                  'How to create strong passwords?',
                  'Is it safe to share my location online?'
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMessage(suggestion)}
                    className="px-4 py-2 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-600 rounded-lg text-xs text-slate-300 hover:text-white transition-colors text-left"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {chat.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {c.user && (
                  <div className="flex justify-end">
                    <div className="max-w-[80%] bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-lg">
                      <p className="text-sm whitespace-pre-wrap">{c.user}</p>
                    </div>
                  </div>
                )}
                {c.bot && (
                  <div className="flex justify-start">
                    <div className="flex gap-3 max-w-[80%]">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-lg">
                        <p className="text-sm text-slate-200 whitespace-pre-wrap">{c.bot}</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-slate-800/60 border border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef}></div>
        </div>

        {/* Input Area */}
        <div className="bg-slate-800/60 border-t border-slate-700 p-4">
          <div className="flex gap-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              rows={1}
              placeholder="Ask about privacy, safety, or security..."
              className="flex-1 px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60 resize-none"
              disabled={loading}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              disabled={loading || !message.trim()}
              className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
                loading || !message.trim()
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500'
              }`}
            >
              <Send className="w-5 h-5" />
              Send
            </motion.button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default Assistant
