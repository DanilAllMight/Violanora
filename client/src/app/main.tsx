import App from "@/app/App.tsx";
import { initTheme } from "@/app/providers/ThemeProvider/lib/initTheme";
import "@/app/styles/index.css";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

initTheme();

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
