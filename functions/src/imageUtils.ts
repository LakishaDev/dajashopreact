import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Pomoćna funkcija za obradu jedne slike
// Pomoćna funkcija za obradu jedne slike
const processSingleImage = async (
  url: string,
  basePath: string,
  bucket: any
) => {
  try {
    // 1. Skidanje
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });

    const buffer = Buffer.from(response.data, "binary");

    // 2. Ekstenzija
    let extension = "jpg";
    const contentType = response.headers["content-type"];
    if (contentType) {
      if (contentType.includes("png")) extension = "png";
      else if (contentType.includes("webp")) extension = "webp";
      else if (contentType.includes("svg")) extension = "svg";
      else if (contentType.includes("avif")) extension = "avif";
    }

    // 3. Generisanje putanje (PATH)
    const fileName = `${basePath}/${Date.now()}_${uuidv4()}.${extension}`;
    const file = bucket.file(fileName);

    await file.save(buffer, {
      metadata: { contentType: contentType || "image/jpeg" },
    });

    // 4. URL
    const [tokenizedUrl] = await file.getSignedUrl({
      action: "read",
      expires: "01-01-2500",
    });

    return {
      success: true,
      originalUrl: url,
      newUrl: tokenizedUrl,
      storagePath: fileName, // <--- NOVO: Vraćamo i putanju (path)
    };
  } catch (error: any) {
    console.error(`Failed to process image: ${url}`, error.message);
    return {
      success: false,
      originalUrl: url,
      error: error.message,
    };
  }
};

export const saveImageFromUrl = functions.https.onCall(
  {
    region: "europe-west3",
    timeoutSeconds: 300, // Povećavamo timeout jer sada skidamo više slika
    memory: "1GiB", // Povećavamo memoriju za svaki slučaj
  },
  async (data, context) => {
    // --- PARSIRANJE ---
    const requestData = data as any;
    let inputUrls = requestData.url; // Može biti string sa zarezima
    let productName = requestData.productName;

    // Fallback za ugnježdene podatke
    if (!inputUrls && requestData.data) {
      inputUrls = requestData.data.url;
      productName = requestData.data.productName;
    }

    console.log("DEBUG: Raw URLs:", inputUrls);

    if (!inputUrls || typeof inputUrls !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "URL (ili lista URL-ova) je obavezan string."
      );
    }

    // --- PRIPREMA NIZA LINKOVA ---
    // Razdvajamo po zarezu i čistimo prazna mesta
    const urlList = inputUrls
      .split(",")
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    if (urlList.length === 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Nije pronađen nijedan validan link."
      );
    }

    try {
      // Sanitizacija imena foldera
      let folderName = "uncategorized";
      if (productName) {
        folderName = String(productName)
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9-_]/g, "-")
          .replace(/-+/g, "-");
      }

      const basePath = `products/${folderName}`;
      const bucket = admin.storage().bucket();

      // --- BATCH OBRADA (PARALELNO) ---
      // Mapiramo svaki URL u Promise i čekamo da se svi završe
      const results = await Promise.all(
        urlList.map((url) => processSingleImage(url, basePath, bucket))
      );

      // Filtriramo samo one koji su uspeli da bi vratili 'glavni' url (prvi uspešan)
      const successfulUploads = results.filter((r) => r.success);

      // Glavni return objekat
      return {
        success: successfulUploads.length > 0,
        // Vraćamo prvi uspešan link kao 'url' da ne bi pukao stari frontend kod koji očekuje .url
        url: successfulUploads.length > 0 ? successfulUploads[0].newUrl : null,
        // Vraćamo kompletan niz rezultata za novi frontend kod (za prikaz svih slika)
        results: results,
        totalProcessed: results.length,
        successCount: successfulUploads.length,
      };
    } catch (error: any) {
      console.error("Global Upload error:", error.message);
      throw new functions.https.HttpsError(
        "internal",
        `Backend greška: ${error.message}`
      );
    }
  }
);
