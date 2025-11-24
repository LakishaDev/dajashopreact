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

  async add(name, extraData = {}) {
    if (!name.trim()) throw new Error('Naziv ne može biti prazan.');
    return await addDoc(this.ref, {
      name: name.trim(),
      ...extraData,
      createdAt: serverTimestamp(),
    });
  }

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

// --- NOVO: SERVIS ZA PORUDŽBINE ---
export const ordersService = {
  // Sluša sve porudžbine, sortirane od najnovije
  subscribe: (onData, onError) => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        onData(items);
      },
      onError
    );
  },

  // Funkcija za promenu statusa u bazi
  updateStatus: async (id, newStatus) => {
    const docRef = doc(db, 'orders', id);
    try {
      return await updateDoc(docRef, { status: newStatus });
    } catch (error) {
      console.error('Greška pri ažuriranju statusa porudžbine:', error);
      throw error;
    }
  },
  markAsRead: async (id) => {
    const docRef = doc(db, 'orders', id);
    return await updateDoc(docRef, { isRead: true });
  },
};

export const brandService = new CollectionService('brands');
export const categoryService = new CollectionService('categories');
export const specKeyService = new CollectionService('spec_keys');
