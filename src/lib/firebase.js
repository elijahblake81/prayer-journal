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
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  increment,
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

    
    answered:   false, // boolean when not answered; object {date,notes} when answered
     createdAt:  serverTimestamp(),
     updatedAt:  serverTimestamp(),

  })
}

// NEW: fetch a single prayer (used by Edit page)
export async function getPrayerById(uid, id) {
  const ref = doc(db, 'users', uid, 'prayers', id)
  const snap = await getDoc(ref)
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
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


// Atomically increment prayedCount and set lastPrayedAt server-side
export async function incrementPrayedCount(uid, id) {
  const ref = doc(db, 'users', uid, 'prayers', id)
  await updateDoc(ref, {
    prayedCount: increment(1),
    lastPrayedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}


// --------------------------
// Public sharing (opt-in)
// --------------------------

const publicCol = () => collection(db, 'publicPrayers')
const publicPrayersCol = () => collection(db, 'publicPrayers');
const publicPrayerDoc  = (id) => doc(db, 'publicPrayers', id);

// Build a safe, public copy of a private prayer
function buildPublicDoc(uid, prayer) {
  return {
    ownerId: uid,
    prayerId: prayer.id,
    content: prayer.content || '',
    category: prayer.category || 'General',
    scripture: prayer.scripture || '',
    tags: Array.isArray(prayer.tags) ? prayer.tags : [],
    isAnswered: !!prayer.answered,
    answeredAt: prayer.answered?.date || null,
    // public analytics (optional, reset at publish time)
    prayedCount: Number(prayer.prayedCount || 0),
    lastPrayedAt: prayer.lastPrayedAt || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    // Optional: display name if you want attribution
    // displayName: auth.currentUser?.displayName || null,
  }
}

// Publish (make public): create a public copy and store its id on the private doc
export async function publishPrayer(uid, privatePrayer) {
  const pubRef = await addDoc(publicCol(), buildPublicDoc(uid, privatePrayer))
  await savePrayer(uid, privatePrayer.id, { publicId: pubRef.id })
  return pubRef.id
}

// Unpublish (unshare): delete public copy and clear the reference
export async function unpublishPrayer(uid, privatePrayer) {
  if (!privatePrayer?.publicId) return
  const ref = doc(db, 'publicPrayers', privatePrayer.publicId)
  await deleteDoc(ref)
  await savePrayer(uid, privatePrayer.id, { publicId: null })
}

// Optional: mirror selected edits to the public copy, if already public
export async function updatePublicFromPrivate(uid, privatePrayer) {
  if (!privatePrayer?.publicId) return
  const ref = doc(db, 'publicPrayers', privatePrayer.publicId)
  const patch = {
    content: privatePrayer.content || '',
    category: privatePrayer.category || 'General',
    scripture: privatePrayer.scripture || '',
    tags: Array.isArray(privatePrayer.tags) ? privatePrayer.tags : [],
    isAnswered: !!privatePrayer.answered,
    answeredAt: privatePrayer.answered?.date || null,
    prayedCount: Number(privatePrayer.prayedCount || 0),
    lastPrayedAt: privatePrayer.lastPrayedAt || null,
    updatedAt: serverTimestamp(),
  }
  await setDoc(ref, patch, { merge: true })
}

// Public feed subscription
export function subscribePublicPrayers(cb, onError) {
  const qy = query(publicCol(), orderBy('createdAt', 'desc'))
  return onSnapshot(qy, snap => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    cb(items)
  }, onError)
}



export async function incrementPublicPrayedCount(publicId) {
  const ref = doc(db, 'publicPrayers', publicId)
  await updateDoc(ref, {
    prayedCount: increment(1),
    lastPrayedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),

  });
}

