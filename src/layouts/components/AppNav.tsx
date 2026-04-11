import { Link } from "react-router-dom";
import { message } from "@tauri-apps/plugin-dialog";
import { useExportDB } from "../../hooks/useExportDB";
import { useScanDrive } from "../../hooks/useScanDrive";

export default function AppNav() {
  const { exportDb } = useExportDB();
  const { status, failedFiles, pickFolder, scanDrive } = useScanDrive();

  const handleScanDrive = async () => {
    await pickFolder();
    await scanDrive();
    await message(
      status + (failedFiles.length > 0 ? `\nFailed files:\n${failedFiles.join("\n")}` : ""),
      {
        title: "Scan Results",
        kind: "info",
      }
    );
  };

  return (
    <nav className="flex gap-8 px-4 py-4 shadow-md mb-8 bg-secondary justify-between items-center">
      <Link to="/" className="text-white text-xl">
        Home - RND Player Manager
      </Link>
      <div className="flex gap-4">
        <button
          className="cursor-pointer px-3 py-2 font-semibold border rounded-lg border-white text-white hover:bg-blue-50 hover:text-primary rounded-md transition-colors"
          onClick={handleScanDrive}
        >
          Scan drive
        </button>
        <button
          className="cursor-pointer px-3 py-2 font-semibold border rounded-lg border-white text-white hover:bg-blue-50 hover:text-primary rounded-md transition-colors"
          onClick={exportDb}
        >
          Export DB
        </button>
      </div>
    </nav>
  );
}
