// functions/src/imageUtils.ts

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

if (admin.apps.length === 0) {
  admin.initializeApp();
}

interface ImageRequestData {
  url: string;
  productName: string;
}

export const saveImageFromUrl = functions.https.onCall(
  {
    region: "europe-west3",
  },
  async (data, context) => {
    const { url: imageUrl, productName } = data as unknown as ImageRequestData;

    if (!imageUrl) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "URL slike je obavezan."
      );
    }

    try {
      // 1. Kreiranje bezbednog imena foldera
      let folderName = "uncategorized";
      if (productName) {
        folderName = productName
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9-_]/g, "-")
          .replace(/-+/g, "-");
      }

      const basePath = `products/${folderName}`;

      // 2. Skidanje slike
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });

      const buffer = Buffer.from(response.data, "binary");

      // Određivanje ekstenzije na osnovu Content-Type
      let extension = "jpg";
      const contentType = response.headers["content-type"];
      if (contentType && contentType.includes("image/png")) extension = "png";
      else if (contentType && contentType.includes("image/webp"))
        extension = "webp";
      else if (contentType && contentType.includes("image/jpeg"))
        extension = "jpg";

      const fileName = `${basePath}/${Date.now()}_${uuidv4()}.${extension}`;

      const bucket = admin.storage().bucket();
      const file = bucket.file(fileName);

      // 3. Čuvanje
      await file.save(buffer, {
        metadata: { contentType: contentType || "image/jpeg" },
      });

      // 4. Generisanje POTPISANOG (tokenizovanog) URL-a - KORIGOVANO
      // getSignedUrl vraća niz, pa koristimo destructuring ili [0]
      const [tokenizedUrl] = await file.getSignedUrl({
        action: "read",
        // Postavljamo datum isteka daleko u budućnost, čime imitiramo trajni token
        expires: "01-01-2500",
      });

      return { success: true, url: tokenizedUrl };
    } catch (error: any) {
      console.error("Upload error:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  }
);
