import { Link, useLocation } from 'react-router-dom'
import { Shield, Home, FileSearch, History, BarChart3 } from 'lucide-react'

const Layout = ({ children }) => {
  const location = useLocation()
  
  const isActive = (path) => {
    return location.pathname === path
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 text-white hover:text-blue-400 transition">
              <Shield className="w-8 h-8" />
              <span className="font-bold text-xl">AI Privacy Analyzer</span>
            </Link>
            
            {/* Nav Links */}
            <div className="flex items-center space-x-1">
              <NavLink to="/" icon={Home} label="Home" active={isActive('/')} />
              <NavLink to="/analyze" icon={FileSearch} label="Analyze" active={isActive('/analyze')} />
              <NavLink to="/history" icon={History} label="History" active={isActive('/history')} />
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-slate-800/50 border-t border-slate-700 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <p>© 2026 AI Privacy Footprint Analyzer - Final Year Project</p>
            <p>Built with React, FastAPI, spaCy, and LangChain</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const NavLink = ({ to, icon: Icon, label, active }) => {
  return (
    <Link
      to={to}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
        active
          ? 'bg-blue-600 text-white'
          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </Link>
  )
}

export default Layout
