import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCu_bc2eYcjDOR88BBDD_G_SGeyjVFbzwY",
  authDomain: "our-universe-8e0a6.firebaseapp.com",
  databaseURL: "https://our-universe-8e0a6-default-rtdb.firebaseio.com",
  projectId: "our-universe-8e0a6",
  storageBucket: "our-universe-8e0a6.firebasestorage.app",
  messagingSenderId: "1023395714088",
  appId: "1:1023395714088:web:0807105a2a353b46a3511d"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);

// Sign in anonymously to satisfy security rules that require authentication
signInAnonymously(auth)
  .then(() => {
    console.log("Logged in anonymously to Firebase.");
  })
  .catch((error) => {
    console.warn("Firebase Anonymous Auth failed. If read/writes fail, please check rules or enable anonymous auth in console.", error);
  });

export default app;
