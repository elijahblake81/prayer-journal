// src/lib/storage.js
// COMPLETE replacement version supporting Firestore + local fallback

import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';

import { getAuth } from 'firebase/auth';

// ---------------------------
// LOCAL KEYS (unchanged)
// ---------------------------
const LOCAL_PRAYERS = 'prayer-journal-data';
const LOCAL_REMINDERS = 'prayer-journal-reminders';

// ---------------------------
// LOCAL FALLBACK STORAGE
// ---------------------------

function loadLocalPrayers() {
  try {
    const raw = localStorage.getItem(LOCAL_PRAYERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalPrayers(prayers) {
  localStorage.setItem(LOCAL_PRAYERS, JSON.stringify(prayers));
}

export function loadReminders() {
  try {
    const raw = localStorage.getItem(LOCAL_REMINDERS);
    return raw ? JSON.parse(raw) : { daily: null, weekly: null };
  } catch {
    return { daily: null, weekly: null };
  }
}

export function saveReminders(reminders) {
  localStorage.setItem(LOCAL_REMINDERS, JSON.stringify(reminders));
}

// ---------------------------
// FIRESTORE HELPERS
// ---------------------------

function userPrayersCollection(uid) {
  const db = getFirestore();
  return collection(db, 'users', uid, 'prayers');
}

// Load all prayers
export async function loadPrayers() {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    // Not signed in → use local storage
    return loadLocalPrayers();
  }

  const db = getFirestore();
  const col = userPrayersCollection(user.uid);

  const q = query(col, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);

  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// Save (create)
export async function addPrayer(prayer) {
  const auth = getAuth();
  const user = auth.currentUser;

  const now = new Date().toISOString();
  const base = {
    ...prayer,
    createdAt: prayer.createdAt || now,
    updatedAt: prayer.updatedAt || now
  };

  if (!user) {
    // Local fallback
    const arr = loadLocalPrayers();
    const id = crypto.randomUUID();
    arr.unshift({ ...base, id });
    saveLocalPrayers(arr);
    return id;
  }

  // Firestore
  const colRef = userPrayersCollection(user.uid);
  const docRef = await addDoc(colRef, base);
  return docRef.id;
}

// Get single prayer by ID
export async function getPrayerById(id) {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    return loadLocalPrayers().find(p => p.id === id);
  }

  const db = getFirestore();
  const ref = doc(db, 'users', user.uid, 'prayers', id);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Update existing prayer (supports Edit + Mark Answered)
export async function updatePrayer(updated) {
  const auth = getAuth();
  const user = auth.currentUser;
  const now = new Date().toISOString();

  if (!user) {
    // Local fallback
    const arr = loadLocalPrayers();
    const idx = arr.findIndex(p => p.id === updated.id);
    if (idx !== -1) {
      arr[idx] = { ...updated, updatedAt: now };
      saveLocalPrayers(arr);
    }
    return;
  }

  const db = getFirestore();
  const ref = doc(db, 'users', user.uid, 'prayers', updated.id);

  // Append edit history (optional but useful)
  const historyEntry = {
    updatedAt: now,
    title: updated.title,
    content: updated.content,
    category: updated.category || null,
    isAnswered: !!updated.isAnswered,
    answeredAt: updated.isAnswered ? updated.answeredAt : null
  };

  await updateDoc(ref, {
    ...updated,
    updatedAt: now,
    history: [...(updated.history || []), historyEntry]
  });
}