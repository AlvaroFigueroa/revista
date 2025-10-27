import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBtdfP09dBfntluAlSY52VnW4GtRhXLwKg',
  authDomain: 'markae-e3de6.firebaseapp.com',
  projectId: 'markae-e3de6',
  storageBucket: 'markae-e3de6.firebasestorage.app',
  messagingSenderId: '782602548481',
  appId: '1:782602548481:web:677c2e37a3b6bcd13d9700'
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
