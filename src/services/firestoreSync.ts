/**
 * Firestore Real-Time Sync Service
 * 
 * Strategy: Dual-write with Firestore as source of truth.
 * - Every write goes to both localStorage (instant) and Firestore (cloud).
 * - Real-time listeners (onSnapshot) push Firestore changes into localStorage,
 *   so all devices stay synchronized automatically.
 * - localStorage serves as offline cache — the app works without internet.
 */

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  getDocs,
  type Firestore
} from 'firebase/firestore';
import { getDb } from './firebase';

// Collection names in Firestore
const COLLECTIONS = {
  settings: 'settings',
  inventory: 'inventory',
  purchases: 'purchases',
  customers: 'customers',
  sales: 'sales',
  expenses: 'expenses',
  users: 'users',
  spareParts: 'spareParts',
  sparePartSales: 'sparePartSales',
  repairs: 'repairs'
} as const;

// localStorage keys (must match store.ts)
const LS_KEYS = {
  settings: 'hwmh_settings',
  inventory: 'hwmh_inventory',
  purchases: 'hwmh_purchases',
  customers: 'hwmh_customers',
  sales: 'hwmh_sales',
  expenses: 'hwmh_expenses',
  users: 'hwmh_users',
  spareParts: 'hwmh_spare_parts',
  sparePartSales: 'hwmh_spare_part_sales',
  repairs: 'hwmh_repairs'
} as const;

type CollectionName = keyof typeof COLLECTIONS;

// Track active listener unsubscribe functions
const activeListeners: Map<string, () => void> = new Map();

// Flag to prevent listener → save → listener infinite loops
let _suppressListenerUpdate = false;

// External callback for when Firestore pushes new data into localStorage
type SyncCallback = () => void;
let _onSyncCallback: SyncCallback | null = null;

export const onFirestoreSync = (cb: SyncCallback) => {
  _onSyncCallback = cb;
};

/**
 * Check if Firestore is available and initialized
 */
const getFirestore = (): Firestore | null => {
  try {
    const db = getDb();
    return db || null;
  } catch {
    return null;
  }
};

// ─── SINGLE DOCUMENT SYNC (Settings) ───────────────────────────────

/**
 * Write a single settings document to Firestore
 */
export const syncSettingsToFirestore = async (settings: Record<string, any>) => {
  const db = getFirestore();
  if (!db) return;

  try {
    _suppressListenerUpdate = true;
    await setDoc(doc(db, COLLECTIONS.settings, 'shop'), settings, { merge: true });
  } catch (err) {
    console.warn('[Firestore] Settings sync failed:', err);
  } finally {
    setTimeout(() => { _suppressListenerUpdate = false; }, 500);
  }
};

// ─── COLLECTION SYNC (Inventory, Sales, etc.) ──────────────────────

/**
 * Write a single document to a Firestore collection.
 * Used when adding/updating a record.
 */
export const syncDocToFirestore = async (
  collectionName: CollectionName,
  docId: string,
  data: Record<string, any>
) => {
  const db = getFirestore();
  if (!db) return;

  try {
    _suppressListenerUpdate = true;
    // Clean undefined values (Firestore rejects them)
    const cleanData = JSON.parse(JSON.stringify(data));
    await setDoc(doc(db, COLLECTIONS[collectionName], docId), cleanData, { merge: true });
  } catch (err) {
    console.warn(`[Firestore] Sync doc ${collectionName}/${docId} failed:`, err);
  } finally {
    setTimeout(() => { _suppressListenerUpdate = false; }, 500);
  }
};

/**
 * Delete a document from a Firestore collection.
 */
export const deleteDocFromFirestore = async (
  collectionName: CollectionName,
  docId: string
) => {
  const db = getFirestore();
  if (!db) return;

  try {
    _suppressListenerUpdate = true;
    await deleteDoc(doc(db, COLLECTIONS[collectionName], docId));
  } catch (err) {
    console.warn(`[Firestore] Delete doc ${collectionName}/${docId} failed:`, err);
  } finally {
    setTimeout(() => { _suppressListenerUpdate = false; }, 500);
  }
};

/**
 * Overwrite an entire Firestore collection with a local array.
 * Used for bulk sync (e.g. initial upload of localStorage to cloud).
 */
