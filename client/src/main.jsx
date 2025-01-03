import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { EnergyContextProvider } from "./context/EnergyContext.jsx";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ToastContainer />
    <EnergyContextProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </EnergyContextProvider>
  </StrictMode>
);
