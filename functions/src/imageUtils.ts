import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp"; // UVEZENO: Za obradu slika

if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Definicije za resize
const THUMBNAIL_SIZE = 500;
const THUMBNAIL_PREFIX = `resized_${THUMBNAIL_SIZE}x${THUMBNAIL_SIZE}_`;
const ORIGINAL_PREFIX = "original_";
const ADDITIONAL_PREFIX = "additional_";

// --- TIP DEFINICIJE ZA ROBUSTNOST KODA (Ispravljaju sve prethodne greške) ---

interface UploadSuccess {
  success: true;
  originalUrl: string;
  newUrl: string;
  storagePath: string;
}

interface UploadFailure {
  success: false;
  originalUrl: string;
  error: any;
}

type UploadResult = UploadSuccess | UploadFailure;

interface DownloadSuccess {
  success: true;
  buffer: Buffer;
  contentType: string;
  url: string;
}
type DownloadResult =
  | DownloadSuccess
  | { success: false; error: string; url: string };

// Pomoćna funkcija za upload bafera i generisanje URL-a
const uploadBuffer = async (
  buffer: Buffer,
  basePath: string,
  bucket: any,
  originalUrl: string,
  contentType: string,
  fileNamePrefix: string = ORIGINAL_PREFIX
): Promise<UploadSuccess> => {
  let extension = contentType.includes("png") ? "png" : "jpg";

  if (fileNamePrefix.includes(THUMBNAIL_PREFIX)) {
    extension = "webp"; // Koristimo efikasniji format za thumbnail
    contentType = "image/webp";
  } else {
    if (contentType.includes("png")) extension = "png";
    else if (contentType.includes("webp")) extension = "webp";
    else if (contentType.includes("svg")) extension = "svg";
  }

  const fileName = `${basePath}/${fileNamePrefix}${Date.now()}_${uuidv4()}.${extension}`;
  const file = bucket.file(fileName);

  await file.save(buffer, {
    metadata: { contentType: contentType },
  });

  const [tokenizedUrl] = await file.getSignedUrl({
    action: "read",
    expires: "01-01-2500",
  });

  return {
    success: true,
    originalUrl: originalUrl,
    newUrl: tokenizedUrl,
    storagePath: fileName,
  };
};

// Pomoćna funkcija za sigurno preuzimanje slike
const downloadSingleImage = async (url: string): Promise<DownloadResult> => {
  try {
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
    const contentType = response.headers["content-type"] || "image/jpeg";
    return { success: true, buffer, contentType, url };
  } catch (error: any) {
    return { success: false, error: error.message, url };
  }
};

// Pomoćna funkcija za OBRADU DODATNIH SLIKA (samo upload)
const processAdditionalImage = async (
  url: string,
  basePath: string,
  bucket: any
): Promise<UploadResult> => {
  const downloadResult = await downloadSingleImage(url);

  // Ako preuzimanje nije uspelo, vraćamo neuspeh
  if (!downloadResult.success) {
    return { success: false, originalUrl: url, error: downloadResult.error };
  }

  // Ako je uspelo, obrađujemo bafer
  const { buffer, contentType } = downloadResult;
  return uploadBuffer(
    buffer,
    basePath,
    bucket,
    url,
    contentType,
    ADDITIONAL_PREFIX
  );
};

