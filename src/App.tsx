import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/sidebar/sidebar";
import { useState } from "react";
import HomePage from "./pages/HomePage";
import CollectionsPage from "./pages/Collections";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#1B1B1F] text-white">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <header className="sticky top-0 z-10 bg-[#26242E] shadow-lg">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-[#AA0235] hover:text-[#FFC267] transition"
              >
                <i className="bx bx-menu text-3xl"></i>
              </button>
              <h1 className="text-3xl font-bold text-[#AA0235] flex-1 text-center">
                🎬 PopMe Social Network
              </h1>
              <div className="w-8"></div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/collections" element={<CollectionsPage searchQuery="" />} />
            {/* Las otras rutas se agregarán cuando estén listas */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}