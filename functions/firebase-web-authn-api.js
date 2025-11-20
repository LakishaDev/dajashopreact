export async function onRequest(context) {
  // TVOJ FIREBASE URL (Zameni ovo sa onim dugačkim linkom koji si našao malopre)
  const FIREBASE_FUNCTION_URL =
    'https://europe-west1-daja-shop-site.cloudfunctions.net/ext-firebase-web-authn-api';

  const { request } = context;

  // Kreiramo novi zahtev ka Firebase-u
  // Kopiramo metodu (POST/GET) i zaglavlja, ali šaljemo na novi URL
  const newRequest = new Request(FIREBASE_FUNCTION_URL, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });

  // Šaljemo zahtev i čekamo odgovor od Google-a
  const response = await fetch(newRequest);

  // Vraćamo odgovor tvom sajtu (React aplikaciji)
  return response;
}
