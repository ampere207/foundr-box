'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

// Enhanced animated SVG Icons
const featureIcons = {
  validator: (
    <svg className="w-12 h-12 text-blue-600 dark:text-blue-400 transition-all duration-500 group-hover:scale-125 group-hover:rotate-3 drop-shadow-lg" fill="none" viewBox="0 0 24 24" strokeWidth={2.4} stroke="currentColor">
      <rect x="5" y="5" width="14" height="14" rx="3" className="stroke-current fill-white dark:fill-gray-900" />
      <path d="M9.5 13.5l2 2 3-4" strokeLinecap="round" strokeLinejoin="round" className="stroke-current" />
      <circle cx="12" cy="12" r="9.2" strokeDasharray="3 5" className="stroke-blue-200 dark:stroke-blue-800" />
      <rect x="8" y="8" width="8" height="8" rx="2" className="stroke-blue-400 fill-blue-50 dark:fill-gray-800" />
    </svg>
  ),
  
  market: (
    <svg className="w-12 h-12 text-blue-600 dark:text-blue-400 transition-all duration-500 group-hover:scale-125 group-hover:-translate-y-2 drop-shadow-lg" fill="none" viewBox="0 0 24 24" strokeWidth={2.4} stroke="currentColor">
      <rect x="3" y="11" width="3.5" height="8" rx="1.5" className="fill-blue-100 dark:fill-blue-950 stroke-blue-400" />
      <rect x="9" y="7" width="3.5" height="12" rx="1.5" className="fill-blue-200 dark:fill-blue-800 stroke-blue-500" />
      <rect x="15" y="4" width="3.5" height="15" rx="1.5" className="fill-blue-300 dark:fill-blue-700 stroke-blue-600" />
      <circle cx="19" cy="19" r="3" className="stroke-current" />
      <path d="M22 22l-1.5-1.5" className="stroke-blue-600" />
    </svg>
  ),
  
  pitch: (
    <svg className="w-12 h-12 text-blue-600 dark:text-blue-400 transition-all duration-500 group-hover:scale-125 group-hover:rotate-6 drop-shadow-lg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
      <rect x="3.5" y="6.5" width="17" height="10" rx="2" className="fill-blue-50 dark:fill-gray-800 stroke-blue-400" />
      <path d="M3.5 17.5h17M12 17.5v3M8.5 20.5h7" className="stroke-blue-600" />
      <path d="M7 5l1 2M17 5l-1 2M12 11.5l0 0.01" className="stroke-yellow-400" />
      <circle cx="12" cy="11.5" r="0.7" className="fill-yellow-400" />
    </svg>
  ),
  
  strategy: (
    <svg className="w-12 h-12 text-blue-600 dark:text-blue-400 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 drop-shadow-lg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
      <path d="M7 21h10M9 17l1-5 4 1 1 4.5" className="stroke-blue-600 dark:stroke-blue-300" />
      <path d="M17 9a5.5 5.5 0 01-8.5-3l2.5-1A5.5 5.5 0 0117 9z" className="stroke-blue-400" />
      <circle cx="10.5" cy="7.5" r="1" className="fill-blue-400" />
    </svg>
  ),
  
  connect: (
    <svg className="w-12 h-12 text-blue-600 dark:text-blue-400 transition-all duration-500 group-hover:scale-125 group-hover:-rotate-3 drop-shadow-lg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
      <circle cx="7" cy="8" r="3" className="fill-blue-100 dark:fill-blue-900 stroke-blue-400" />
      <circle cx="17" cy="8" r="3" className="fill-blue-200 dark:fill-blue-800 stroke-blue-500" />
      <path d="M4.5 16a3.5 3.5 0 016.9 0M12.6 16a3.5 3.5 0 016.9 0" className="stroke-blue-400" />
      <path d="M10.5 8a6 6 0 013 0" className="stroke-blue-400" />
    </svg>
  )
}

