export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="z-10 w-full max-w-5xl items-center justify-center font-mono text-sm">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            🎯 NicheMaster Pro
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-Powered Niche Research & Content Factory
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">📊</div>
              <h2 className="text-2xl font-bold mb-2 text-gray-800">Module 1</h2>
              <p className="text-gray-600">Niche Analysis & Trend Research</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🎬</div>
              <h2 className="text-2xl font-bold mb-2 text-gray-800">Module 2</h2>
              <p className="text-gray-600">Automated Content Factory</p>
            </div>
          </div>

          <div className="mt-12 p-6 bg-white/50 rounded-lg backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              🚀 Phase 1: MVP Setup Complete
            </h3>
            <p className="text-sm text-gray-600">
              Next.js 14 + TypeScript + Tailwind CSS + PostgreSQL + Redis
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
