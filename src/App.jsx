import React from "react";
import AppRoutes from "./router.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import AuthModal from "./components/AuthModal.jsx";

export default function App() {
  return (
    <div className="app-root">
      <Header />
      <main className="container" style={{ padding: "20px 0 48px" }}>
        <AuthModal />
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
}
