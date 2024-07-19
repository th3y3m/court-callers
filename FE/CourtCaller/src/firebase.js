// Import the functions you need from the SDKs you need
import { getStorage } from "firebase/storage";
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDAPz7GMnppP018Kpm20stKsAdbHOcJHc4",
  authDomain: "court-callers.firebaseapp.com",
  projectId: "court-callers",
  storageBucket: "court-callers.appspot.com",
  messagingSenderId: "48866245430",
  appId: "1:48866245430:web:a9eb7ef7e76077765c5197",
  measurementId: "G-KEMR387K1Q"
};

// Use this to initialize the firebase App
const firebaseApp = firebase.initializeApp(firebaseConfig);
// Use these for db & auth
const db = firebaseApp.firestore();
const auth = firebase.auth();

const storageDb = getStorage(firebaseApp)

export {firebaseApp, auth, storageDb}