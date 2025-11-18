// src/services/admin.js
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Generička klasa za upravljanje jednostavnim kolekcijama (Brendovi, Kategorije, SpecKeys)
 */
class CollectionService {
  constructor(collectionName) {
    this.colName = collectionName;
    this.ref = collection(db, collectionName);
  }

  // Subscribe na promene (Realtime)
  subscribe(onData, onError) {
    const q = query(this.ref, orderBy("name", "asc"));
    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        onData(items);
      },
      onError
    );
  }

  async add(name) {
    if (!name.trim()) throw new Error("Naziv ne može biti prazan.");
    return await addDoc(this.ref, {
      name: name.trim(),
      createdAt: serverTimestamp(),
    });
  }

  async update(id, newName) {
    if (!newName.trim()) throw new Error("Naziv ne može biti prazan.");
    const docRef = doc(db, this.colName, id);
    return await updateDoc(docRef, { name: newName.trim() });
  }

  async remove(id) {
    const docRef = doc(db, this.colName, id);
    return await deleteDoc(docRef);
  }
}

// Instanciramo servise za specifične kolekcije
export const brandService = new CollectionService("brands");
export const categoryService = new CollectionService("categories");
export const specKeyService = new CollectionService("spec_keys"); // npr. "Težina", "Prečnik"
