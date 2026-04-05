import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import AppErrorBoundary from "./components/AppErrorBoundary";
import { PlayerProvider } from "./context/PlayerContext";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <PlayerProvider>
        <App />
      </PlayerProvider>
    </AppErrorBoundary>
  </React.StrictMode>
);
