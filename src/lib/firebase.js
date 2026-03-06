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
  writeBatch,      // ✅ added (for atomic publish/unpublish)
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

// ---- Helpers (new) ----
function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags
  if (typeof tags === 'string') {
    return tags.split(',').map(t => t.trim()).filter(Boolean)
  }
  return []
}

export async function addPrayer(uid, prayer) {
  return addDoc(prayersCol(uid), {
    title:      prayer.title ?? '',
    content:    prayer.content ?? '',
    category:   prayer.category ?? 'General',
    scripture:  prayer.scripture ?? '',
    // store tags as array; accept comma-separated string too
    tags: normalizeTags(prayer.tags),

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
  // normalize tags if someone passed a string from a form
  const clean = {
    ...patch,
    ...(patch.tags !== undefined ? { tags: normalizeTags(patch.tags) } : {}),
    updatedAt: serverTimestamp(),
  }
  return setDoc(ref, clean, { merge: true })
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
const publicPrayerDoc = (id) => doc(db, 'publicPrayers', id)

// Build a safe, public copy of a private prayer
function buildPublicDoc(uid, prayer) {
  return {
    ownerId: uid,
    prayerId: prayer.id,
    content: prayer.content || '',
    category: prayer.category || 'General',
    scripture: prayer.scripture || '',
    tags: normalizeTags(prayer.tags),              // ✅ robust tags
    isAnswered: !!prayer.answered,
    answeredAt: prayer.answered?.date || null,
    // public analytics (optional, reset/initialize at publish time)
    prayedCount: Number(prayer.prayedCount || 0),
    lastPrayedAt: prayer.lastPrayedAt || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    // displayName: auth.currentUser?.displayName || null, // optional
  }
}

// ✅ Publish (atomic): pre-create public doc id and batch both writes
export async function publishPrayer(uid, privatePrayer) {
  const pubRef = doc(publicCol())  // pre-generate id
  const privRef = doc(db, 'users', uid, 'prayers', privatePrayer.id)
  const batch = writeBatch(db)

  batch.set(pubRef, buildPublicDoc(uid, { ...privatePrayer, id: privatePrayer.id }))
  batch.set(privRef, { publicId: pubRef.id, updatedAt: serverTimestamp() }, { merge: true })

  await batch.commit()
  return pubRef.id
}

// ✅ Unpublish (atomic): delete public doc and clear private reference
export async function unpublishPrayer(uid, privatePrayer) {
  if (!privatePrayer?.publicId) return
  const pubRef = doc(db, 'publicPrayers', privatePrayer.publicId)
  const privRef = doc(db, 'users', uid, 'prayers', privatePrayer.id)

  const batch = writeBatch(db)
  batch.delete(pubRef)
  batch.set(privRef, { publicId: null, updatedAt: serverTimestamp() }, { merge: true })
  await batch.commit()
}

// ✅ Optional: mirror selected edits to the public copy, if already public
export async function updatePublicFromPrivate(uid, privatePrayer) {
  if (!privatePrayer?.publicId) return
  const ref = doc(db, 'publicPrayers', privatePrayer.publicId)
  const patch = {
    content: privatePrayer.content || '',
    category: privatePrayer.category || 'General',
    scripture: privatePrayer.scripture || '',
    tags: normalizeTags(privatePrayer.tags),       // ✅ robust tags
    isAnswered: !!privatePrayer.answered,
    answeredAt: privatePrayer.answered?.date || null,
    // Do NOT write prayedCount/lastPrayedAt here unless you intend to override analytics
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

// Public “Prayed” (rules expect prayedCount + lastPrayedAt + updatedAt)
export async function incrementPublicPrayedCount(publicId) {
  const ref = doc(db, 'publicPrayers', publicId)
  await updateDoc(ref, {
    prayedCount: increment(1),
    lastPrayedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}
