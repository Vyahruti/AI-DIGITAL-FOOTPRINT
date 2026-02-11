import { useState } from 'react';
import apiClient from '../api/client';

export default function LinkedInScanPage() {
  const [profileUrl, setProfileUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!profileUrl.trim()) {
      setError('Please enter a LinkedIn profile URL');
      return;
    }

    if (!profileUrl.includes('linkedin.com')) {
      setError('Please enter a valid LinkedIn profile URL');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiClient.post('/analyze-linkedin', {
        profile_url: profileUrl,
        include_recommendations: true,
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze LinkedIn profile. The profile may be private or require login.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    if (level.includes('LOW')) return 'text-green-400';
    if (level.includes('MEDIUM')) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSeverityColor = (severity) => {
    if (severity === 'low') return 'bg-green-900/30 text-green-400';
    if (severity === 'medium') return 'bg-yellow-900/30 text-yellow-400';
    return 'bg-red-900/30 text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            LinkedIn Privacy Scanner
          </h1>
          <p className="text-gray-300 text-lg">
            Analyze your LinkedIn profile for privacy risks and exposed personal information
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 mb-8">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-300">
              LinkedIn Profile URL
            </label>
            <input
              type="text"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              placeholder="https://www.linkedin.com/in/your-profile"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-500"
              disabled={loading}
            />
            <p className="mt-2 text-sm text-gray-400">
              Enter the full URL of a public LinkedIn profile (e.g., https://www.linkedin.com/in/username)
            </p>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing LinkedIn Profile...
              </span>
            ) : (
              'Scan LinkedIn Profile'
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-8">
            <p className="text-red-400">⚠️ {error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Profile Overview */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <span className="mr-3">👤</span>
                Profile Overview
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {result.name && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Name</p>
                    <p className="text-white font-medium">{result.name}</p>
                  </div>
                )}
                {result.headline && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Headline</p>
                    <p className="text-white font-medium">{result.headline}</p>
                  </div>
                )}
                {result.location && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Location</p>
                    <p className="text-white font-medium">{result.location}</p>
                  </div>
                )}
              </div>

              {result.about && (
                <div className="mt-6">
                  <p className="text-gray-400 text-sm mb-2">About Section</p>
                  <div className="bg-slate-900/50 rounded-lg p-4 max-h-40 overflow-y-auto">
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{result.about}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Privacy Risk Score */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <span className="mr-3">🎯</span>
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

            {/* Exposed PII */}
            {result.exposed_pii && result.exposed_pii.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-red-700/50">
                <h2 className="text-2xl font-bold mb-6 flex items-center text-red-400">
                  <span className="mr-3">🔴</span>
                  Exposed Personal Information ({result.exposed_pii.length})
                </h2>
                
                <div className="space-y-4">
                  {result.exposed_pii.map((pii, index) => (
                    <div key={index} className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-red-400 font-semibold uppercase text-sm mb-1">
                            {pii.type}
                          </p>
                          <p className="text-white font-mono">{pii.value}</p>
                          <p className="text-gray-400 text-sm mt-1">Found in: {pii.location}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy Issues */}
            {result.privacy_issues && result.privacy_issues.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <span className="mr-3">⚠️</span>
                  Privacy Issues ({result.privacy_issues.length})
                </h2>
                
                <div className="space-y-3">
                  {result.privacy_issues.map((issue, index) => (
                    <div key={index} className={`rounded-lg p-4 ${getSeverityColor(issue.severity)}`}>
                      <p className="font-medium">{issue.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Public Visibility */}
            {result.public_visibility && Object.keys(result.public_visibility).length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <span className="mr-3">👁️</span>
                  Public Visibility
                </h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(result.public_visibility).map(([field, isVisible]) => (
                    <div key={field} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3">
                      <span className="capitalize text-gray-300">{field.replace('_', ' ')}</span>
                      {isVisible ? (
                        <span className="text-green-400 font-semibold">✓ Visible</span>
                      ) : (
                        <span className="text-gray-500">✗ Hidden</span>
                      )}
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
                    <div key={index} className="flex items-start bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                      <span className="text-blue-400 mr-3 mt-1">•</span>
                      <p className="text-gray-200">{rec}</p>
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
