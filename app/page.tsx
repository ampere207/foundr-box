'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

// Animated SVG Icons (tailored for each feature)
const featureIcons = {
  // Idea Validator: a neural/AI chip to represent AI evaluation, with a check (for validation)
  validator: (
    <svg className="w-10 h-10 text-blue-600 dark:text-blue-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-2" fill="none" viewBox="0 0 24 24" strokeWidth={2.4} stroke="currentColor">
      <rect x="5" y="5" width="14" height="14" rx="3" className="stroke-current fill-white dark:fill-gray-900" />
      <path d="M9.5 13.5l2 2 3-4" strokeLinecap="round" strokeLinejoin="round" className="stroke-current" />
      <circle cx="12" cy="12" r="9.2" strokeDasharray="3 5" className="stroke-blue-200 dark:stroke-blue-800" />
      <rect x="8" y="8" width="8" height="8" rx="2" className="stroke-blue-400 fill-blue-50 dark:fill-gray-800" />
    </svg>
  ),
  
  // Market Research: a bar chart with a magnifying glass/spotlight
  market: (
    <svg className="w-10 h-10 text-blue-600 dark:text-blue-400 transition-transform duration-300 group-hover:scale-120 group-hover:-translate-y-1" fill="none" viewBox="0 0 24 24" strokeWidth={2.4} stroke="currentColor">
      <rect x="3" y="11" width="3.5" height="8" rx="1.5" className="fill-blue-100 dark:fill-blue-950 stroke-blue-400" />
      <rect x="9" y="7" width="3.5" height="12" rx="1.5" className="fill-blue-200 dark:fill-blue-800 stroke-blue-500" />
      <rect x="15" y="4" width="3.5" height="15" rx="1.5" className="fill-blue-300 dark:fill-blue-700 stroke-blue-600" />
      <circle cx="19" cy="19" r="3" className="stroke-current" />
      <path d="M22 22l-1.5-1.5" className="stroke-blue-600" />
    </svg>
  ),
  
  // Pitch Deck Assistant: a presentation screen with sparkles/idea stars
  pitch: (
    <svg className="w-10 h-10 text-blue-600 dark:text-blue-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
      <rect x="3.5" y="6.5" width="17" height="10" rx="2" className="fill-blue-50 dark:fill-gray-800 stroke-blue-400" />
      <path d="M3.5 17.5h17M12 17.5v3M8.5 20.5h7" className="stroke-blue-600" />
      <path d="M7 5l1 2M17 5l-1 2M12 11.5l0 0.01" className="stroke-yellow-400" />
      <circle cx="12" cy="11.5" r="0.7" className="fill-yellow-400" />
    </svg>
  ),
  
  // Strategist (Growth Lab): chess knight, symbolizing strategic thinking
  strategy: (
    <svg className="w-10 h-10 text-blue-600 dark:text-blue-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
      <path d="M7 21h10M9 17l1-5 4 1 1 4.5" className="stroke-blue-600 dark:stroke-blue-300" />
      <path d="M17 9a5.5 5.5 0 01-8.5-3l2.5-1A5.5 5.5 0 0117 9z" className="stroke-blue-400" />
      <circle cx="10.5" cy="7.5" r="1" className="fill-blue-400" />
    </svg>
  ),
  
  // Co-Founder Connect: two interlocking people (linked avatars)
  connect: (
    <svg className="w-10 h-10 text-blue-600 dark:text-blue-400 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-2" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
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

  // Main features with updated copy/icons and hover animation classes
const features = [
  {
    title: "Startup Dashboard",
    description:
      "Central hub to track your MVP progress, manage team tasks, and keep your startup organized and moving forward efficiently.",
    icon: (
      <svg
        className="w-10 h-10 text-blue-600 dark:text-blue-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-1"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        viewBox="0 0 24 24"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 13h8V3H3v10zM13 21h8v-6h-8v6zM13 3v6h8V3h-8zM3 21h8v-4H3v4z" />
      </svg>
    ),
  },
  {
    title: "Idea Validator",
    description:
      "Validate your startup concepts instantly using AI-driven feedback, actionable insights, and scoring. Forget guesswork—start with confidence.",
    icon: featureIcons.validator,
  },
  {
    title: "Market Research",
    description:
      "Get smart, AI-powered market analysis: trends, competitor scans, and customer discovery—auto-generated, always up to date.",
    icon: featureIcons.market,
  },
  {
    title: "Pitch Deck Assistant",
    description:
      "Unlock the formula for the ideal pitch deck. Receive dynamic, idea-specific insights for every section, from problem statement to funding ask.",
    icon: featureIcons.pitch,
  },
  {
    title: "Growth Strategist",
    description:
      "Personalized strategies for monetization, go-to-market, product launches, and scaling—tailored to your idea’s strengths and market fit.",
    icon: featureIcons.strategy,
  },
  {
    title: "Co-Founder Connect",
    description:
      "Match with founders who complement your skills and vision. Spark synergy and build with confidence.",
    icon: featureIcons.connect,
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
      quote:
        "The Strategist and Validator features saved my team weeks of research. I found my ideal co-founder here too. This platform is a game-changer for serious founders!",
    },
    {
      name: "John Smith",
      role: "Co-Founder, InnovateInc",
      quote:
        "FoundrBox distilled a year of startup learning into days. The pitch deck assistant gave us exactly the insights we needed. Clean, fast, and easy!",
    },
    {
      name: "Alice Johnson",
      role: "Startup Advisor",
      quote:
        "Every early-stage founder should use FoundrBox before seeing any investor. Reliable AI tools, curated strategies, and an incredible founder network.",
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

  // CTA logic
  const handleCTA = () => {
    if (isSignedIn) {
      router.push('/dashboard')
    } else {
      router.push('/sign-up')
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col items-center px-6 py-8 animate-fade-in">
      {/* HERO SECTION */}
      <section className="max-w-4xl w-full flex flex-col items-center text-center mb-16">
        <h1 className="text-5xl font-extrabold mb-4 text-blue-700 dark:text-blue-400 leading-tight animate-fade-in-up">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-400 to-teal-400 dark:from-blue-400 dark:via-teal-400 dark:to-purple-400">FoundrBox</span>
        </h1>
        <p className="text-lg max-w-2xl text-gray-700 dark:text-gray-300 mb-8 animate-pulse">
          The serious founder’s operating system — validate, research, get strategic insights, impress investors, and connect with your ideal team.
        </p>
        <button
          onClick={handleCTA}
          className={`px-8 py-3 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 rounded-md text-white font-semibold shadow-md transition animate-bounce 
          ${isSignedIn ? 'hover:gap-4' : ''}`}
          aria-label={isSignedIn ? "Go to Dashboard" : "Get started with FoundrBox"}
        >
          {isSignedIn ? (
            <>
              Go to Dashboard
              <svg className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          ) : (
            'Get Started'
          )}
        </button>
      </section>

      {/* FEATURES SECTION */}
      <section className="max-w-6xl w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        {features.map((feature, idx) => (
          <div
            key={feature.title}
            className="group bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 flex flex-col items-center text-center 
            hover:shadow-xl transition-shadow duration-300 cursor-pointer transform hover:-translate-y-2 hover:scale-[1.04] animate-fade-in-up"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className="mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">{feature.title}</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">{feature.description}</p>
          </div>
        ))}
      </section>

      {/* BENEFITS SECTION */}
      <section className="max-w-5xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-10 mb-20 text-center animate-fade-in">
        <h2 className="text-3xl font-bold mb-6 text-blue-700 dark:text-blue-400">Why Choose FoundrBox?</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-700 dark:text-gray-300 text-left">
          {benefits.map((benefit, idx) => (
            <li key={idx} className="flex items-start space-x-3 group hover:pl-2 transition-all duration-200">
              <svg className="w-6 h-6 text-teal-600 dark:text-teal-400 flex-shrink-0 group-hover:scale-125 group-hover:rotate-6 transition-transform" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="max-w-3xl w-full rounded-lg bg-white dark:bg-gray-900 shadow-md py-10 px-8 text-center mb-20 animate-fade-in">
        <h2 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-400">What Founders Say</h2>
        <div className="relative flex flex-col items-center">
          <blockquote className="text-lg italic text-gray-600 dark:text-gray-300 mb-4 transition-all duration-500 animate-fade-in-up">
            "{testimonials[showTestimonial].quote}"
          </blockquote>
          <div className="flex flex-col items-center space-y-1">
            <span className="font-semibold text-blue-700 dark:text-blue-400">{testimonials[showTestimonial].name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{testimonials[showTestimonial].role}</span>
          </div>
          <div className="mt-4 flex space-x-3 justify-center">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                className={`w-3 h-3 rounded-full border-2 transition ${idx === showTestimonial ? 'bg-blue-600 border-blue-600' : 'bg-gray-200 border-gray-300 dark:bg-gray-800 dark:border-gray-700'}`}
                aria-label={`Testimonial ${idx + 1}`}
                onClick={() => setShowTestimonial(idx)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-4xl w-full mb-20 animate-fade-in">
        <h2 className="text-2xl font-bold mb-8 text-blue-700 dark:text-blue-400 text-center">Frequently Asked Questions</h2>
        <div className="flex flex-col space-y-4">
          {faqs.map((faq, idx) => (
            <details key={faq.question} className="bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 p-4 group animate-fade-in-up transition duration-300 hover:shadow-md">
              <summary className="font-semibold text-gray-800 dark:text-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 group-open:text-blue-700 dark:group-open:text-blue-400 transition">
                {faq.question}
              </summary>
              <p className="text-gray-600 dark:text-gray-300 mt-2">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="max-w-4xl w-full flex flex-col items-center text-center mb-12 px-2 animate-fade-in-up">
        <h2 className="text-3xl font-extrabold mb-3 text-blue-700 dark:text-blue-400 leading-snug">
          Ready to turn your startup idea into reality?
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
          Join founders using FoundrBox to streamline innovation, validate ideas, and discover investor-ready tactics.
        </p>
        <button
          onClick={handleCTA}
          className={`px-10 py-3 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md text-white font-semibold transition focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg
          ${isSignedIn ? 'hover:gap-4' : ''}`}
        >
          {isSignedIn ? (
            <>
              Go to Dashboard
              <svg className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          ) : (
            'Get Started Now'
          )}
        </button>
      </section>

      {/* FOOTER */}
      <footer className="w-full border-t border-gray-200 dark:border-gray-800 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} FoundrBox. All rights reserved.
      </footer>
    </main>
  )
}
