import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md border border-gray-100 p-8 text-center">
        
        {/* Header Branding */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">SCCL Portal</h1>
          <p className="text-sm text-gray-500 mt-2">
            Manage your spaces and smart lab bookings efficiently
          </p>
        </div>

        {/* Navigation Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link 
            href="/login" 
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            Log In
          </Link>
          
          <Link 
            href="/signup" 
            className="flex items-center justify-center bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg border border-gray-200 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            Create Account
          </Link>
        </div>

        {/* Optional Footer Text */}
        <div className="mt-8 text-xs text-gray-400">
          Universiti Teknologi Malaysia • MJIIT
        </div>

      </div>
    </div>
  );
}