import { initializeApp } from "firebase/app";
import {
  getDatabase,
  connectDatabaseEmulator,
  ref,
  child,
  get,
  Database as FirebaseDatabase,
  DatabaseReference,
  DataSnapshot,
} from "firebase/database";

let database: FirebaseDatabase;

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
  try {
    connectDatabaseEmulator(database, "localhost", 9000);
  } catch (IllegalStateException) {}
}

export default database;
export const databaseRef: DatabaseReference = ref(database);

export const databaseGet = (
  path: string,
  callback: { (snapshot: DataSnapshot): void }
) => {
  get(child(databaseRef, path))
    .then((snapshot) => {
      if (snapshot.exists()) callback(snapshot);
    })
    .catch((error) => {
      console.error(error);
    });
};
