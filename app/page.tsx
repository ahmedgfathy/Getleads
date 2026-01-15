import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-5xl font-bold mb-4">
          Welcome to Getleads
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          A powerful lead generation platform to help grow your business
        </p>
        <div className="flex gap-4 justify-center mb-12">
          <Link 
            href="/login"
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg transform hover:scale-105"
          >
            Get Started
          </Link>
          <Link 
            href="/login"
            className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
          >
            Sign In
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-semibold mb-2">📊 Analytics</h3>
            <p className="text-gray-600">Track and analyze your leads in real-time</p>
          </div>
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-semibold mb-2">🎯 Targeting</h3>
            <p className="text-gray-600">Reach the right audience with precision</p>
          </div>
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-semibold mb-2">⚡ Automation</h3>
            <p className="text-gray-600">Automate your lead generation workflow</p>
          </div>
        </div>
      </div>
    </main>
  )
}
