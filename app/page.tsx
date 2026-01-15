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
