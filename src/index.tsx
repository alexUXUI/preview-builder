import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./uidsf/variables.css";
import "./uidsf/reset.css";
import "./uidsf/theme.css";

const rootEl = document.getElementById("root");
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
