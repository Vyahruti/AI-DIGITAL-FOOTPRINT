import { useState } from 'react';
import { Github, AlertTriangle, Shield, Code, GitCommit, FileCode } from 'lucide-react';
import apiClient from '../api/client';

export default function GitHubScanPage() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleScan = async () => {
    if (!username.trim()) {
      setError('Please enter a GitHub username');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiClient.post('/analyze-github', {
        username: username.trim(),
        github_token: null,
        include_recommendations: true,
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze GitHub profile. Please check the username and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    if (level.includes('LOW')) return 'text-green-400';
    if (level.includes('MEDIUM')) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSeverityBadge = (severity) => {
    const colors = {
      critical: 'bg-red-900/30 text-red-400 border-red-700/50',
      high: 'bg-orange-900/30 text-orange-400 border-orange-700/50',
      medium: 'bg-yellow-900/30 text-yellow-400 border-yellow-700/50',
      low: 'bg-blue-900/30 text-blue-400 border-blue-700/50',
    };
    return colors[severity] || colors.medium;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-2xl">
              <Github className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
            GitHub Privacy Scanner
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Scan your GitHub profile for exposed secrets, API keys, and privacy risks using GitHub's official API
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 mb-8">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-300">
              GitHub Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleScan()}
              placeholder="octocat"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-gray-500"
              disabled={loading}
            />
            <p className="mt-2 text-sm text-gray-400">
              Enter a GitHub username (e.g., <span className="text-purple-400">torvalds</span>, <span className="text-purple-400">github</span>)
            </p>
          </div>

          <button
            onClick={handleScan}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Scanning GitHub Profile...
              </>
            ) : (
              <>
                <Github className="w-5 h-5 mr-2" />
                Scan GitHub Profile
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-8">
            <p className="text-red-400 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              {error}
            </p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Profile Overview */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Privacy Risk Score */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Shield className="mr-3 text-purple-400" />
                  Privacy Risk Score
                </h2>
                
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-6xl font-bold mb-2 ${getRiskColor(result.privacy_score.level)}`}>
                      {result.privacy_score.score}
                    </div>
                    <div className="text-2xl font-semibold mb-2">
                      <span className={getRiskColor(result.privacy_score.level)}>
                        {result.privacy_score.level}
                      </span>
                    </div>
                    <p className="text-gray-400">out of {result.privacy_score.max_score}</p>
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Github className="mr-3 text-purple-400" />
                  Profile Info
                </h2>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-sm">Username</p>
                    <p className="text-white font-medium">@{result.username}</p>
                  </div>
                  {result.profile.name && (
                    <div>
                      <p className="text-gray-400 text-sm">Name</p>
                      <p className="text-white font-medium">{result.profile.name}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-gray-400 text-sm">Public Repos</p>
                      <p className="text-white font-medium">{result.profile.public_repos}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Followers</p>
                      <p className="text-white font-medium">{result.profile.followers}</p>
                    </div>
                  </div>
                  {result.profile.location && (
                    <div>
                      <p className="text-gray-400 text-sm">Location</p>
                      <p className="text-white font-medium">{result.profile.location}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Exposed Secrets - CRITICAL */}
            {result.exposed_secrets && result.exposed_secrets.length > 0 && (
              <div className="bg-red-900/20 backdrop-blur-sm rounded-2xl p-8 border-2 border-red-700/50">
                <h2 className="text-2xl font-bold mb-6 flex items-center text-red-400">
                  <AlertTriangle className="mr-3" />
                  🔴 CRITICAL: Exposed Secrets ({result.exposed_secrets.length})
                </h2>
                
                <div className="space-y-4">
                  {result.exposed_secrets.map((secret, index) => (
                    <div key={index} className="bg-red-900/30 border border-red-700/50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityBadge(secret.severity)}`}>
                              {secret.severity.toUpperCase()}
                            </span>
                            <span className="text-red-400 font-semibold uppercase text-sm">
                              {secret.type.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-white font-medium mb-1">{secret.message}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center">
                              <Code className="w-4 h-4 mr-1" />
                              {secret.repo}
                            </span>
                            <span className="flex items-center">
                              <FileCode className="w-4 h-4 mr-1" />
                              {secret.file}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exposed Emails */}
            {result.commit_emails && result.commit_emails.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-yellow-700/50">
                <h2 className="text-2xl font-bold mb-6 flex items-center text-yellow-400">
                  <GitCommit className="mr-3" />
                  Emails in Commit History ({result.commit_emails.length})
                </h2>
                
                <div className="space-y-2">
                  {result.commit_emails.map((email, index) => (
                    <div key={index} className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3">
                      <p className="text-white font-mono">{email}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy Issues */}
            {result.privacy_issues && result.privacy_issues.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <AlertTriangle className="mr-3 text-yellow-400" />
                  Privacy Issues ({result.privacy_issues.length})
                </h2>
                
                <div className="space-y-3">
                  {result.privacy_issues.map((issue, index) => (
                    <div key={index} className={`rounded-lg p-4 border ${getSeverityBadge(issue.severity)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium mb-1">{issue.message}</p>
                          <p className="text-sm opacity-75">Location: {issue.location}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <span className="mr-3">💡</span>
                  Recommendations
                </h2>
                
                <div className="space-y-3">
                  {result.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start bg-purple-900/20 border border-purple-700/30 rounded-lg p-4">
                      <span className="text-purple-400 mr-3 mt-1">•</span>
                      <p className="text-gray-200">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Repositories Scanned */}
            {result.repositories && result.repositories.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Code className="mr-3 text-purple-400" />
                  Repositories Scanned ({result.repositories.length})
                </h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {result.repositories.map((repo, index) => (
                    <div key={index} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                      <p className="text-white font-semibold mb-1">{repo.name}</p>
                      {repo.description && (
                        <p className="text-gray-400 text-sm">{repo.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
