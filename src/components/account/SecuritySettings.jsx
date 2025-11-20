// src/components/account/SecuritySettings.jsx
import { useState } from 'react'; // ⬅️ Dodali smo useState za lokalni loading
import { useAuth } from '../../hooks/useAuth';
import { GoogleAuthProvider, linkWithPopup } from 'firebase/auth';

const SecuritySettings = () => {
  const { user, linkPasskey } = useAuth(); // ⬅️ Uzimamo linkPasskey iz Context-a
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false); // Lokalni state za dugme

  // Logika za povezivanje Google-a
  const handleGoogleLink = async () => {
    const provider = new GoogleAuthProvider();
    try {
      if (!user) throw new Error('Morate biti ulogovani.');
      await linkWithPopup(user, provider);
      alert('Google nalog uspešno povezan!');
    } catch (err) {
      console.error(err);
      alert('Greška: ' + err.message);
    }
  };

  // Logika za dodavanje Passkey-a (NOVA METODA)
  const handleAddPasskey = async () => {
    setIsPasskeyLoading(true);
    try {
      // Biblioteka traži ime za ključ.
      // Koristimo ime korisnika, email ili generičko ime.
      const passkeyName =
        user.displayName || user.email || 'Moj DajaShop Ključ';

      await linkPasskey(passkeyName);

      alert('✅ Uspešno! Vaš otisak prsta/FaceID je povezan sa nalogom.');
    } catch (err) {
      console.error(err);
      // Često greška bude "OperationError" ako korisnik otkaže, pa možemo lepše ispisati
      alert('❌ Greška: ' + err.message);
    } finally {
      setIsPasskeyLoading(false);
    }
  };

  // Provera da li je Google već povezan
  const isGoogleLinked = user?.providerData.some(
    (p) => p.providerId === 'google.com'
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-6">
      <h2 className="text-xl font-semibold mb-4">Sigurnost i Prijavljivanje</h2>

      {/* --- SEKCIJA 1: GOOGLE --- */}
      <div className="flex items-center justify-between py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <div>
            <span className="font-medium block">Google Nalog</span>
            <span className="text-xs text-gray-500">
              Koristite Google za bržu prijavu.
            </span>
          </div>
        </div>

        {isGoogleLinked ? (
          <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-sm border border-green-200">
            Povezano ✅
          </span>
        ) : (
          <button
            onClick={handleGoogleLink}
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            Poveži sada
          </button>
        )}
      </div>

      {/* --- SEKCIJA 2: PASSKEY --- */}
      <div className="flex items-center justify-between py-4 mt-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔐</span>
          <div>
            <span className="font-medium block">Biometrija (Passkey)</span>
            <span className="text-xs text-gray-500">
              Prijavite se otiskom prsta ili licem.
            </span>
          </div>
        </div>

        <button
          onClick={handleAddPasskey}
          disabled={isPasskeyLoading}
          className={`px-4 py-2 rounded-lg text-white text-sm transition-all shadow-sm ${
            isPasskeyLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-black hover:bg-gray-800'
          }`}
        >
          {isPasskeyLoading ? 'Procesiranje...' : 'Dodaj Passkey +'}
        </button>
      </div>
    </div>
  );
};

export default SecuritySettings;
