import { Routes, Route } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import Home from "../pages/Home";
import ScanDrive from "../pages/ScanDrive";
import ExportDB from "../pages/ExportDB";
import NotFound from "../pages/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="scan-drive" element={<ScanDrive />} />
        <Route path="export-db" element={<ExportDB />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
