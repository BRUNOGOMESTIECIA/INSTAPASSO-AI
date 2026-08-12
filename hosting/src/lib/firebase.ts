import { auth, db } from '../firebase';

// Re-export standard auth/db and alias instaPassoAuth/instaPassoDb to the same instance
export { auth, db };
export const instaPassoAuth = auth;
export const instaPassoDb = db;
export const instaPassoApp = auth.app;
export default auth.app;
