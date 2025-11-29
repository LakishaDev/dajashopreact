// src/services/reviews.js
import { db } from './firebase';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

const REVIEWS_COLLECTION = 'reviews';

// Dodavanje nove recenzije
export const addReview = async (productId, userData, reviewData) => {
  try {
    await addDoc(collection(db, REVIEWS_COLLECTION), {
      productId,
      userId: userData.uid,
      userName: userData.displayName || userData.email.split('@')[0], // Ime ili deo emaila
      rating: reviewData.rating,
      comment: reviewData.comment,
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error adding review: ', error);
    throw error;
  }
};

// Učitavanje recenzija za proizvod
export const getProductReviews = async (productId) => {
  try {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('productId', '==', productId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching reviews: ', error);
    // Ako indeks ne postoji (čest error u Firebaseu na početku), vrati prazan niz
    return [];
  }
};
