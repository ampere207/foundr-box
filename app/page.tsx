// src/app/page.tsx

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col items-center justify-center px-6 py-12">
      <h1 className="text-4xl font-extrabold mb-4 text-blue-700 dark:text-blue-400">
        Welcome to FoundrBox
      </h1>
      <p className="max-w-xl text-center text-gray-700 dark:text-gray-300 mb-8">
        Your smart startup operating system — idea validation, market research, pitch deck builder, and co-founder matchmaking all in one place.
      </p>

      <button
        type="button"
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 rounded-md text-white font-semibold transition"
      >
        Get Started
      </button>
    </main>
  )
}