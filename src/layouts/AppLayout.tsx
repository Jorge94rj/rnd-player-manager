import { Outlet } from "react-router-dom";
import AppNav from "./components/AppNav";

export default function AppLayout() {
  return (
    <section className="bg-primary min-h-screen">
      <AppNav />
      <Outlet />
    </section>
  );
}
