/**
 * src/pages/Admin/components/TabButton.jsx
 * Jednostavan tab dugme koje menja stil na osnovu toga da li je aktivno ili ne.
 * @param {Object} props - Props za komponentu.
 * @param {boolean} props.active - Da li je tab aktivan.
 * @param {Function} props.onClick - Funkcija koja se poziva na klik.
 * @param {React.Component} props.icon - Ikona koja se prikazuje u tabu.
 * @param {string} props.label - Tekst koji se prikazuje u tabu.
 */
export default function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${
        active
          ? 'bg-neutral-900 text-white shadow-lg shadow-neutral-300 scale-105'
          : 'bg-white text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 border border-neutral-200'
      }`}
    >
      <Icon size={18} /> {label}
    </button>
  );
}
