// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage} from "firebase/storage";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app)
const storageDb = getStorage(app)

export {app, auth, storageDb} 