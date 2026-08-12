import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

let firebaseApp: any = null;
let db: any = null;
let auth: any = null;
let storage: any = null;

export const initFirebase = (config: FirebaseConfig) => {
  try {
    if (!config.apiKey || !config.projectId) return false;
    if (!getApps().length) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApp();
    }
    db = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);
    storage = getStorage(firebaseApp);
    return true;
  } catch (err) {
    console.warn("Firebase initialization skipped or invalid config:", err);
    return false;
  }
};

export const getDb = () => db;
export const getFirebaseAuth = () => auth;
export const getFirebaseStorage = () => storage;
