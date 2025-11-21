// ==============================
// File: src/components/about/AboutTimeline.jsx
// Vizuelna Hronologija - Dinamički Timeline sa tačnim početkom 2007.
// ==============================
import React from 'react';
import { motion } from 'framer-motion';

const timelineEvents = [
  {
    year: '2007',
    title: 'Osnivanje i Vizija Duga 18 Godina',
    description:
      'Daja Shop zvanično započinje sa radom u Nišu. Od samog starta, fokus je na autentičnosti i poverenju u lokalnoj trgovini.',
  },
  {
    year: '2012',
    title: 'Otvaranje Centralnog Maloprodajnog Objekta',
    description:
      'Uspostavljanje fizičkog prisustva u TPC Kalča, čime je brend postao lako dostupan centralnoj niškoj klijenteli.',
  },
  {
    year: '2016',
    title: 'Digitalna Tranzicija i Prva Online Prodaja',
    description:
      'Lansiranje prve verzije e-commerce platforme, šireći domet prodaje satova van Niša na teritoriju cele Srbije.',
  },
  {
    year: '2020',
    title: 'Strategija Brend Partnerstva i Sertifikacija',
    description:
      'Potpisivanje ključnih ugovora za distribuciju vodećih svetskih brendova, uz zvaničnu garanciju autentičnosti.',
  },
  {
    year: '2024',
    title: 'Fokus na Premium Online Iskustvo',
    description:
      'Potpuna optimizacija sajta, uvođenje naprednih tehnologija i usavršavanje digitalne korisničke podrške za besprekorno iskustvo.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function AboutTimeline() {
  return (
    <motion.section
      className="section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      <div
        className="container"
        style={{ maxWidth: '800px', margin: '0 auto' }}
      >
        <motion.h2
          className="h2 text-center"
          variants={itemVariants}
          style={{ marginBottom: '60px' }}
        >
          Naša Hronologija: 18 Godina Poverenja
        </motion.h2>

        <motion.div className="timeline-container">
          {timelineEvents.map((event, index) => (
            <motion.div
              key={index}
              className="timeline-item"
              variants={itemVariants}
              style={{
                marginBottom: index === timelineEvents.length - 1 ? 0 : '50px',
              }}
            >
              <div
                className="timeline-dot"
                style={{
                  background: 'var(--color-primary)',
                  borderColor: 'var(--color-surface, white)',
                }}
              />
              <p
                className="pill"
                style={{
                  marginBottom: '8px',
                  background: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                }}
              >
                {event.year}
              </p>
              <h3
                className="h3"
                style={{ color: 'var(--color-text)', marginBottom: '4px' }}
              >
                {event.title}
              </h3>
              <p className="lead" style={{ fontSize: '16px' }}>
                {event.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
