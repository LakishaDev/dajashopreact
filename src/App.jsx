import AppRoutes from "./router.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import AuthModal from "./components/AuthModal.jsx";

import { ReactLenis } from "lenis/react";
import { useEffect, useRef } from "react";

export default function App() {
  const lenisRef = useRef();

  useEffect(() => {
    function update(time) {
      lenisRef.current?.lenis?.raf(time);
    }

    const rafId = requestAnimationFrame(update);

    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="app-root">
      <ReactLenis
        root
        options={{
          lerp: 0.08, // smoothness (0 - 1)
          smoothWheel: true, // enables smooth for mouse/touchpad
          autoRaf: true, // automatski animira
          anchors: true, // omogućava glatko skrolovanje do anchor linkova
          touchMultiplier: 0.5, // povećava brzinu skrolovanja na touch uređajima
        }}
        ref={lenisRef}
      />
      <Header />
      <main className="container" style={{ padding: "20px 0 48px" }}>
        <AuthModal />
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
}