export const syncCollectionToFirestore = async (
  collectionName: CollectionName,
  items: any[]
) => {
  const db = getFirestore();
  if (!db) return;

  try {
    _suppressListenerUpdate = true;
    const colRef = collection(db, COLLECTIONS[collectionName]);
    
    // Write in batches of 400 (Firestore limit is 500 per batch)
    const batchSize = 400;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = writeBatch(db);
      const chunk = items.slice(i, i + batchSize);
      
      for (const item of chunk) {
        const id = item.id || item.stockId || item.invoiceNumber || `doc-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const cleanData = JSON.parse(JSON.stringify(item));
        batch.set(doc(colRef, id), cleanData, { merge: true });
      }
      
      await batch.commit();
    }
  } catch (err) {
    console.warn(`[Firestore] Bulk sync ${collectionName} failed:`, err);
  } finally {
    setTimeout(() => { _suppressListenerUpdate = false; }, 1000);
  }
};

// ─── REAL-TIME LISTENERS ───────────────────────────────────────────

/**
 * Start a real-time listener on a Firestore collection.
 * When the cloud data changes (from another device), we update localStorage.
 */
export const startCollectionListener = (collectionName: CollectionName) => {
  const db = getFirestore();
  if (!db) return;

  // Don't duplicate listeners
  if (activeListeners.has(collectionName)) return;

  const colRef = collection(db, COLLECTIONS[collectionName]);
  const lsKey = LS_KEYS[collectionName];

  const unsubscribe = onSnapshot(colRef, (snapshot) => {
    if (_suppressListenerUpdate) return;

    const items: any[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ ...docSnap.data(), _firestoreId: docSnap.id });
    });

    if (items.length > 0) {
      localStorage.setItem(lsKey, JSON.stringify(items));
      if (_onSyncCallback) _onSyncCallback();
    }
  }, (err) => {
    console.warn(`[Firestore] Listener error on ${collectionName}:`, err);
  });

  activeListeners.set(collectionName, unsubscribe);
};

/**
 * Start a real-time listener for the singleton settings document.
 */
export const startSettingsListener = () => {
  const db = getFirestore();
  if (!db) return;

  if (activeListeners.has('settings')) return;

  const settingsDocRef = doc(db, COLLECTIONS.settings, 'shop');

  const unsubscribe = onSnapshot(settingsDocRef, (docSnap) => {
    if (_suppressListenerUpdate) return;

    if (docSnap.exists()) {
      const data = docSnap.data();
      const currentLocal = JSON.parse(localStorage.getItem(LS_KEYS.settings) || '{}');
      const merged = { ...currentLocal, ...data };
      localStorage.setItem(LS_KEYS.settings, JSON.stringify(merged));
      if (_onSyncCallback) _onSyncCallback();
    }
  }, (err) => {
    console.warn('[Firestore] Settings listener error:', err);
  });

  activeListeners.set('settings', unsubscribe);
};

// ─── INITIALIZATION ────────────────────────────────────────────────

/**
 * Initialize all Firestore real-time listeners.
 * Called once after Firebase is confirmed connected.
 */
export const startAllListeners = () => {
  startSettingsListener();
  startCollectionListener('inventory');
  startCollectionListener('purchases');
  startCollectionListener('customers');
  startCollectionListener('sales');
  startCollectionListener('expenses');
  startCollectionListener('users');
  startCollectionListener('spareParts');
  startCollectionListener('sparePartSales');
  startCollectionListener('repairs');
};

/**
 * Stop all active Firestore listeners (cleanup).
 */
export const stopAllListeners = () => {
  activeListeners.forEach((unsubscribe) => unsubscribe());
  activeListeners.clear();
};

/**
 * Upload all current localStorage data to Firestore (one-time initial sync).
 * Only uploads if the Firestore collection is empty.
 */
export const uploadLocalDataToFirestore = async () => {
  const db = getFirestore();
  if (!db) return;

  const collectionsToSync: CollectionName[] = ['inventory', 'purchases', 'customers', 'sales', 'expenses', 'users', 'spareParts', 'sparePartSales', 'repairs'];

  for (const colName of collectionsToSync) {
    try {
      const colRef = collection(db, COLLECTIONS[colName]);
      const snapshot = await getDocs(colRef);

      // Only upload if Firestore collection is empty (first-time setup)
      if (snapshot.empty) {
        const lsKey = LS_KEYS[colName];
        const localData = JSON.parse(localStorage.getItem(lsKey) || '[]');
        if (localData.length > 0) {
          console.log(`[Firestore] Uploading ${localData.length} ${colName} records to cloud...`);
          await syncCollectionToFirestore(colName, localData);
        }
      }
    } catch (err) {
      console.warn(`[Firestore] Initial upload of ${colName} failed:`, err);
    }
  }

  // Upload settings
  try {
    const settingsDocRef = doc(db, COLLECTIONS.settings, 'shop');
    const { default: settingsSnapshot } = { default: await getDocs(collection(db, COLLECTIONS.settings)) };
    if (settingsSnapshot.empty) {
      const localSettings = JSON.parse(localStorage.getItem(LS_KEYS.settings) || '{}');
      if (localSettings.shopName) {
        await setDoc(settingsDocRef, localSettings, { merge: true });
        console.log('[Firestore] Uploaded settings to cloud.');
      }
    }
  } catch (err) {
    console.warn('[Firestore] Settings upload failed:', err);
  }
};

/**
 * Full initialization: upload local data if needed, then start listeners.
 */
export const initFirestoreSync = async () => {
  const db = getFirestore();
  if (!db) {
    console.log('[Firestore] No database connection — running in offline/localStorage mode.');
    return false;
  }

  try {
    // Step 1: Upload any local data that doesn't exist in Firestore yet
    await uploadLocalDataToFirestore();

    // Step 2: Start real-time listeners for cross-device sync
    startAllListeners();

    console.log('[Firestore] ✅ Real-time sync active across all collections.');
    return true;
  } catch (err) {
    console.warn('[Firestore] Sync initialization failed:', err);
    return false;
  }
};
