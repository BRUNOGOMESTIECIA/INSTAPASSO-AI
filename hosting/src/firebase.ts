import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBZyrcBfFRjhhMOpkhxLLrzgZ5vII6Tl98",
  authDomain: "instapasso.firebaseapp.com",
  projectId: "instapasso",
  storageBucket: "instapasso.firebasestorage.app",
  messagingSenderId: "190667143384",
  appId: "1:190667143384:web:7b97b8b82d7912dfd2bfad"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();
