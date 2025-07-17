import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAiCFftA09ehYDpkThFf5vMR4_JAWSGRYQ",
  authDomain: "meet-338e9.firebaseapp.com",
  databaseURL: "https://meet-338e9-default-rtdb.firebaseio.com", // ← ADD THIS
  projectId: "meet-338e9",
  storageBucket: "meet-338e9.appspot.com", // ← FIXED TYPOS HERE
  messagingSenderId: "653321695489",
  appId: "1:653321695489:web:a345fc9d105263746b6b00",
  measurementId: "G-PWNHQ6TQ0N"
};

const app = initializeApp(firebaseConfig);

const firestore = getFirestore(app);
const auth = getAuth(app);

export { auth, firestore };
