import { Link, useLocation, useNavigate } from "react-router-dom";
import "./sidebar.css";
import logo from "../../assets/Popme.png";
import supabase from "../../supabaseClient";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMenu?: (menu: string) => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: "/home", label: "Home", icon: "bx-home" },
    { path: "/movies", label: "Movies", icon: "bx-movie" },
    { path: "/collections", label: "Collections", icon: "bx-heart" },
    { path: "/profile", label: "Profile", icon: "bx-user" },
  ];

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
      return;
    }
    onClose();
    navigate("/"); // ruta donde tienes LoginPage
  };

  return (
    <>
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 40,
            transition: "opacity 0.3s",
          }}
          onClick={onClose}
        ></div>
      )}

      <aside
        className={`sidebar ${isOpen ? "open" : "closed"}`}
        style={{ zIndex: 50 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="logo-section">
          <img src={logo} alt="PopMe logo" className="logo" />
        </div>

        <button className="menu-toggle" onClick={onClose}>
          <i className="bx bx-x"></i>
        </button>

        <nav className="nav">
          <ul>
            {menuItems.map((item) => (
              <li
                key={item.path}
                className={location.pathname === item.path ? "active" : ""}
              >
                <Link
                  to={item.path}
                  onClick={onClose}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    width: "100%",
                  }}
                >
                  <i className={`bx ${item.icon}`}></i>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button className="logout" onClick={handleLogout}>
          <i className="bx bx-log-out"></i>
          <span>Log Out</span>
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
