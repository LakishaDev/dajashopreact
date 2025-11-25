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
import { getFunctions, httpsCallable } from 'firebase/functions';

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

// --- SERVIS ZA PORUDŽBINE (ISPRAVLJEN) ---
export const ordersService = {
  subscribe: (onData, onError) => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          // Prvo uzimamo podatke (gde je id = DAJA-...)
          ...d.data(),
          // Zatim dodajemo PRAVI ID dokumenta kao 'docId' (ArOc...)
          // Ovo je ključno jer nam treba za update!
          docId: d.id,
        }));
        onData(items);
      },
      onError
    );
  },

  // Ovde sada očekujemo pravi 'docId' (ArOc...), a ne 'DAJA-...'
  updateStatus: async (docId, newStatus) => {
    if (!docId) throw new Error('Nedostaje ID dokumenta za ažuriranje.');
    console.log(
      'Ažuriram status za dokument:',
      docId,
      'Novi status:',
      newStatus
    );

    const docRef = doc(db, 'orders', docId);
    return await updateDoc(docRef, { status: newStatus });
  },

  markAsRead: async (docId) => {
    if (!docId) return;
    const docRef = doc(db, 'orders', docId);
    return await updateDoc(docRef, { isRead: true });
  },
};

// --- NOVO: SERVIS ZA SLIKE PREKO URL-A ---
export const uploadRemoteImage = async (url, productName) => {
  const functions = getFunctions();
  const saveImageFn = httpsCallable(functions, 'saveImageFromUrl');

  try {
    const result = await saveImageFn({
      url: url,
      productName: productName,
    });
    // Vraćamo sigurni, tokenizovani link
    return result.data.url;
  } catch (error) {
    console.error('Cloud function error (saveImageFromUrl):', error);
    // Vraćamo originalni URL ako Cloud funkcija ne uspe (hotlinking fallback)
    return url;
  }
};

export const brandService = new CollectionService('brands');
export const categoryService = new CollectionService('categories');
export const specKeyService = new CollectionService('spec_keys');
