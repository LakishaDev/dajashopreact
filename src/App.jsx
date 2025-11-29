import AppRoutes from './router.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import AuthModal from './components/AuthModal.jsx';
import { useLocation } from 'react-router-dom';
import NewsletterModal from './components/modals/NewsletterModal.jsx';
import { ReactLenis } from 'lenis/react';
import { useEffect, useRef } from 'react';

export default function App() {
  const lenisRef = useRef();
  const { pathname } = useLocation(); // Hvatamo trenutnu putanju

  const isWidePage =
    pathname.startsWith('/catalog') ||
    pathname === '/daljinski' ||
    pathname === '/baterije' ||
    pathname === '/naocare';
  // Animacija frejma za Lenis
  useEffect(() => {
    function update(time) {
      lenisRef.current?.lenis?.raf(time);
    }
    const rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Resetovanje skrola na vrh pri promeni stranice
  useEffect(() => {
    if (lenisRef.current?.lenis) {
      // 'immediate: true' znači da nema animacije vraćanja gore, samo se stvori gore (brže je)
      lenisRef.current.lenis.scrollTo(0, { duration: 1.2 }); // Možeš podesiti trajanje animacije po potrebi
    }
  }, [pathname]);

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
      >
        <Header />
        <main
          className={isWidePage ? 'w-full' : 'container'}
          style={{ padding: '20px 0 48px' }}
        >
          <AuthModal />
          <NewsletterModal />
          <AppRoutes />
        </main>
        <Footer />
      </ReactLenis>
    </div>
  );
}
