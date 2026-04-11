import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

type ScanDriveResponse = {
  failed_files: string[];
};

export const useScanDrive = () => {
  const [folderPath, setFolderPath] = useState("");
  const [status, setStatus] = useState("");
  const [failedFiles, setFailedFiles] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);

  const pickFolder = async () => {
    try {
      const result = await invoke<string | null>("pick_folder");
      if (result) {
        setFolderPath(result);
      }
    } catch (error) {
      setStatus(`Folder picker failed: ${String(error)}`);
    }
  };

  const scanDrive = async () => {
    if (!folderPath) {
      setStatus("Please select a folder to scan.");
      return;
    }

    setScanning(true);
    setStatus("Scanning...");
    setFailedFiles([]);

    try {
      const result = await invoke<ScanDriveResponse>("scan_drive", {
        folderPath,
      });
      setFailedFiles(result.failed_files);
      setStatus(`Scan complete. ${result.failed_files.length} failed file(s).`);
    } catch (error) {
      setStatus(`Scan failed: ${String(error)}`);
    } finally {
      setScanning(false);
    }
  };

  return {
    folderPath,
    setFolderPath,
    status,
    failedFiles,
    scanning,
    pickFolder,
    scanDrive,
  };
};
