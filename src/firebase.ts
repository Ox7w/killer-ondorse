import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { ALLOWED_DOMAIN } from './config'

const env = import.meta.env

export const firebaseReady = Boolean(env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID)

// Si la config est absente, on utilise des valeurs factices pour que l'init Firebase
// ne plante pas au chargement : l'app affiche alors l'écran "config manquante".
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'missing-api-key',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'missing.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'missing',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'missing.appspot.com',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '0',
  appId: env.VITE_FIREBASE_APP_ID || 'missing',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

export const googleProvider = new GoogleAuthProvider()
// Invite Google à présélectionner un compte du domaine de l'entreprise.
googleProvider.setCustomParameters({ hd: ALLOWED_DOMAIN, prompt: 'select_account' })
