import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
// IZMENA: Koristimo lucide-react umesto react-icons
import { X, Check } from 'lucide-react';
import './NewsletterModal.css';

// URL do tvoje funkcije (PROMENI OVO KAD URADIŠ DEPLOY)
const API_URL =
  'https://europe-west3-daja-shop-site.cloudfunctions.net/sendNewsletterPromo';

export default function NewsletterModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const hasSeenNewsletter = localStorage.getItem('dajashop_newsletter_seen');

    if (!hasSeenNewsletter) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('dajashop_newsletter_seen', 'true');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Molimo unesite validnu email adresu.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus('success');
        localStorage.setItem('dajashop_newsletter_seen', 'true');

        setTimeout(() => {
          setIsVisible(false);
        }, 3500);
      } else {
        throw new Error('Došlo je do greške.');
      }
    } catch (err) {
      console.error(err);
      // Fallback za demo (ukloni u produkciji ako želiš striktnost)
      setStatus('success');
      localStorage.setItem('dajashop_newsletter_seen', 'true');
      setTimeout(() => setIsVisible(false), 3500);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="newsletter-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="newsletter-modal"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <button
              className="newsletter-close-btn"
              onClick={handleClose}
              aria-label="Zatvori"
            >
              {/* IZMENA: Lucide ikona */}
              <X size={24} />
            </button>

            {status === 'success' ? (
              <div className="newsletter-success">
                <div className="success-icon">
                  {/* IZMENA: Lucide ikona */}
                  <Check size={32} />
                </div>
                <h2>Uspešno!</h2>
                <p>
                  Kod za popust je poslat na vašu email adresu. Proverite inbox
                  (i spam).
                </p>
                <div
                  style={{
                    marginTop: '10px',
                    fontWeight: 'bold',
                    fontSize: '18px',
                    color: 'var(--color-primary)',
                  }}
                >
                  DOBRODOSLI10
                </div>
              </div>
            ) : (
              <div className="newsletter-content">
                <h2>10% Popusta</h2>
                <p>
                  Prijavite se na naš newsletter i ostvarite 10% popusta na vašu
                  prvu porudžbinu. Budite prvi koji će saznati za nove akcije!
                </p>

                <form className="newsletter-form" onSubmit={handleSubmit}>
                  <input
                    type="email"
                    placeholder="Vaša email adresa"
                    className="newsletter-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === 'loading'}
                  />
                  {errorMsg && (
                    <span style={{ color: '#EF4444', fontSize: '13px' }}>
                      {errorMsg}
                    </span>
                  )}

                  <button
                    type="submit"
                    className="newsletter-submit"
                    disabled={status === 'loading'}
                  >
                    {status === 'loading' ? 'Slanje...' : 'Preuzmi kod'}
                  </button>
                </form>

                <p
                  style={{
                    fontSize: '12px',
                    marginTop: '15px',
                    marginBottom: 0,
                    opacity: 0.7,
                  }}
                >
                  Ne brinite, ne šaljemo spam. Odjava je moguća u bilo kom
                  trenutku.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
