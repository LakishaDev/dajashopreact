import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles/base.css";
import { ThemeProvider } from "./context/ThemeProvider.jsx";
import { CartProvider } from "./context/CarProvider.jsx";
import { AuthProvider } from "./context/AuthProvider.jsx";
import { FlashProvider } from "./context/FlashContext.jsx";
import { UndoProvider } from "./context/UndoProvider.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          <FlashProvider>
            <UndoProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
            </UndoProvider>
          </FlashProvider>
        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);
