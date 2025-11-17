// ==============================
// File: src/pages/About.jsx
// Sastavlja sve sekcije "O nama"
// ==============================
import React from "react";
import "./About.css";

import AboutHero from "../components/about/AboutHero.jsx";
import AboutStats from "../components/about/AboutStats.jsx";
import AboutStory from "../components/about/AboutStory.jsx";
import AboutMarquee from "../components/about/AboutMarquee.jsx";
import AboutValues from "../components/about/AboutValues.jsx";
import AboutInfoGlass from "../components/about/AboutInfoGlass.jsx";
import AboutTimeline from "../components/about/AboutTimeline.jsx";
import AboutTestimonials from "../components/about/AboutTestimonials.jsx";
import AboutFAQ from "../components/about/AboutFAQ.jsx";
import AboutCTA from "../components/about/AboutCTA.jsx";

export default function About() {
  return (
    <main className="about">
      <AboutHero />
      <AboutStats />
      <AboutStory />
      <AboutMarquee />
      <AboutValues />
      <AboutInfoGlass />
      <AboutTimeline />
      <AboutTestimonials />
      <AboutFAQ />
      <AboutCTA />
    </main>
  );
}
