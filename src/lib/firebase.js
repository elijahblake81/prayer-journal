// src/lib/firebase.js
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
  getRedirectResult,           // ⬅️ NEW: we’ll export a helper that uses this
} from 'firebase/auth'
import {
  getFirestore,
  enableIndexedDbPersistence,
  collection,
  addDoc,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'

// Replace with your Firebase config
const firebaseConfig = {
  // Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCDZj4focomxoIizJv0tIq9iUMY4X3NSfg",
  authDomain: "prayer-journal-31c40.firebaseapp.com",
  projectId: "prayer-journal-31c40",
  storageBucket: "prayer-journal-31c40.firebasestorage.app",
  messagingSenderId: "813674709589",
  appId: "1:813674709589:web:a35ced66b05dfce4d74adc",
  measurementId: "G-DQ3J2VZYP4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
  // If you add Analytics later, include measurementId: 'G-XXXXXXX'
}

// Init
const app = initializeApp(firebaseConfig)

// ---------- AUTH ----------
export const auth = getAuth(app)
const provider = new GoogleAuthProvider()

// Helper: detect iOS in standalone (installed PWA) and use redirect sign-in to avoid popup blockers

function isIOSStandalone() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isStandalone =
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone === true
  return isIOS && isStandalone
}

// ✅ Hardened sign-in with error reporting
export async function signIn() {
  try {
    if (isIOSStandalone()) {
      // iOS PWAs block popups; use redirect flow
      await signInWithRedirect(auth, provider)
      return
    }
    // Desktop & normal browsers: use popup
    return await signInWithPopup(auth, provider)
  } catch (err) {
    console.error('Firebase sign-in error:', err)
    // Temporary surface so you can see what's wrong in the UI
    alert(`Sign-in error: ${err?.code || ''} ${err?.message || err}`)
    throw err
  }
}

export const signOutUser = () => signOut(auth)

// 👇 This is what SyncTest imports
export const onAuthChanged = (cb) => onAuthStateChanged(auth, cb)

// ⬅️ NEW: expose a helper to handle the redirect result (mainly for iOS PWA)
export async function handleRedirectResult() {
  try {
    const result = await getRedirectResult(auth)
    return result // may be null on first load; that's OK
  } catch (err) {
    console.error('Redirect sign-in error:', err)
    alert(`Redirect sign-in error: ${err?.code || ''} ${err?.message || err}`)
    throw err
  }
}

// ---------- FIRESTORE ----------
export const db = getFirestore(app)

// Offline-first persistence for PWA
enableIndexedDbPersistence(db).catch(() => {
  /* Ignore persistence errors (e.g., multiple tabs). */
})

const prayersCol = (uid) => collection(db, 'users', uid, 'prayers')

// Create
export async function addPrayer(uid, prayer) {
  return addDoc(prayersCol(uid), {
    title: prayer.title ?? '',
    content: prayer.content ?? '',
    answered: !!prayer.answered,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

// Update (merge)
export async function savePrayer(uid, id, patch) {
  const ref = doc(db, 'users', uid, 'prayers', id)
  return setDoc(ref, { ...patch, updatedAt: serverTimestamp() }, { merge: true })
}

// Delete
export async function removePrayer(uid, id) {
  const ref = doc(db, 'users', uid, 'prayers', id)
  return deleteDoc(ref)
}

// Subscribe (realtime + offline)
export function subscribePrayers(uid, cb) {
  const q = query(prayersCol(uid), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    cb(items)
  })
}
