import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "opencomm-local",
  databaseURL: "http://localhost:9000/?ns=opencomm-local",
};

const firebase = initializeApp(firebaseConfig);

export default getFirestore(firebase);
