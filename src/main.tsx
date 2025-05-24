import App from "./App";
import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Toaster />
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
