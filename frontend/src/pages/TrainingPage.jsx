import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Sparkles, ArrowRight, Trophy, Star, Target, Check, X } from 'lucide-react'
import { submitTrainingAttempt } from '../api/client'

const QUIZ_CHALLENGES = [
  {
    id: 1,
    difficulty: 'Easy',
    prompt: 'Remove sensitive personal information from this post',
    risky_text: 'Hi! I\'m Sarah from New York. Call me at 555-1234!',
    tips: ['Remove exact names', 'Remove phone numbers', 'Use general locations']
  },
  {
    id: 2,
    difficulty: 'Easy',
    prompt: 'Make this birthday post privacy-safe',
    risky_text: 'Happy birthday to my son James! He turns 8 today, born on March 15, 2016!',
    tips: ['Avoid exact dates of birth', 'Use general age references']
  },
  {
    id: 3,
    difficulty: 'Medium',
    prompt: 'Protect work and contact details in this introduction',
    risky_text: 'Hey everyone! I\'m Rahul Sharma, living at 23/7 MG Road, Bengaluru. Here\'s my Aadhaar 1234-5678-9012 and PAN ABCTY1234Z so clients can verify me. You can also call me on 98765-43210 anytime!',
    tips: ['Remove government IDs completely', 'Generalize addresses', 'Remove phone numbers']
  },
  {
    id: 4,
    difficulty: 'Medium',
    prompt: 'Rewrite this travel post without revealing your exact location',
    risky_text: 'Currently at Dubai International Airport, Terminal 3, Gate B7. Flight EK-505 to Mumbai delayed by 2 hours. Staying at Hilton Garden Inn, room 402.',
    tips: ['Use city names instead of exact locations', 'Avoid gate/room numbers', 'Keep general travel updates']
  },
  {
    id: 5,
    difficulty: 'Medium',
    prompt: 'Make this job application post safer',
    risky_text: 'Just applied to Google! My employee ID at current company is EMP-2024-1156. Email me at john.doe@company.com or call 9876543210.',
    tips: ['Remove employee IDs', 'Remove personal email addresses', 'Remove phone numbers']
  },
  {
    id: 6,
    difficulty: 'Hard',
    prompt: 'Protect all sensitive details in this medical update',
    risky_text: 'Just got diagnosed at Apollo Hospital, Bengaluru. My patient ID is APH-2024-88921. Doctor Priya Sharma prescribed medication. Insurance claim number: INS-445-2024. Follow-up on January 25, 2024 at 3:30 PM.',
    tips: ['Remove patient IDs', 'Remove doctor names', 'Remove exact appointments', 'Remove claim numbers']
  },
  {
    id: 7,
    difficulty: 'Hard',
    prompt: 'Secure this financial transaction post',
    risky_text: 'Transferred ₹50,000 from my HDFC account (A/C: 1234567890) to Airtel (transaction ID: TXN-2024-998877). UPI ID: john@paytm. Receipt shows transaction on Dec 15, 2024 at 14:23:45.',
    tips: ['Remove account numbers', 'Remove transaction IDs', 'Remove UPI IDs', 'Generalize timestamps']
  },
  {
    id: 8,
    difficulty: 'Hard',
    prompt: 'Anonymize this family emergency post',
    risky_text: 'My daughter Emily (DOB: 04/12/2015, Aadhaar: 9988-7766-5544) is admitted at AIIMS, New Delhi, Ward 5C, Bed 23. Emergency contact: Dr. Amit Kumar, 9123456789. Insurance: Policy #POL-2023-7788.',
    tips: ['Remove all government IDs', 'Remove exact ward/bed numbers', 'Remove doctor contacts', 'Remove policy numbers']
  },
  {
    id: 9,
    difficulty: 'Expert',
    prompt: 'Completely anonymize this detailed business post',
    risky_text: 'Our startup (CIN: U74999KA2023PTC165432) raised $2M! Registered at #45, 3rd Floor, Koramangala, Bengaluru-560034. Contact: ceo@startup.com, +91-80-12345678. PAN: AABCS1234F, GST: 29AABCS1234F1Z5. Pitch deck: drive.google.com/file/d/abc123xyz',
    tips: ['Remove all registration numbers', 'Remove exact addresses with pin codes', 'Remove tax IDs', 'Remove document links', 'Remove email/phone']
  },
  {
    id: 10,
    difficulty: 'Expert',
    prompt: 'Secure this complex identity verification post',
    risky_text: 'Verified my identity using Aadhaar 1111-2222-3333, PAN ABCDE1234F, Passport J1234567 issued on 01/Jan/2020 from Mumbai office. Driving License: MH-01-2024-123456. Voter ID: ABC1234567. Bank verified via passbook showing IFSC: HDFC0001234, Account: 12340056789.',
    tips: ['Remove ALL government-issued IDs', 'Remove bank details completely', 'Remove issue dates and locations', 'Keep only general concept']
  }
]

