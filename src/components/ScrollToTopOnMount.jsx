// /src/components/UI/ScrollToTopOnMount.jsx
// Komponenta koja skroluje na vrh stranice pri montiranju
// Koristi se u kombinaciji sa Lenis skrolovanjem
// offset: dodatno pomeranje od vrha (pozitivno ili negativno)
// duration: trajanje skrolovanja u sekundama
// delay: vreme u ms pre nego što krene skrolovanje
import { useLayoutEffect } from "react";

const ScrollToHashOrTopOnMount = ({
  offset = 0,
  duration = 1.2,
  delay = 100,
  useHash = true, // da li koristi hash iz URL
  hash: customHash = "", // možeš proslediti custom hash
}) => {
  useLayoutEffect(() => {
    let el = null;
    if (useHash) {
      const hash = customHash || window.location.hash;
      if (hash) {
        el = document.getElementById(hash.replace("#", ""));
      }
    }
    if (window.lenis) {
      setTimeout(() => {
        if (el) {
          window.lenis.scrollTo(el, { offset, duration });
        } else {
          window.lenis.scrollTo(0, { offset, duration });
        }
      }, delay);
    }
  }, [offset, duration, delay, useHash, customHash]);

  return null;
};

export default ScrollToHashOrTopOnMount;
