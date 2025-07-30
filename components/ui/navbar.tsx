'use client'

import { useUser, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function Navbar() {
  const { isSignedIn } = useUser()

  return (
    <nav className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo / Brand */}
        <Link href="/" className="text-2xl font-bold text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-500 transition">
          FoundrBox
        </Link>

        {/* Navigation links */}
        <div className="hidden md:flex space-x-6 text-gray-700 dark:text-gray-300 font-medium">
          <Link href="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Dashboard</Link>
          <Link href="/lean-canvas" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Lean Canvas</Link>
          <Link href="/research" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Research</Link>
          <Link href="/pitch-builder" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Pitch Deck</Link>
          <Link href="/matchmaking" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Matchmaking</Link>
        </div>

        {/* Auth buttons */}
        <div className="flex space-x-4">
          {isSignedIn ? (
            <UserButton />
          ) : (
            <>
              <SignInButton>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-md font-semibold transition focus:outline-none focus:ring-4 focus:ring-blue-300">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md font-semibold hover:bg-blue-50 active:bg-blue-100 transition focus:outline-none focus:ring-4 focus:ring-blue-300">
                  Sign Up
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
