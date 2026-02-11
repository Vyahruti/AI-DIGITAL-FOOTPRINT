import { Link, useLocation } from 'react-router-dom'
import { Shield, Home, FileSearch, History, MessageCircleQuestion, Target, Github, Bot, Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

const Layout = ({ children }) => {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  
  const isActive = (path) => {
    return location.pathname === path
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-blue-900/50 dark:to-slate-900 text-slate-900 dark:text-slate-200">
      {/* Navigation */}
      <nav className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition group">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Shield className="w-8 h-8 text-blue-500" />
              </motion.div>
              <span className="font-bold text-xl tracking-tight">AI Privacy Analyzer</span>
            </a>
            
            {/* Nav Links */}
            <div className="flex items-center space-x-1">
              <NavLink to="/" icon={Home} label="Home" active={isActive('/')} />
              <NavLink to="/analyze" icon={FileSearch} label="Analyze" active={isActive('/analyze')} />
              <NavLink to="/github" icon={Github} label="GitHub" active={isActive('/github')} />
              <NavLink to="/training" icon={Target} label="Training" active={isActive('/training')} />
              <NavLink to="/assistant" icon={Bot} label="Assistant" active={isActive('/assistant')} />
              <NavLink to="/history" icon={History} label="History" active={isActive('/history')} />
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="ml-2 p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/10 mt-auto bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-slate-600 dark:text-slate-500 text-sm">
            <p>© 2026 AI Privacy Footprint Analyzer - Final Year Project</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
               <span>React</span>
               <span>FastAPI</span>
               <span>spaCy</span>
               <span>LangChain</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

const NavLink = ({ to, icon: Icon, label, active }) => {
  return (
    <a
      href={to}
      target="_blank"
      rel="noopener noreferrer"
      className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        active
          ? 'text-slate-900 dark:text-white'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      {active && (
        <motion.div
            layoutId="navbar-active"
            className="absolute inset-0 bg-blue-100 dark:bg-blue-600/20 border border-blue-300 dark:border-blue-500/30 rounded-lg"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className="relative z-10 flex items-center space-x-2">
         <Icon className="w-5 h-5" />
         <span className="font-medium">{label}</span>
      </span>
    </a>
  )
}

export default Layout
