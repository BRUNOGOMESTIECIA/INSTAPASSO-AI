import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

/**
 * @fileoverview Configuração central do Firebase (App, Auth e Firestore).
 * Contém as chaves públicas de acesso ao projeto 'InstaPasso'.
 * As chaves são seguras para exposição no frontend, pois a proteção real
 * é garantida pelas 'Firestore Security Rules' no servidor.
 */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoInstaPassoKey987654321",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "instapasso-ai-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "instapasso-ai-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "instapasso-ai-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "9876543210",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:9876543210:web:654321fedcba"
};


/** @description Instância principal do aplicativo Firebase */
const app = initializeApp(firebaseConfig);

/** @description Instância do serviço de Autenticação */
export const auth = getAuth(app);

/** @description Instância do serviço de Banco de Dados NoSQL Firestore */
export const db = getFirestore(app);

/** @description Provedor de Autenticação do Google para SSO (Single Sign-On) */
export const provider = new GoogleAuthProvider();

if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  const host = "127.0.0.1";
  console.info(`[Firebase] Conectando aos emuladores do InstaPasso no host: ${host}`);
  connectAuthEmulator(auth, `http://${host}:9099`);
  connectFirestoreEmulator(db, host, 8080);
}

