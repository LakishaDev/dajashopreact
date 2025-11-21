// ==============================
// File: src/components/about/AboutCTA.jsx
// Poziv na akciju sa ispravnom navigacijom
// ==============================
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom'; // <-- UVOZIMO LINK

// Kreiramo Motion Link komponentu
const MotionLink = motion(Link);

const sectionVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function AboutCTA() {
  return (
    <motion.section
      className="section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={sectionVariants}
    >
      <div
        className="container card shadow"
        style={{
          padding: '60px 30px',
          textAlign: 'center',
          background: 'var(--color-primary)', // Visoki kontrast
          color: 'var(--color-on-primary)',
          gap: '20px',
        }}
      >
        <h2 className="h2" style={{ color: 'var(--color-on-primary)' }}>
          Ne Odugovlačite. Pronađite Sat Koji Odgovara Vašem Stilu.
        </h2>
        <p
          style={{
            maxWidth: '700px',
            margin: '0 auto',
            fontSize: '18px',
            opacity: 0.9,
          }}
        >
          Istražite našu pažljivo odabranu kolekciju i dozvolite nam da Vam
          pomognemo da izaberete savršeni aksesoar.
        </p>

        {/* ZAMENA: Koristimo MotionLink umesto motion.button */}
        <MotionLink
          to="/catalog" // <-- OVDE JE DEFINISANA RUTA
          className="btn-secondary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            marginTop: '20px',
            padding: '12px 30px',
            background: 'var(--color-on-primary)',
            color: 'var(--color-primary)',
            border: 'none',
            borderRadius: '8px',
            fontSize: '17px',
            fontWeight: 700,
            textDecoration: 'none', // Osiguravamo da link izgleda kao dugme
          }}
        >
          Pogledajte Katalog
        </MotionLink>
      </div>
    </motion.section>
  );
}
