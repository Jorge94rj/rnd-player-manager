import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export const useExportDB = () => {
  const [dbPath, setDbPath] = useState("");
  const [status, setStatus] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const loadDbPath = async () => {
      try {
        const path = await invoke<string>("get_db_path");
        setDbPath(path);
      } catch (error) {
        setStatus(`Unable to resolve internal DB path: ${String(error)}`);
      }
    };

    loadDbPath();
  }, []);

  const exportDb = async () => {
    setExporting(true);
    setStatus("Preparing export...");

    try {
      const destination = await invoke<string | null>("pick_export_file");
      if (!destination) {
        setStatus("Export canceled.");
        return;
      }

      const result = await invoke<string>("export_db", { destination });
      setStatus(`Exported DB to ${result}`);
    } catch (error) {
      setStatus(`Export failed: ${String(error)}`);
    } finally {
      setExporting(false);
    }
  };

  return {
    dbPath: dbPath,
    status: status,
    exporting: exporting,
    exportDb,
  };
};
