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
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
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


const firebaseConfig = {
  apiKey: "AIzaSyCDZj4focomxoIizJv0tIq9iUMY4X3NSfg",
  authDomain: "prayer-journal-31c40.firebaseapp.com",
  projectId: "prayer-journal-31c40",
  storageBucket: "prayer-journal-31c40.firebasestorage.app",
  messagingSenderId: "813674709589",
  appId: "1:813674709589:web:a35ced66b05dfce4d74adc",
  measurementId: "G-DQ3J2VZYP4"
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

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
})


const prayersCol = (uid) => collection(db, 'users', uid, 'prayers')


export async function addPrayer(uid, prayer) {
  return addDoc(prayersCol(uid), {
    title:      prayer.title ?? '',
    content:    prayer.content ?? '',
    category:   prayer.category ?? 'General',
    scripture:  prayer.scripture ?? '',
    // store tags as array; accept comma-separated string too
    tags: Array.isArray(prayer.tags)
      ? prayer.tags
      : (typeof prayer.tags === 'string' && prayer.tags.trim().length
          ? prayer.tags.split(',').map(t => t.trim()).filter(Boolean)
          : []),

    answered:   false,                 // new prayers are open by default
    createdAt:  serverTimestamp(),
    updatedAt:  serverTimestamp(),

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