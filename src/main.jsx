import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// 👇 Ajoute cette ligne
import PreviewGate from "./PreviewGate";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* 👇 Enveloppe ton App ici */}
      <PreviewGate>
        <App />
      </PreviewGate>
    </BrowserRouter>
  </React.StrictMode>
);
