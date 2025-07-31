'use client'

import { useUser, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const { isSignedIn } = useUser()
  const pathname = usePathname()
  const strategistName = 'Growth Strategist' // Updated name for the strategist link

  const links = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Idea Validator', href: '/idea-validator' },
    { name: 'Market Research', href: '/market-research' },
    { name: 'Pitch Deck Assistant', href: '/pitch-assistant' },
    { name: strategistName, href: '/growth-strategist' },
    { name: 'Find a Cofounder', href: '/find-a-cofounder' },
  ]

  return (
    <nav className="w-full bg-white/90 dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-800 shadow-md backdrop-blur-2xl z-50">
      <div className="mx-auto flex items-center px-6 py-3">
        {/* Left: Logo */}
        <div className="flex-shrink-0">
          <Link
            href="/"
            className="text-2xl font-extrabold text-blue-700 dark:text-blue-400 tracking-tight hover:text-blue-800 dark:hover:text-blue-500 transition"
          >
            FoundrBox
          </Link>
        </div>

        {/* Center: nav links */}
        <div className="flex flex-grow justify-center">
          <nav className="flex space-x-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  px-4 py-2
                  rounded-full border
                  border-blue-200 dark:border-blue-600
                  bg-white/80 dark:bg-gray-900/80
                  text-gray-800 dark:text-blue-200
                  font-medium shadow-sm
                  transition-all duration-200
                  hover:bg-blue-50 dark:hover:bg-blue-800/40
                  hover:border-blue-400 dark:hover:border-blue-400
                  hover:text-blue-700 dark:hover:text-blue-200
                  outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:border-blue-400
                  ${pathname === link.href
                    ? 'ring-2 ring-blue-500 border-blue-500 text-blue-800 bg-blue-100 dark:bg-blue-950 dark:border-blue-500'
                    : ''
                  }
                `}
                style={{
                  minWidth: 'max-content',
                  letterSpacing: '0.04em',
                }}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: Auth buttons */}
        <div className="flex-shrink-0 flex items-center space-x-4">
          {isSignedIn ? (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-9 h-9 ring-2 ring-blue-500 hover:ring-blue-600 transition',
                },
              }}
              showName
            />
          ) : (
            <>
              <SignInButton>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-full font-semibold shadow transition focus:outline-none focus:ring-4 focus:ring-blue-300">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-full font-semibold hover:bg-blue-50 active:bg-blue-100 transition focus:outline-none focus:ring-4 focus:ring-blue-200">
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
