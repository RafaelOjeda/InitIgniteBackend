import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, deleteUser } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, writeBatch, collection, updateDoc, getDocs, deleteDoc, arrayRemove, arrayUnion} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from "./firebaseConfig.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth,
    signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail,
    signOut,
    db,
    doc,
    setDoc, getDoc,
    collection, updateDoc, getDocs, deleteDoc, deleteUser, arrayRemove, arrayUnion, writeBatch
}