export default function HomePage() {
  const { isSignedIn } = useUser()
  const router = useRouter()
  const [showTestimonial, setShowTestimonial] = useState(0)
  const [hasVisitedDashboard, setHasVisitedDashboard] = useState(false)

  // Smart redirect logic
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const visitedDashboard = sessionStorage.getItem('visitedDashboard')
      setHasVisitedDashboard(!!visitedDashboard)
      
      if (isSignedIn && !visitedDashboard) {
        // First visit while logged in - redirect to dashboard
        sessionStorage.setItem('visitedDashboard', 'true')
        router.push('/dashboard')
      }
    }
  }, [isSignedIn, router])

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setShowTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      title: "Startup Dashboard",
      description: "Central hub to track your MVP progress, manage team tasks, and keep your startup organized and moving forward efficiently.",
      icon: (
        <svg className="w-12 h-12 text-blue-600 dark:text-blue-400 transition-all duration-500 group-hover:scale-125 group-hover:rotate-3 drop-shadow-lg" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 13h8V3H3v10zM13 21h8v-6h-8v6zM13 3v6h8V3h-8zM3 21h8v-4H3v4z" />
        </svg>
      ),
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Idea Validator",
      description: "Validate your startup concepts instantly using AI-driven feedback, actionable insights, and scoring. Forget guesswork—start with confidence.",
      icon: featureIcons.validator,
      gradient: "from-blue-600 to-indigo-600"
    },
    {
      title: "Market Research",
      description: "Get smart, AI-powered market analysis: trends, competitor scans, and customer discovery—auto-generated, always up to date.",
      icon: featureIcons.market,
      gradient: "from-indigo-500 to-purple-600"
    },
    {
      title: "Pitch Deck Assistant",
      description: "Unlock the formula for the ideal pitch deck. Receive dynamic, idea-specific insights for every section, from problem statement to funding ask.",
      icon: featureIcons.pitch,
      gradient: "from-blue-500 to-teal-500"
    },
    {
      title: "Growth Strategist",
      description: "Personalized strategies for monetization, go-to-market, product launches, and scaling—tailored to your idea's strengths and market fit.",
      icon: featureIcons.strategy,
      gradient: "from-cyan-500 to-blue-600"
    },
    {
      title: "Co-Founder Connect",
      description: "Match with founders who complement your skills and vision. Spark synergy and build with confidence.",
      icon: featureIcons.connect,
      gradient: "from-teal-500 to-blue-500"
    }
  ]

  const benefits = [
    "All-in-One Platform: streamline your journey from ideation to market entry.",
    "Advanced AI Support: real-time validation, research, and pitch insights.",
    "Interactive, Responsive UI: optimize your workflow anywhere.",
    "Serious Security: built on Supabase and Clerk for total peace of mind.",
    "Founder Community: network, learn, and share with the best.",
  ]

  const testimonials = [
    {
      name: "Jane Doe",
      role: "Founder, TechStartup",
      quote: "The Strategist and Validator features saved my team weeks of research. I found my ideal co-founder here too. This platform is a game-changer for serious founders!",
      avatar: "JD"
    },
    {
      name: "John Smith",
      role: "Co-Founder, InnovateInc",
      quote: "FoundrBox distilled a year of startup learning into days. The pitch deck assistant gave us exactly the insights we needed. Clean, fast, and easy!",
      avatar: "JS"
    },
    {
      name: "Alice Johnson",
      role: "Startup Advisor",
      quote: "Every early-stage founder should use FoundrBox before seeing any investor. Reliable AI tools, curated strategies, and an incredible founder network.",
      avatar: "AJ"
    },
  ]

  const faqs = [
    {
      question: "Does FoundrBox generate my pitch deck?",
      answer: "No. Instead, our Pitch Deck Assistant guides you step-by-step, giving customized, practical insights so you can create an investor-ready deck yourself.",
    },
    {
      question: "How does idea validation work?",
      answer: "Just enter your idea. Our AI reviews key factors, offers a score, strengths, and immediate improvement areas—trusted by hundreds of founders for real-world feedback!",
    },
    {
      question: "What strategies does the Strategist provide?",
      answer: "It covers monetization, GTM planning, growth hacking, pricing, and more—all founder-tested, with new categories added all the time.",
    },
    {
      question: "Is my founder data private?",
      answer: "Absolutely. Every project you create is locked down using Supabase RLS and Clerk authentication—your ideas stay yours, always.",
    },
  ]

  const handleCTA = () => {
    if (isSignedIn) {
      router.push('/dashboard')
    } else {
      router.push('/sign-up')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 text-gray-900 dark:text-gray-100 overflow-x-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* HERO SECTION */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-20">
          <div className="max-w-5xl w-full">
            <div className="mb-8">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium border border-blue-200 dark:border-blue-700">
                🚀 The Future of Startup Building
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-8 leading-tight">
              Welcome to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient-x">
                FoundrBox
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl max-w-4xl mx-auto text-gray-600 dark:text-gray-300 mb-12 leading-relaxed">
              The serious founder's operating system — validate ideas, conduct research, get strategic insights, 
              impress investors, and connect with your ideal team.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <button
                onClick={handleCTA}
                className="group relative px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-2xl text-white font-bold text-lg shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3"
              >
                {isSignedIn ? (
                  <>
                    Go to Dashboard
                    <svg className="w-6 h-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                ) : (
                  <>
                    Get Started Free
                    <svg className="w-6 h-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </button>
              
              {/* <button className="group px-8 py-4 border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-400 dark:hover:text-gray-900 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-3">
                Watch Demo
                <svg className="w-6 h-6 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <polygon points="5,3 19,12 5,21"></polygon>
                </svg>
              </button> */}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">500+</div>
                <div className="text-gray-600 dark:text-gray-400">Startups Launched</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">$10M+</div>
                <div className="text-gray-600 dark:text-gray-400">Funding Raised</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">95%</div>
                <div className="text-gray-600 dark:text-gray-400">Success Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Everything you need to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  build & scale
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                From idea validation to investor presentations, we've got every aspect of your startup journey covered.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, idx) => (
                <div
                  key={feature.title}
                  className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-gray-100 dark:border-gray-700"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`}></div>
                  
                  <div className="relative z-10">
                    <div className="mb-6 flex justify-center">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-2xl group-hover:bg-blue-100 dark:group-hover:bg-blue-800/50 transition-colors duration-300">
                        {feature.icon}
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4 text-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-center">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BENEFITS SECTION */}
        <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Why Choose FoundrBox?</h2>
              <p className="text-xl opacity-90 max-w-3xl mx-auto">
                Join thousands of successful founders who've transformed their ideas into thriving businesses.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="group flex items-start space-x-4 p-6 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-lg leading-relaxed">{benefit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Loved by{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  founders
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                See what successful entrepreneurs say about FoundrBox
              </p>
            </div>

            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-2xl border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-6">
                    {testimonials[showTestimonial].avatar}
                  </div>
                  
                  <blockquote className="text-xl md:text-2xl font-medium text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-3xl">
                    "{testimonials[showTestimonial].quote}"
                  </blockquote>
                  
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-xl text-blue-600 dark:text-blue-400 mb-1">
                      {testimonials[showTestimonial].name}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {testimonials[showTestimonial].role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Testimonial indicators */}
              <div className="flex justify-center mt-8 space-x-3">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${
                      idx === showTestimonial 
                        ? 'bg-blue-600 scale-125' 
                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-blue-400'
                    }`}
                    onClick={() => setShowTestimonial(idx)}
                    aria-label={`Show testimonial ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-20 px-6 bg-gray-50 dark:bg-gray-800/50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Frequently Asked{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Questions
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Everything you need to know about FoundrBox
              </p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, idx) => (
                <details
                  key={idx}
                  className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <summary className="flex items-center justify-between p-8 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-300">
                    <span className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex-1 pr-4">
                      {faq.question}
                    </span>
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 group-open:rotate-45 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </summary>
                  <div className="px-8 pb-8">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section className="py-20 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
              Ready to turn your startup idea into{' '}
              <span className="text-yellow-300">reality?</span>
            </h2>
            
            <p className="text-xl md:text-2xl mb-12 opacity-90 leading-relaxed max-w-3xl mx-auto">
              Join thousands of founders using FoundrBox to validate ideas, build strategies, 
              and create investor-ready presentations.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button
                onClick={handleCTA}
                className="group px-12 py-4 bg-white text-blue-600 hover:bg-gray-100 rounded-2xl font-bold text-xl shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3"
              >
                {isSignedIn ? (
                  <>
                    Go to Dashboard
                    <svg className="w-6 h-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                ) : (
                  <>
                    Start Building Now
                    <svg className="w-6 h-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
              
              <p className="text-lg opacity-80">
                Free to start • No credit card required
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-12 px-6 bg-gray-900 dark:bg-gray-950 text-gray-400">
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">FoundrBox</h3>
              <p className="text-gray-400">Empowering the next generation of founders</p>
            </div>
            
            <div className="border-t border-gray-800 pt-8">
              <p>&copy; {new Date().getFullYear()} FoundrBox. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </main>
  )
}
