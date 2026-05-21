import App from "@/app/App.tsx";
import { initTheme } from "@/app/providers/ThemeProvider/lib/initTheme";
import "@/app/styles/index.css";
import HawkCatcher from "@hawk.so/javascript";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

new HawkCatcher({
  token: import.meta.env.VITE_HAWK_TOKEN,
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js");
    //      .then((reg) => console.log("SW registered:", reg))
    //      .catch((err) => console.log("SW error:", err));
  });
}

initTheme();

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
