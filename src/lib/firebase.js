// src/lib/firebase.js
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
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
  apiKey: 'AIzaSyCDZj4focomxoIizJv0tIq9iUMY4X3NSf',
  authDomain: 'prayer-journal-31c40.firebaseapp.com',
  projectId: 'prayer-journal-31c40',
  appId: '1:813674709589:web:a35ced66b05dfce4d74adc',
  // If you add Analytics later, include measurementId: 'G-XXXXXXX'
}

// Init
const app = initializeApp(firebaseConfig)

// ---------- AUTH ----------
export const auth = getAuth(app)
const provider = new GoogleAuthProvider()

export async function signIn() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isStandalone =
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone === true

  // iOS PWA: use redirect (popups are blocked)
  if (isIOS && isStandalone) {
    return signInWithRedirect(auth, provider)
  }
  // Desktop / normal browser: popup
  return signInWithPopup(auth, provider)
}

export const signOutUser = () => signOut(auth)

// 👇 This is what SyncTest imports
export const onAuthChanged = (cb) => onAuthStateChanged(auth, cb)

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