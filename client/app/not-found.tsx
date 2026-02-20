import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">404</h1>
          <div className="w-24 h-1 bg-linear-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Page Not Found</h2>
          <p className="text-gray-600 leading-relaxed">Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved, deleted, or you entered the wrong URL.</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link href="/" className="inline-flex items-center justify-center w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl">
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </Link>

          <Link href="javascript:history.back()" className="inline-flex items-center justify-center w-full px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </Link>
        </div>

        {/* Search Suggestion */}
        <div className="mt-8 p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20">
          <div className="flex items-center justify-center text-gray-600 mb-2">
            <Search className="w-4 h-4 mr-2" />
            <span className="text-sm">Looking for something specific?</span>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/admin" className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors">
              Admin Dashboard
            </Link>
            <Link href="/auth" className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors">
              Login
            </Link>
            <Link href="/contact" className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors">
              Contact
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-gray-500">Error Code: 404 • Page Not Found</div>
      </div>
    </div>
  );
}
