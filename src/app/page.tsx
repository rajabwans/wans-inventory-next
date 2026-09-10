import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:py-32">
          <div className="text-center">
            <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
              WANPLAN
            </h1>
            <p className="mt-6 text-xl text-purple-100 max-w-2xl mx-auto">
              Simple, powerful inventory management for your business
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link
                href="/wans/login"
                className="rounded-lg bg-white px-8 py-4 text-lg font-semibold text-indigo-600 shadow-lg hover:bg-purple-50 transition"
              >
                Login
              </Link>
              <Link
                href="/wans/signup"
                className="rounded-lg border-2 border-white px-8 py-4 text-lg font-semibold hover:bg-white/10 transition"
              >
                Sign Up Free
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-semibold">Inventory Tracking</h3>
              <p className="mt-3 text-gray-600">
                Track stock levels, costs, and expiry dates with batch management
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-semibold">Sales & Reports</h3>
              <p className="mt-3 text-gray-600">
                Record sales, track payments, and generate detailed reports
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-semibold">Offline Ready</h3>
              <p className="mt-3 text-gray-600">
                Works offline and syncs when you&apos;re back online
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2024 WANPLAN. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
