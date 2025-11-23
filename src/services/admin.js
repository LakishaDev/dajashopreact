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
} from 'firebase/firestore';
import { db } from './firebase';

class CollectionService {
  constructor(collectionName) {
    this.colName = collectionName;
    this.ref = collection(db, collectionName);
  }

  subscribe(onData, onError) {
    const q = query(this.ref, orderBy('name', 'asc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        onData(items);
      },
      onError
    );
  }

  // IZMENA: Dodat argument extraData (npr. { brand: "Casio" })
  async add(name, extraData = {}) {
    if (!name.trim()) throw new Error('Naziv ne može biti prazan.');
    return await addDoc(this.ref, {
      name: name.trim(),
      ...extraData, // Čuvamo i brend ovde
      createdAt: serverTimestamp(),
    });
  }

  // IZMENA: Dodat argument extraData za update
  async update(id, newName, extraData = {}) {
    if (!newName.trim()) throw new Error('Naziv ne može biti prazan.');
    const docRef = doc(db, this.colName, id);
    return await updateDoc(docRef, {
      name: newName.trim(),
      ...extraData,
    });
  }

  async remove(id) {
    const docRef = doc(db, this.colName, id);
    return await deleteDoc(docRef);
  }
}

export const brandService = new CollectionService('brands');
export const categoryService = new CollectionService('categories');
export const specKeyService = new CollectionService('spec_keys');
