import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import AnalyzePage from './pages/AnalyzePage'
import ResultsPage from './pages/ResultsPage'
import HistoryPage from './pages/HistoryPage'
import TrainingPage from './pages/TrainingPage'
import PrivacyChatPage from './pages/PrivacyChatPage'
import ProfileRiskPage from './pages/ProfileRiskPage'
import LinkedInScanPage from './pages/LinkedInScanPage'
import GitHubScanPage from './pages/GitHubScanPage'
import AssistantPage from './pages/AssistantPage'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/results/:id" element={<ResultsPage />} />
          <Route path="/training" element={<TrainingPage />} />
          <Route path="/profile-risk" element={<ProfileRiskPage />} />
          <Route path="/linkedin" element={<LinkedInScanPage />} />
          <Route path="/github" element={<GitHubScanPage />} />
          <Route path="/assistant" element={<AssistantPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
