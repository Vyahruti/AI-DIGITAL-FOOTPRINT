import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { History, Trash2, ExternalLink, AlertCircle } from 'lucide-react'
import { getHistory, deleteAnalysis } from '../api/client'
import { format } from 'date-fns'

const HistoryPage = () => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  
  useEffect(() => {
    fetchHistory()
  }, [])
  
  const fetchHistory = async () => {
    try {
      setLoading(true)
      const data = await getHistory()
      setHistory(data.items)
    } catch (err) {
      console.error('Failed to fetch history:', err)
    } finally {
      setLoading(false)
    }
  }
  
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this analysis?')) return
    
    try {
      await deleteAnalysis(id)
      setHistory(history.filter(item => item.analysis_id !== id))
    } catch (err) {
      console.error('Failed to delete:', err)
      alert('Failed to delete analysis')
    }
  }
  
  const filteredHistory = filter === 'ALL' 
    ? history 
    : history.filter(item => item.risk_level === filter)
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Analysis History</h1>
          <p className="text-slate-400">View and manage your past privacy analyses</p>
        </div>
        <Link
          to="/analyze"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
        >
          New Analysis
        </Link>
      </div>
      
      {/* Filters */}
      <div className="flex space-x-2 mb-6">
        <FilterButton active={filter === 'ALL'} onClick={() => setFilter('ALL')}>
          All ({history.length})
        </FilterButton>
        <FilterButton active={filter === 'LOW'} onClick={() => setFilter('LOW')} color="green">
          Low Risk
        </FilterButton>
        <FilterButton active={filter === 'MEDIUM'} onClick={() => setFilter('MEDIUM')} color="yellow">
          Medium Risk
        </FilterButton>
        <FilterButton active={filter === 'HIGH'} onClick={() => setFilter('HIGH')} color="red">
          High Risk
        </FilterButton>
      </div>
      
      {/* History List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-400">Loading history...</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700">
          <History className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No analyses yet</h3>
          <p className="text-slate-400 mb-6">Start analyzing text to see your history here</p>
          <Link to="/analyze" className="btn-primary">
            Start Analysis
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map(item => (
            <HistoryCard 
              key={item.analysis_id} 
              item={item} 
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const FilterButton = ({ active, onClick, children, color = 'blue' }) => {
  const colorClasses = {
    blue: active ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white',
    green: active ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white',
    yellow: active ? 'bg-yellow-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white',
    red: active ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white',
  }
  
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition ${colorClasses[color]}`}
    >
      {children}
    </button>
  )
}

const HistoryCard = ({ item, onDelete }) => {
  const getRiskBadge = (level) => {
    const badges = {
      'LOW': 'badge badge-low',
      'MEDIUM': 'badge badge-medium',
      'HIGH': 'badge badge-high',
    }
    return badges[level] || 'badge'
  }
  
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 hover:border-slate-600 transition">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <span className={getRiskBadge(item.risk_level)}>
              {item.risk_level} RISK
            </span>
            <span className="text-slate-500 text-sm">
              {format(new Date(item.timestamp), 'MMM d, yyyy h:mm a')}
            </span>
          </div>
          
          <p className="text-slate-300 mb-2 line-clamp-2">
            {item.text_preview}...
          </p>
          
          <div className="flex items-center space-x-4 text-sm text-slate-400">
            <span>Score: {item.risk_score.toFixed(0)}/100</span>
            <span>•</span>
            <span>{item.num_entities} entities detected</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <Link
            to={`/results/${item.analysis_id}`}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            title="View Details"
          >
            <ExternalLink className="w-5 h-5" />
          </Link>
          <button
            onClick={() => onDelete(item.analysis_id)}
            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default HistoryPage
