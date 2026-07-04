// Mounts the Orbit dashboard app into the page
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { OrbitApp } from "./OrbitApp";
import "./orbit.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <OrbitApp />
  </StrictMode>,
);
