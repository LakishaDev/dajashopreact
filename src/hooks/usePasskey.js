import { useState } from 'react';
import { useAuth } from './useAuth';
import { base64URLToBuffer, bufferToBase64URL } from '../utils/webauthnUtils';

export const usePasskey = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. REGISTRACIJA PASSKEY-a (Linkovanje za Google nalog)
  const registerPasskey = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!user)
        throw new Error('Morate biti ulogovani (Google) da bi dodali Passkey.');

      // Dobijamo ID token da dokažemo serveru ko smo
      const token = await user.getIdToken();
      // A) Tražimo izazov (Challenge) od servera preko PROXY-ja
      const respStart = await fetch(
        '/firebase-web-authn-api/register-challenge',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // BITNO: Šaljemo token!
          },
          body: JSON.stringify({ userId: user.uid }), // Vežemo za Google UID
        }
      );

      if (!respStart.ok)
        throw new Error('Server nije uspeo da generiše izazov.');
      const options = await respStart.json();

      // B) Pripremamo opcije za brauzer (dekodiranje)
      const publicKey = {
        ...options,
        challenge: base64URLToBuffer(options.challenge),
        user: {
          ...options.user,
          id: base64URLToBuffer(options.user.id),
        },
        // Ovo sprečava ponovnu registraciju istog uređaja
        excludeCredentials: options.excludeCredentials?.map((cred) => ({
          ...cred,
          id: base64URLToBuffer(cred.id),
        })),
      };

      // C) Otvaramo sistemski prozor za otisak prsta/FaceID
      const credential = await navigator.credentials.create({ publicKey });

      // D) Pakujemo rezultat nazad za server
      const credentialData = {
        id: credential.id,
        rawId: bufferToBase64URL(credential.rawId),
        type: credential.type,
        response: {
          attestationObject: bufferToBase64URL(
            credential.response.attestationObject
          ),
          clientDataJSON: bufferToBase64URL(credential.response.clientDataJSON),
        },
      };

      // E) Verifikacija na serveru
      const respVerify = await fetch(
        '/firebase-web-authn-api/register-verify',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(credentialData),
        }
      );

      if (!respVerify.ok) throw new Error('Neuspešna verifikacija Passkey-a.');

      return true; // Uspeh!
    } catch (err) {
      console.error(err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { registerPasskey, loading, error };
};
