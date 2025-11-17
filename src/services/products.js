// Firestore + Storage helpers za proizvode
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  setDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../services/firebase";

const COL = "products";

export function subscribeProducts({ onData, onError, order = "name" } = {}) {
  const colRef = collection(db, COL);
  const q = query(colRef, orderBy(order));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      onData?.(items);
    },
    (err) => onError?.(err)
  );
}

export async function saveProduct(partial) {
  if (!partial?.id) throw new Error("saveProduct: nedostaje id");
  const refDoc = doc(db, COL, partial.id);
  try {
    await updateDoc(refDoc, { ...partial, updatedAt: serverTimestamp() });
  } catch (e) {
    // ako dokument ne postoji – kreiraj
    await setDoc(
      refDoc,
      {
        ...partial,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
}

export async function uploadImages(productId, files, onProgress) {
  const uploads = Array.from(files).map(
    (file) =>
      new Promise((resolve, reject) => {
        const path = `products/${productId}/${Date.now()}_${file.name}`;
        const r = ref(storage, path);
        const task = uploadBytesResumable(r, file);
        task.on(
          "state_changed",
          (snap) => {
            const pct = Math.round(
              (snap.bytesTransferred / snap.totalBytes) * 100
            );
            onProgress?.({ file, progress: pct });
          },
          (err) => reject(err),
          async () => {
            const url = await getDownloadURL(task.snapshot.ref);
            resolve({ url, path });
          }
        );
      })
  );
  return Promise.all(uploads);
}

export async function addImages(productId, images) {
  const refDoc = doc(db, COL, productId);
  // čitamo postojeće preko snapshot-a u UI; ovde samo merge
  await updateDoc(refDoc, {
    images: images.map((x) => ({ url: x.url, path: x.path })),
    updatedAt: serverTimestamp(),
  });
}

export async function removeImagesByPaths(productId, paths = []) {
  // brišemo iz Storage, pa u UI osvežimo iz snapshot-a
  await Promise.all(
    paths.map(async (p) => {
      try {
        const r = ref(storage, p); // radi i sa full URL i sa path
        await deleteObject(r);
      } catch (e) {
        // ignore pojedinačne greške da bi se nastavilo
        console.error("Delete failed:", p, e);
      }
    })
  );
  // Firestore kolekciju slika update radi UI (na osnovu snapshot-a posle re-uploada/brisanja)
}