// Pomoćna funkcija za OBRADU GLAVNE SLIKE (resize + original)
const processMainImageWithResize = async (
  url: string,
  basePath: string,
  bucket: any
) => {
  const downloadResult = await downloadSingleImage(url);

  if (!downloadResult.success) {
    return {
      success: false,
      originalUrl: url,
      results: [] as UploadSuccess[],
      mainImageUrl: null,
      thumbnailUrl: null,
    };
  }

  const { buffer, contentType } = downloadResult;
  const originalUrl = url;
  const results: UploadSuccess[] = [];

  // 1. Upload ORIGINALNE slike (za Product stranicu)
  const originalUploadResult = await uploadBuffer(
    buffer,
    basePath,
    bucket,
    originalUrl,
    contentType,
    ORIGINAL_PREFIX
  );
  results.push(originalUploadResult);

  // 2. Resize i upload THUMBNAIL-a (500x500 za Catalog)
  let thumbnailUrl: string | null = null;

  try {
    const resizedBuffer = await sharp(buffer)
      .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, {
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      })
      .webp({ quality: 80 }) // WebP za efikasnost
      .toBuffer();

    const thumbnailUploadResult = await uploadBuffer(
      resizedBuffer,
      basePath,
      bucket,
      originalUrl,
      "image/webp",
      THUMBNAIL_PREFIX
    );

    thumbnailUrl = thumbnailUploadResult.newUrl;
    results.unshift(thumbnailUploadResult); // Thumbnail je PRVI u nizu
  } catch (resizeError: any) {
    console.error(
      `Failed to resize main image: ${originalUrl}`,
      resizeError.message
    );
    // U slučaju greške, za thumbnail koristimo originalni URL
  }

  return {
    success: true,
    originalUrl,
    results: results,
    mainImageUrl: originalUploadResult.newUrl,
    thumbnailUrl: thumbnailUrl || originalUploadResult.newUrl,
  };
};

export const saveImageFromUrl = functions.https.onCall(
  {
    region: "europe-west3",
    timeoutSeconds: 300,
    memory: "1GiB",
  },
  async (data, context) => {
    // --- PARSIRANJE ---
    const requestData = data as any;
    let inputUrls = requestData.url;
    let productName = requestData.productName;

    // Fallback za ugnježdene podatke
    if (!inputUrls && requestData.data) {
      inputUrls = requestData.data.url;
      productName = requestData.data.productName;
    }

    console.log("DEBUG: Raw URLs:", inputUrls);

    // Kljucna validacija (rešava 400 grešku ako je klijent poslao prazan string)
    if (
      !inputUrls ||
      typeof inputUrls !== "string" ||
      inputUrls.trim().length === 0
    ) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "URL (ili lista URL-ova) je obavezan string."
      );
    }

    // --- PRIPREMA NIZA LINKOVA ---
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

    // Odvajamo prvu sliku za specijalnu obradu (resize)
    const mainImageUrl = urlList[0];
    const otherImageUrls = urlList.slice(1);

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

      // --- A. OBRADA GLAVNE SLIKE (sa resize-om) ---
      const mainImageProcess = await processMainImageWithResize(
        mainImageUrl,
        basePath,
        bucket
      );

      if (!mainImageProcess.success && urlList.length === 1) {
        throw new functions.https.HttpsError(
          "internal",
          `Backend greška prilikom obrade glavne slike: ${mainImageProcess.originalUrl}`
        );
      }

      let allResults: UploadResult[] = mainImageProcess.results;

      // --- B. BATCH OBRADA OSTALIH SLIKA (Paralelno, bez resize-a) ---
      const otherResults: UploadResult[] = await Promise.all(
        otherImageUrls.map((url) =>
          processAdditionalImage(url, basePath, bucket)
        )
      );

      // Spajamo sve rezultate u jedan niz (uspešne i neuspešne)
      allResults = [...allResults, ...otherResults];

      const successfulUploads = allResults.filter(
        (r): r is UploadSuccess => r.success
      );

      // --- FINALNI RETURN OBJEKAT ---
      return {
        success: successfulUploads.length > 0,
        // Vraćamo prvi uspešan link KAO THUMBNAIL (url: thumbnailUrl)
        url: mainImageProcess.thumbnailUrl,

        // NOVO: Eksplicitno vraćamo thumbnail URL i URL originala
        thumbnailUrl: mainImageProcess.thumbnailUrl,
        mainImageUrl: mainImageProcess.mainImageUrl,

        // Vraćamo kompletan niz rezultata
        results: allResults,
        totalProcessed: urlList.length,
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
