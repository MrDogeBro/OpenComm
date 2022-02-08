import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

let firebaseConfig;

if (process.env.NEXT_PUBLIC_FIREBASE_REMOTE_FIRESTORE == "true")
  firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
else
  firebaseConfig = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    databaseURL: "http://localhost:9000/?ns=opencomm-local",
  };

const firebase = initializeApp(firebaseConfig);

export default getFirestore(firebase);
