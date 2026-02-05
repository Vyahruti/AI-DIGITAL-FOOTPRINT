import { Link } from 'react-router-dom'
import { Shield, Brain, Lock, Zap, ArrowRight, CheckCircle } from 'lucide-react'

const HomePage = () => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <Shield className="w-20 h-20 text-blue-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            AI Privacy Footprint Analyzer
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Detect privacy risks in your text using advanced NLP, Machine Learning, and AI
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/analyze"
              className="inline-flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition text-lg"
            >
              Start Analysis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition text-lg"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-8">
        <FeatureCard
          icon={Brain}
          title="Multi-Layer AI"
          description="Combines NLP (spaCy + Presidio), ML (Random Forest), and LLM (GPT) for comprehensive analysis"
          color="blue"
        />
        <FeatureCard
          icon={Lock}
          title="Privacy-First"
          description="User-provided data only. No scraping, no tracking, complete transparency"
          color="green"
        />
        <FeatureCard
          icon={Zap}
          title="Real-Time Insights"
          description="Instant risk scores, highlighted entities, and actionable recommendations"
          color="yellow"
        />
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          How It Works
        </h2>
        
        <div className="space-y-6">
          <Step
            number="1"
            title="Input Your Text"
            description="Paste social media posts, bios, or any public text you want to analyze"
          />
          <Step
            number="2"
            title="NLP Detection"
            description="spaCy and Presidio extract PII entities: names, emails, phones, locations, dates"
          />
          <Step
            number="3"
            title="ML Risk Scoring"
            description="Random Forest model calculates privacy risk based on entity features"
          />
          <Step
            number="4"
            title="LLM Recommendations"
            description="GPT generates contextual privacy tips and safe text rewrites"
          />
          <Step
            number="5"
            title="View Results"
            description="Get risk score, highlighted entities, recommendations, and before/after comparison"
          />
        </div>
      </section>

      {/* Tech Stack */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          Technology Stack
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <TechCard title="Backend" items={['FastAPI', 'Python 3.11', 'Uvicorn']} />
          <TechCard title="NLP" items={['spaCy', 'Presidio', 'en_core_web_lg']} />
          <TechCard title="Machine Learning" items={['Scikit-learn', 'Random Forest', 'NumPy/Pandas']} />
          <TechCard title="AI & LLM" items={['LangChain', 'OpenAI GPT', 'Agent Tools']} />
          <TechCard title="Frontend" items={['React 18', 'Vite', 'Tailwind CSS']} />
          <TechCard title="Database" items={['MongoDB', 'Motor', 'Async IO']} />
          <TechCard title="Visualization" items={['Recharts', 'Lucide Icons', 'Charts']} />
          <TechCard title="DevOps" items={['Git/GitHub', 'Docker', 'Render']} />
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-16 bg-slate-800/50 rounded-2xl">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to Analyze Your Privacy Footprint?
        </h2>
        <p className="text-slate-300 mb-8">
          Discover what information you're exposing and learn how to protect it
        </p>
        <Link
          to="/analyze"
          className="inline-flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition text-lg"
        >
          Get Started Now
          <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
      </section>
    </div>
  )
}

const FeatureCard = ({ icon: Icon, title, description, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
  }
  
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition">
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  )
}

const Step = ({ number, title, description }) => {
  return (
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-semibold text-white mb-1">{title}</h3>
        <p className="text-slate-400">{description}</p>
      </div>
    </div>
  )
}

const TechCard = ({ title, items }) => {
  return (
    <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
      <h4 className="text-lg font-semibold text-white mb-3">{title}</h4>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center text-slate-300 text-sm">
            <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default HomePage
