import { Link } from 'react-router-dom'
import { Shield, FileSearch, Github, Sparkles, Zap, TrendingUp, ArrowRight, Lock, Eye, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const HomePage = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section - Full Screen */}
      <HeroSection />
      
      {/* Stats Section */}
      <StatsSection />
      
      {/* Features Grid */}
      <FeaturesSection />
      
      {/* Visual Demo Section */}
      <DemoSection />
      
      {/* Final CTA */}
      <CTASection />
    </div>
  )
}

// Animated Background Elements
const FloatingOrbs = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -100, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          x: [0, -100, 0],
          y: [0, 100, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, -50, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl"
      />
    </div>
  )
}

// Hero Section
const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center py-20 overflow-hidden">
      <FloatingOrbs />
      
      {/* Floating Icons */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute top-20 left-20 opacity-30"
      >
        <Shield className="w-16 h-16 text-blue-400" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-40 right-32 opacity-30"
      >
        <Lock className="w-12 h-12 text-purple-400" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 3.5, repeat: Infinity }}
        className="absolute bottom-40 right-20 opacity-30"
      >
        <Eye className="w-14 h-14 text-pink-400" />
      </motion.div>
      
      <div className="relative z-10 text-center max-w-5xl mx-auto px-4">
        {/* Animated Shield Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 1, bounce: 0.5 }}
          className="flex justify-center mb-8"
        >
          <motion.div
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(59, 130, 246, 0.5)",
                "0 0 60px rgba(168, 85, 247, 0.8)",
                "0 0 20px rgba(59, 130, 246, 0.5)",
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="relative"
          >
            <Shield className="w-32 h-32 text-blue-500" strokeWidth={1.5} />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
            />
          </motion.div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-6xl md:text-7xl lg:text-8xl font-black mb-6"
        >
          <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Protect Your
          </span>
          <br />
          <span className="text-slate-900 dark:text-white">
            Digital Privacy
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 mb-12 max-w-2xl mx-auto font-light"
        >
          Discover what you're sharing. Stay safe online.
        </motion.p>

        {/* CTA Button with Shimmer */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Link
            to="/analyze"
            className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white text-xl font-bold rounded-full overflow-hidden shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
          >
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
            />
            <span className="relative z-10">Start Free Scan</span>
            <Sparkles className="relative z-10 w-6 h-6" />
          </Link>
        </motion.div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-sm text-slate-600 dark:text-slate-400"
        >
          ✨ No signup required • 100% free • Instant results
        </motion.div>
      </div>
    </section>
  )
}

// Animated Stats Section
const StatsSection = () => {
  const stats = [
    { label: "Scans Completed", value: 1000, suffix: "K+", icon: Zap },
    { label: "Accuracy Rate", value: 99, suffix: "%", icon: TrendingUp },
    { label: "Privacy Issues Found", value: 50, suffix: "K+", icon: Shield },
  ]

  return (
    <section className="py-16 relative">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <AnimatedStat key={index} {...stat} delay={index * 0.2} />
          ))}
        </div>
      </div>
    </section>
  )
}

const AnimatedStat = ({ label, value, suffix, icon: Icon, delay }) => {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (hasAnimated) return
    
    const duration = 2000
    const steps = 60
    const increment = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
        setHasAnimated(true)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value, hasAnimated])

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="relative bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden group hover:scale-105 transition-transform"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/10 to-pink-500/0"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      
      <div className="relative z-10">
        <Icon className="w-10 h-10 text-blue-500 mb-4" />
        <div className="text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          {count}{suffix}
        </div>
        <div className="text-slate-600 dark:text-slate-400 font-medium">{label}</div>
      </div>
    </motion.div>
  )
}

// Features Section
const FeaturesSection = () => {
  const features = [
    {
      icon: FileSearch,
      title: "Text Scanner",
      description: "Scan any text instantly",
      gradient: "from-blue-500 to-cyan-500",
      to: "/analyze"
    },
    {
      icon: Github,
      title: "GitHub Checker",
      description: "Find hidden privacy risks",
      gradient: "from-purple-500 to-pink-500",
      to: "/github"
    },
    {
      icon: MessageSquare,
      title: "Privacy Assistant",
      description: "Get instant AI advice",
      gradient: "from-pink-500 to-rose-500",
      to: "/assistant"
    },
  ]

  return (
    <section className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} delay={index * 0.1} />
          ))}
        </div>
      </div>
    </section>
  )
}

const FeatureCard = ({ icon: Icon, title, description, gradient, to, delay }) => {
  return (
    <Link to={to}>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay }}
        whileHover={{ y: -10, scale: 1.02 }}
        className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden group cursor-pointer"
      >
        {/* Gradient overlay on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
        
        {/* Animated icon */}
        <motion.div
          whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
          transition={{ duration: 0.5 }}
          className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 shadow-lg`}
        >
          <Icon className="w-10 h-10 text-white" />
        </motion.div>

        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400">{description}</p>

        {/* Animated arrow */}
        <motion.div
          className="mt-4 text-blue-500 flex items-center gap-2 font-semibold"
          whileHover={{ x: 5 }}
        >
          Try it now
          <ArrowRight className="w-4 h-4" />
        </motion.div>
      </motion.div>
    </Link>
  )
}

// Demo Section
const DemoSection = () => {
  return (
    <section className="py-20 relative">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Demo visualization */}
          <div className="bg-gradient-to-br from-slate-100 to-blue-100 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-12 border-4 border-slate-300 dark:border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between gap-8">
              {/* Input */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex-1 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border-2 border-slate-300 dark:border-slate-600"
              >
                <div className="text-sm text-slate-500 mb-2">Your Text</div>
                <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
              </motion.div>

              {/* Arrow */}
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-12 h-12 text-blue-500" />
              </motion.div>

              {/* Output */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="flex-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 shadow-2xl"
              >
                <div className="text-sm text-white/80 mb-2">Risk Score</div>
                <div className="text-5xl font-black text-white">54</div>
                <div className="text-sm text-white/80 mt-1">Medium Risk</div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 text-slate-600 dark:text-slate-400 text-lg"
            >
              Instant AI-powered analysis in seconds
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// Final CTA Section
const CTASection = () => {
  return (
    <section className="py-20 relative">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center overflow-hidden shadow-2xl"
        >
          {/* Particle effects */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -100],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.1,
              }}
              className="absolute bottom-0 w-2 h-2 bg-white rounded-full"
              style={{ left: `${(i / 20) * 100}%` }}
            />
          ))}

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Ready to protect yourself?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands protecting their digital privacy today
            </p>
            
            <Link
              to="/analyze"
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-purple-600 text-xl font-bold rounded-full shadow-2xl hover:scale-105 transition-transform"
            >
              Try It Now
              <Sparkles className="w-6 h-6" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default HomePage
