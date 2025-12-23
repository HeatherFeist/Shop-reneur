
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  setDoc, 
  updateDoc,
  deleteDoc,
  where,
  Timestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "./firebase";
import { Product, ShopSettings, Message, UserProfile } from "../types";

const PRODUCTS_COLLECTION = "products";
const SETTINGS_COLLECTION = "settings";
const MESSAGES_COLLECTION = "messages";

export const dbService = {
  // --- Products ---
  subscribeToProducts: (callback: (products: Product[]) => void) => {
    const q = query(collection(db, PRODUCTS_COLLECTION), orderBy("id", "desc"));
    return onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({ 
        ...doc.data(), 
        id: doc.id 
      })) as Product[];
      callback(products);
    });
  },

  saveProduct: async (product: Partial<Product>) => {
    if (product.id && product.id.length > 15) { // Assuming generated ID
        const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
        return await setDoc(docRef, product, { merge: true });
    } else {
        return await addDoc(collection(db, PRODUCTS_COLLECTION), {
            ...product,
            createdAt: Timestamp.now()
        });
    }
  },

  deleteProduct: async (productId: string) => {
    return await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
  },

  // --- Shop Settings ---
  subscribeToSettings: (callback: (settings: ShopSettings) => void) => {
    return onSnapshot(doc(db, SETTINGS_COLLECTION, "global_settings"), (doc) => {
      if (doc.exists()) {
        callback(doc.data() as ShopSettings);
      }
    });
  },

  updateSettings: async (settings: ShopSettings) => {
    return await setDoc(doc(db, SETTINGS_COLLECTION, "global_settings"), settings);
  },

  // --- Messaging ---
  subscribeToMessages: (callback: (messages: Message[]) => void) => {
    const q = query(collection(db, MESSAGES_COLLECTION), orderBy("timestamp", "asc"));
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ 
        ...doc.data(), 
        id: doc.id 
      })) as Message[];
      callback(messages);
    });
  },

  sendMessage: async (message: Omit<Message, 'id'>) => {
    return await addDoc(collection(db, MESSAGES_COLLECTION), {
      ...message,
      timestamp: Date.now()
    });
  },

  deleteMessage: async (messageId: string) => {
    return await deleteDoc(doc(db, MESSAGES_COLLECTION, messageId));
  }
};
