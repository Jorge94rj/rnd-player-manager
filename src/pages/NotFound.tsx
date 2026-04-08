import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 text-center">
      <h1 className="mb-4 text-4xl font-bold text-red-600">404 - Page Not Found</h1>
      <p className="mb-8 text-gray-600">The page you're looking for doesn't exist.</p>
      <Link
        to="/"
        className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go Home
      </Link>
    </main>
  );
}
