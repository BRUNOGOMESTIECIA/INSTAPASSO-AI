import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * @fileoverview Configuração central do Firebase (App, Auth e Firestore).
 * Contém as chaves públicas de acesso ao projeto 'InstaPasso'.
 * As chaves são seguras para exposição no frontend, pois a proteção real
 * é garantida pelas 'Firestore Security Rules' no servidor.
 */

const firebaseConfig = {
  apiKey: "AIzaSyBZyrcBfFRjhhMOpkhxLLrzgZ5vII6Tl98",
  authDomain: "instapasso.firebaseapp.com",
  projectId: "instapasso",
  storageBucket: "instapasso.firebasestorage.app",
  messagingSenderId: "190667143384",
  appId: "1:190667143384:web:7b97b8b82d7912dfd2bfad"
};

/** @description Instância principal do aplicativo Firebase */
const app = initializeApp(firebaseConfig);

/** @description Instância do serviço de Autenticação */
export const auth = getAuth(app);

/** @description Instância do serviço de Banco de Dados NoSQL Firestore */
export const db = getFirestore(app);

/** @description Provedor de Autenticação do Google para SSO (Single Sign-On) */
export const provider = new GoogleAuthProvider();
