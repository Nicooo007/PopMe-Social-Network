import { useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./components/sidebar/sidebar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import HomePage from "./pages/HomePage";
import CollectionsPage from "./pages/Collections";
import "./index.css";
import MoviesPage from "./pages/MoviesPage";
import logo from "./assets/Popme.png";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collectionsSearch, setCollectionsSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleLoginSuccess = () => {
    navigate("/home");
  };

  // Rutas donde no queremos header/sidebar
  const noHeaderRoutes = ["/", "/register", "/forgot-password"];
  const showHeader = !noHeaderRoutes.includes(location.pathname);

  // Perfil: queremos que pueda usar todo el ancho
  const isProfile = location.pathname === "/profile";

  return (
    <div className="min-h-screen bg-[#1B1B1F] text-white">
      {showHeader && (
        <>
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onSelectMenu={(page) => {
              setSidebarOpen(false);
              setCollectionsSearch("");
              if (page === "Profile") navigate("/profile");
              else if (page === "Collections") navigate("/collections");
              else navigate("/home");
            }}
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

                <div className="flex-1 flex justify-center">
                  <img
                    src={logo}
                    alt="PopMe Social Network"
                    className="h-10 object-contain"
                  />
                </div>

                <div className="w-8" />
              </div>

              {location.pathname === "/collections" && (
                <div className="flex justify-center">
                  <div className="relative w-full max-w-md">
                    <input
                      type="text"
                      placeholder="Search"
                      value={collectionsSearch}
                      onChange={(e) => setCollectionsSearch(e.target.value)}
                      className="w-full px-4 py-3 pl-10 bg-[#1B1B1F] text-white border border-gray-700 rounded-full focus:outline-none focus:border-[#FFC267] transition"
                    />
                    <i className="bx bx-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              )}
            </div>
          </header>
        </>
      )}

      <main
        className={
          isProfile
            ? "w-full px-0 py-6" // perfil sin max-width
            : "max-w-4xl mx-auto px-6 py-6"
        }
      >
        <Routes>
          <Route
            path="/"
            element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
          />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route
            path="/collections"
            element={<CollectionsPage searchQuery={collectionsSearch} />}
          />
        </Routes>
      </main>
    </div>
  );
}
