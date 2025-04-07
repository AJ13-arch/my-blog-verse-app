
import { Navbar } from "@/components/Navbar";
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container max-w-4xl py-16 mt-4">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