const TrainingPage = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userText, setUserText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [quizResults, setQuizResults] = useState([])
  const [showFinalScore, setShowFinalScore] = useState(false)
  const [currentResult, setCurrentResult] = useState(null)

  const currentChallenge = QUIZ_CHALLENGES[currentQuestion]
  const totalQuestions = QUIZ_CHALLENGES.length

  const handleSubmit = async () => {
    if (!userText.trim()) return
    setSubmitting(true)
    try {
      const data = await submitTrainingAttempt(String(currentChallenge.id), userText)
      
      setCurrentResult(data)
      
      const newResults = [...quizResults, {
        question: currentQuestion + 1,
        score: data.score?.total_score || 0,
        feedback: data.score?.feedback || []
      }]
      setQuizResults(newResults)
      setSubmitting(false)
    } catch (err) {
      console.error(err)
      setSubmitting(false)
    }
  }

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setUserText('')
      setCurrentResult(null)
    } else {
      setShowFinalScore(true)
    }
  }

  const restart = () => {
    setCurrentQuestion(0)
    setUserText('')
    setQuizResults([])
    setShowFinalScore(false)
    setCurrentResult(null)
  }

  const totalScore = quizResults.reduce((sum, r) => sum + r.score, 0)
  const averageScore = quizResults.length > 0 ? Math.round(totalScore / quizResults.length) : 0

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return 'text-green-400 bg-green-900/30 border-green-500/30'
      case 'Medium': return 'text-yellow-400 bg-yellow-900/30 border-yellow-500/30'
      case 'Hard': return 'text-orange-400 bg-orange-900/30 border-orange-500/30'
      case 'Expert': return 'text-red-400 bg-red-900/30 border-red-500/30'
      default: return 'text-blue-400 bg-blue-900/30 border-blue-500/30'
    }
  }

  const getGrade = (score) => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-400', message: 'Perfect!' }
    if (score >= 80) return { grade: 'A', color: 'text-green-400', message: 'Excellent!' }
    if (score >= 70) return { grade: 'B', color: 'text-blue-400', message: 'Great!' }
    if (score >= 60) return { grade: 'C', color: 'text-yellow-400', message: 'Good!' }
    if (score >= 50) return { grade: 'D', color: 'text-orange-400', message: 'Keep practicing!' }
    return { grade: 'F', color: 'text-red-400', message: 'Try again!' }
  }

  if (showFinalScore) {
    const { grade, color, message } = getGrade(averageScore)
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-8 text-center">
          <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-2">Quiz Complete!</h1>
          <p className="text-slate-300 mb-8">You've completed all {totalQuestions} challenges</p>

          <div className="bg-slate-900/60 rounded-xl p-8 mb-8">
            <div className={`text-7xl font-bold ${color} mb-2`}>{grade}</div>
            <div className="text-3xl font-semibold text-white mb-2">{averageScore}%</div>
            <div className="text-xl text-slate-300">{message}</div>
          </div>

          <div className="grid gap-3 mb-8 max-h-96 overflow-y-auto">
            {quizResults.map((result, idx) => (
              <div key={idx} className="bg-slate-900/40 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    result.score >= 70 ? 'bg-green-900/40 text-green-400' : 
                    result.score >= 50 ? 'bg-yellow-900/40 text-yellow-400' : 
                    'bg-red-900/40 text-red-400'
                  }`}>
                    {result.score >= 70 ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                  </div>
                  <div className="text-left">
                    <div className="text-white font-semibold">Question {result.question}</div>
                    <div className="text-sm text-slate-400">{QUIZ_CHALLENGES[idx].difficulty}</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">{result.score}%</div>
              </div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={restart}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold inline-flex items-center gap-2"
          >
            <Target className="w-5 h-5" />
            Try Again
          </motion.button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto"
    >
      <header className="mb-8 text-center">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-900/40 border border-blue-500/40 text-blue-200 text-xs font-semibold uppercase tracking-wide mb-3">
          <Sparkles className="w-3 h-3 mr-2" /> Privacy Training Quiz
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Practice Safer Sharing
        </h1>
        <p className="text-slate-300 max-w-2xl mx-auto mb-6">
          Complete {totalQuestions} challenges to test your privacy protection skills
        </p>

        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
            <span>Question {currentQuestion + 1} of {totalQuestions}</span>
            <span>{Math.round(((currentQuestion) / totalQuestions) * 100)}% Complete</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestion) / totalQuestions) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            />
          </div>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-6 items-start">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">Challenge {currentQuestion + 1}</h2>
              </div>
              <div className={`px-2 py-1 rounded-md text-xs font-semibold border ${getDifficultyColor(currentChallenge.difficulty)}`}>
                {currentChallenge.difficulty}
              </div>
            </div>

            <p className="text-sm text-slate-300 mb-3">{currentChallenge.prompt}</p>
            
            <div className="text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wide">
              Original risky version
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-700 text-sm text-slate-200 whitespace-pre-wrap">
              {currentChallenge.risky_text}
            </div>

            {currentChallenge.tips?.length > 0 && (
              <div>
                <div className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide flex items-center gap-1">
                  <Star className="w-3 h-3" /> Tips
                </div>
                <ul className="space-y-1 text-xs text-slate-400 list-disc list-inside">
                  {currentChallenge.tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-white">Your Rewrite</h2>
            <span className="text-xs text-slate-400">{userText.length} / 10,000 chars</span>
          </div>
          
          <textarea
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            rows={12}
            maxLength={10000}
            placeholder="Rewrite the text here to remove all sensitive information while keeping the meaning..."
            className="w-full px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
            disabled={submitting || currentResult}
          />

          {!currentResult ? (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={submitting || !userText.trim()}
              onClick={handleSubmit}
              className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-colors ${
                submitting || !userText.trim()
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {submitting ? 'Checking...' : 'Submit Answer'}
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </motion.button>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs uppercase tracking-wide text-slate-400">Your Score</span>
                    <div className={`text-3xl font-bold ${
                      currentResult.score?.total_score >= 70 ? 'text-green-400' :
                      currentResult.score?.total_score >= 50 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {currentResult.score?.total_score}%
                    </div>
                  </div>
                  
                  {currentResult.score?.feedback && currentResult.score.feedback.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <div className="text-xs uppercase tracking-wide text-slate-400">Feedback</div>
                      <ul className="text-sm text-slate-300 space-y-1">
                        {currentResult.score.feedback.map((line, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-blue-400">•</span>
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="border-t border-slate-700 pt-4">
                    <div className="text-xs uppercase tracking-wide text-green-400 mb-2 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Suggested Safe Answer
                    </div>
                    <div className="p-3 rounded-lg bg-green-900/20 border border-green-500/30 text-sm text-slate-200">
                      {currentChallenge.difficulty === 'Easy' && currentChallenge.id === 1 && (
                        "Hi! I'm from New York. Feel free to reach out through the contact options in my profile."
                      )}
                      {currentChallenge.difficulty === 'Easy' && currentChallenge.id === 2 && (
                        "Happy birthday to my son! He's turning 8 this year!"
                      )}
                      {currentChallenge.difficulty === 'Medium' && currentChallenge.id === 3 && (
                        "Hey everyone! I'm a professional based in Bengaluru. You can verify my credentials through official channels or my professional profile."
                      )}
                      {currentChallenge.difficulty === 'Medium' && currentChallenge.id === 4 && (
                        "Currently in Dubai. My flight to Mumbai is delayed by a couple of hours. Staying at a hotel near the airport."
                      )}
                      {currentChallenge.difficulty === 'Medium' && currentChallenge.id === 5 && (
                        "Just applied to a major tech company! You can reach me through my professional profile or LinkedIn."
                      )}
                      {currentChallenge.difficulty === 'Hard' && currentChallenge.id === 6 && (
                        "Just got a diagnosis at a hospital in Bengaluru. My doctor prescribed medication. Have a follow-up appointment later this month."
                      )}
                      {currentChallenge.difficulty === 'Hard' && currentChallenge.id === 7 && (
                        "Transferred funds from my bank to pay my phone bill. Transaction completed successfully earlier today."
                      )}
                      {currentChallenge.difficulty === 'Hard' && currentChallenge.id === 8 && (
                        "My child is admitted at a hospital in New Delhi. You can reach me through the emergency contact provided to the hospital."
                      )}
                      {currentChallenge.difficulty === 'Expert' && currentChallenge.id === 9 && (
                        "Our startup raised $2M in funding! We're registered in Bengaluru. For business inquiries, please use our official website contact form."
                      )}
                      {currentChallenge.difficulty === 'Expert' && currentChallenge.id === 10 && (
                        "Completed my identity verification process using official government documents. The process was smooth and took place at the local office."
                      )}
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleNext}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold bg-green-600 hover:bg-green-500 text-white"
                >
                  {currentQuestion < totalQuestions - 1 ? 'Next Question' : 'See Final Score'}
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            </AnimatePresence>
          )}

          {quizResults.length > 0 && (
            <div className="pt-4 border-t border-slate-700">
              <div className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">
                Your Progress
              </div>
              <div className="flex gap-2 flex-wrap">
                {quizResults.map((result, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      result.score >= 70 ? 'bg-green-900/40 text-green-400 border border-green-500/30' :
                      result.score >= 50 ? 'bg-yellow-900/40 text-yellow-400 border border-yellow-500/30' :
                      'bg-red-900/40 text-red-400 border border-red-500/30'
                    }`}
                  >
                    Q{idx + 1}: {result.score}%
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default TrainingPage
//   {
//     id: 1,
//     difficulty: 'Easy',
//     prompt: 'Remove sensitive personal information from this post',
//     risky_text: 'Hi! I\'m Sarah from New York. Call me at 555-1234!',
//     tips: ['Remove exact names', 'Remove phone numbers', 'Use general locations']
//   },
//   {
//     id: 2,
//     difficulty: 'Easy',
//     prompt: 'Make this birthday post privacy-safe',
//     risky_text: 'Happy birthday to my son James! He turns 8 today, born on March 15, 2016!',
//     tips: ['Avoid exact dates of birth', 'Use general age references']
//   },
//   {
//     id: 3,
//     difficulty: 'Medium',
//     prompt: 'Protect work and contact details in this introduction',
//     risky_text: 'Hey everyone! I\'m Rahul Sharma, living at 23/7 MG Road, Bengaluru. Here\'s my Aadhaar 1234-5678-9012 and PAN ABCTY1234Z so clients can verify me. You can also call me on 98765-43210 anytime!',
//     tips: ['Remove government IDs completely', 'Generalize addresses', 'Remove phone numbers']
//   },
//   {
//     id: 4,
//     difficulty: 'Medium',
//     prompt: 'Rewrite this travel post without revealing your exact location',
//     risky_text: 'Currently at Dubai International Airport, Terminal 3, Gate B7. Flight EK-505 to Mumbai delayed by 2 hours. Staying at Hilton Garden Inn, room 402.',
//     tips: ['Use city names instead of exact locations', 'Avoid gate/room numbers', 'Keep general travel updates']
//   },
//   {
//     id: 5,
//     difficulty: 'Medium',
//     prompt: 'Make this job application post safer',
//     risky_text: 'Just applied to Google! My employee ID at current company is EMP-2024-1156. Email me at john.doe@company.com or call 9876543210.',
//     tips: ['Remove employee IDs', 'Remove personal email addresses', 'Remove phone numbers']
//   },
//   {
//     id: 6,
//     difficulty: 'Hard',
//     prompt: 'Protect all sensitive details in this medical update',
//     risky_text: 'Just got diagnosed at Apollo Hospital, Bengaluru. My patient ID is APH-2024-88921. Doctor Priya Sharma prescribed medication. Insurance claim number: INS-445-2024. Follow-up on January 25, 2024 at 3:30 PM.',
//     tips: ['Remove patient IDs', 'Remove doctor names', 'Remove exact appointments', 'Remove claim numbers']
//   },
//   {
//     id: 7,
//     difficulty: 'Hard',
//     prompt: 'Secure this financial transaction post',
//     risky_text: 'Transferred ₹50,000 from my HDFC account (A/C: 1234567890) to Airtel (transaction ID: TXN-2024-998877). UPI ID: john@paytm. Receipt shows transaction on Dec 15, 2024 at 14:23:45.',
//     tips: ['Remove account numbers', 'Remove transaction IDs', 'Remove UPI IDs', 'Generalize timestamps']
//   },
//   {
//     id: 8,
//     difficulty: 'Hard',
//     prompt: 'Anonymize this family emergency post',
//     risky_text: 'My daughter Emily (DOB: 04/12/2015, Aadhaar: 9988-7766-5544) is admitted at AIIMS, New Delhi, Ward 5C, Bed 23. Emergency contact: Dr. Amit Kumar, 9123456789. Insurance: Policy #POL-2023-7788.',
//     tips: ['Remove all government IDs', 'Remove exact ward/bed numbers', 'Remove doctor contacts', 'Remove policy numbers']
//   },
//   {
//     id: 9,
//     difficulty: 'Expert',
//     prompt: 'Completely anonymize this detailed business post',
//     risky_text: 'Our startup (CIN: U74999KA2023PTC165432) raised $2M! Registered at #45, 3rd Floor, Koramangala, Bengaluru-560034. Contact: ceo@startup.com, +91-80-12345678. PAN: AABCS1234F, GST: 29AABCS1234F1Z5. Pitch deck: drive.google.com/file/d/abc123xyz',
//     tips: ['Remove all registration numbers', 'Remove exact addresses with pin codes', 'Remove tax IDs', 'Remove document links', 'Remove email/phone']
//   },
//   {
//     id: 10,
//     difficulty: 'Expert',
//     prompt: 'Secure this complex identity verification post',
//     risky_text: 'Verified my identity using Aadhaar 1111-2222-3333, PAN ABCDE1234F, Passport J1234567 issued on 01/Jan/2020 from Mumbai office. Driving License: MH-01-2024-123456. Voter ID: ABC1234567. Bank verified via passbook showing IFSC: HDFC0001234, Account: 12340056789.',
//     tips: ['Remove ALL government-issued IDs', 'Remove bank details completely', 'Remove issue dates and locations', 'Keep only general concept']
//   }
// ]

// const TrainingPage = () => {
//   const [mode, setMode] = useState('menu') // 'menu', 'quiz', 'freeplay'
//   const [currentQuestion, setCurrentQuestion] = useState(0)
//   const [userText, setUserText] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [submitting, setSubmitting] = useState(false)
//   const [result, setResult] = useState(null)
//   const [error, setError] = useState(null)
//   const [quizResults, setQuizResults] = useState([])
//   const [showFinalScore, setShowFinalScore] = useState(false)
  
//   // Freeplay mode
//   const [challenge, setChallenge] = useState(null)

//   useEffect(() => {
//     loadChallenge()
//   }, [])

//   const loadChallenge = async () => {
//     try {
//       setLoading(true)
//       setError(null)
//       setResult(null)
//       setUserText('')
//       const data = await getTrainingChallenge()
//       setChallenge(data.challenge)
//       setUserText(data.challenge?.risky_text || '')
//     } catch (err) {
//       console.error(err)
//       setError('Failed to load training challenge. Please try again.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleSubmit = async () => {
//     if (!challenge || !userText.trim()) return
//     setSubmitting(true)
//     setError(null)
//     try {
//       const data = await submitTrainingAttempt(challenge.id, userText)
//       setResult(data)
//     } catch (err) {
//       console.error(err)
//       setError('Scoring failed. Please try again.')
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="max-w-5xl mx-auto"
//     >
//       <header className="mb-8 text-center">
//         <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-900/40 border border-blue-500/40 text-blue-200 text-xs font-semibold uppercase tracking-wide mb-3">
//           <Sparkles className="w-3 h-3 mr-2" /> Privacy Training Mode
//         </div>
//         <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
//           Practice Safer Sharing
//         </h1>
//         <p className="text-slate-300 max-w-2xl mx-auto">
//           Rewrite a risky paragraph to make it privacy-safe. We’ll auto-score how
//           well you removed personal details while keeping the meaning.
//         </p>
//       </header>

//       <div className="grid md:grid-cols-2 gap-6 items-start">
//         {/* Challenge card */}
//         <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 space-y-4">
//           <div className="flex items-center justify-between mb-1">
//             <div className="flex items-center gap-2">
//               <Shield className="w-5 h-5 text-blue-400" />
//               <h2 className="text-lg font-semibold text-white">Challenge</h2>
//             </div>
//             <button
//               onClick={loadChallenge}
//               disabled={loading || submitting}
//               className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
//             >
//               <Undo2 className="w-3 h-3" /> New
//             </button>
//           </div>

//           {error && (
//             <p className="text-sm text-red-400">{error}</p>
//           )}

//           <AnimatePresence mode="wait">
//             {challenge && (
//               <motion.div
//                 key={challenge.id}
//                 initial={{ opacity: 0, y: 8 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -8 }}
//                 transition={{ duration: 0.2 }}
//               >
//                 <p className="text-sm text-slate-300 mb-3">{challenge.prompt}</p>
//                 <div className="text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wide">
//                   Original risky version
//                 </div>
//                 <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-700 text-sm text-slate-200 whitespace-pre-wrap">
//                   {challenge.risky_text}
//                 </div>
//                 {challenge.tips?.length > 0 && (
//                   <ul className="mt-3 space-y-1 text-xs text-slate-400 list-disc list-inside">
//                     {challenge.tips.map((tip, idx) => (
//                       <li key={idx}>{tip}</li>
//                     ))}
//                   </ul>
//                 )}
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>

//         {/* Rewrite workspace */}
//         <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 space-y-4">
//           <div className="flex items-center justify-between mb-1">
//             <h2 className="text-lg font-semibold text-white">Your Rewrite</h2>
//             <span className="text-xs text-slate-400">{userText.length} / 10,000 chars</span>
//           </div>
//           <textarea
//             value={userText}
//             onChange={(e) => setUserText(e.target.value)}
//             rows={10}
//             maxLength={10000}
//             placeholder="Rewrite the paragraph here without exposing exact addresses, IDs, phone numbers, or live locations..."
//             className="w-full px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
//             disabled={loading || submitting || !challenge}
//           />

//           <motion.button
//             whileHover={{ scale: 1.01 }}
//             whileTap={{ scale: 0.99 }}
//             disabled={submitting || !challenge || !userText.trim()}
//             onClick={handleSubmit}
//             className={`w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
//               submitting || !challenge || !userText.trim()
//                 ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
//                 : 'bg-blue-600 hover:bg-blue-500 text-white'
//             }`}
//           >
//             {submitting ? 'Scoring…' : 'Check my rewrite'}
//             {!submitting && <ArrowRight className="w-4 h-4" />}
//           </motion.button>

//           <AnimatePresence>
//             {result && (
//               <motion.div
//                 initial={{ opacity: 0, y: 8 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -8 }}
//                 className="mt-2 space-y-3"
//               >
//                 <div className="flex items-baseline justify-between">
//                   <div>
//                     <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">Total score</div>
//                     <div className="text-3xl font-bold text-white">{result.score.total_score}</div>
//                   </div>
//                   <div className="text-xs text-slate-400 text-right">
//                     <div>PII reduction: {result.score.pii_reduction_score}</div>
//                     <div>Clarity: {result.score.clarity_score}</div>
//                     <div>Style: {result.score.style_score}</div>
//                   </div>
//                 </div>
//                 {result.score.feedback?.length > 0 && (
//                   <ul className="text-xs text-slate-300 space-y-1 bg-slate-900/40 border border-slate-700 rounded-lg p-3">
//                     {result.score.feedback.map((line, idx) => (
//                       <li key={idx}>• {line}</li>
//                     ))}
//                   </ul>
//                 )}
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       </div>
//     </motion.div>
//   )
// }

// export default TrainingPage
