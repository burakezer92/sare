import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import SakuraRain from "./components/SakuraRain.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SakuraRain />
    <App />
  </StrictMode>,
);
