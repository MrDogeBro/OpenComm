import { initializeApp } from "firebase/app";
import {
  getDatabase,
  connectDatabaseEmulator,
  Database,
} from "firebase/database";

let database: Database;

if (process.env.NEXT_PUBLIC_FIREBASE_REMOTE_FIRESTORE == "true") {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  database = getDatabase(initializeApp(firebaseConfig));
} else {
  initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
  database = getDatabase();
  connectDatabaseEmulator(database, "localhost", 9000);
}

export default database;
