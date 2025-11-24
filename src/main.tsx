import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";   // ⭐ IMPORTANTE
import "./App.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>         {/* ⭐ Aquí activas la navegación */}
      <App />
    </BrowserRouter>
  </StrictMode>
);
