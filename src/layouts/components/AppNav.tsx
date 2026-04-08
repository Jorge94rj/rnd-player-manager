import { Link } from "react-router-dom";

export default function AppNav() {
  return (
    <nav className="flex gap-8 px-4 py-4 shadow-md mb-8 bg-secondary justify-between items-center">
      <Link to="/" className="text-white text-xl">
        Home - RND Player Manager
      </Link>
      <div className="flex gap-4">
        <Link
          to="/scan-drive"
          className="px-3 py-2 font-semibold border rounded-lg border-white text-white hover:bg-blue-50 hover:text-primary rounded-md transition-colors"
        >
          Scan drive
        </Link>
        <Link
          to="/export-db"
          className="px-3 py-2 font-semibold border rounded-lg border-white text-white hover:bg-blue-50 hover:text-primary rounded-md transition-colors"
        >
          Export DB
        </Link>
      </div>
    </nav>
  );
}
