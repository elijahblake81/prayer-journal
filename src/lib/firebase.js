// src/lib/firebase.js
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
  getRedirectResult,
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

// 🔐 Use the EXACT config from Firebase Console → Project settings → General → Your apps (Web)
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY_HERE',                // e.g., "AIzaSy..."; must be exact
  authDomain: 'prayer-journal-31c40.firebaseapp.com',
  projectId: 'prayer-journal-31c40',
  storageBucket: 'prayer-journal-31c40.appspot.com', // or .firebasestorage.app, either is fine if console shows it
  messagingSenderId: '813674709589',
  appId: '1:813674709589:web:xxxxxxxxxxxxxxxx',      // from console
  // measurementId: 'G-XXXXXXX' // optional; do not add analytics unless you need it
}

const app = initializeApp(firebaseConfig)

// ---------- AUTH ----------
export const auth = getAuth(app)
const provider = new GoogleAuthProvider()

function isIOSStandalone() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isStandalone =
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone === true
  return isIOS && isStandalone
}

// Robust sign-in with popup (desktop) or redirect (iOS PWA)
export async function signIn() {
  try {
    if (isIOSStandalone()) {
      await signInWithRedirect(auth, provider)
      return
    }
    return await signInWithPopup(auth, provider)
  } catch (err) {
    console.error('Firebase sign-in error:', err)
    alert(`Sign-in error: ${err?.code || ''} ${err?.message || err}`)
    throw err
  }
}

export const signOutUser = () => signOut(auth)
export const onAuthChanged = (cb) => onAuthStateChanged(auth, cb)

export async function handleRedirectResult() {
  try {
    const result = await getRedirectResult(auth)
    return result // may be null on first load
  } catch (err) {
    console.error('Redirect sign-in error:', err)
    alert(`Redirect sign-in error: ${err?.code || ''} ${err?.message || err}`)
    throw err
  }
}

// ---------- FIRESTORE ----------
export const db = getFirestore(app)

// Enable offline cache; safe to ignore multi-tab error
enableIndexedDbPersistence(db).catch(() => {})

const prayersCol = (uid) => collection(db, 'users', uid, 'prayers')

export async function addPrayer(uid, prayer) {
  return addDoc(prayersCol(uid), {
    title: prayer.title ?? '',
    content: prayer.content ?? '',
    answered: !!prayer.answered,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function savePrayer(uid, id, patch) {
  const ref = doc(db, 'users', uid, 'prayers', id)
  return setDoc(ref, { ...patch, updatedAt: serverTimestamp() }, { merge: true })
}

export async function removePrayer(uid, id) {
  const ref = doc(db, 'users', uid, 'prayers', id)
  return deleteDoc(ref)
}

export function subscribePrayers(uid, cb) {
  const q = query(prayersCol(uid), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    cb(items)
  })
}