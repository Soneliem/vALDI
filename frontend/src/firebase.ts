import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDyulfcsQ9K-BwYhHDb9hUCckMZpxWrZeQ",
  authDomain: "valdi-bfdee.firebaseapp.com",
  projectId: "valdi-bfdee",
  storageBucket: "valdi-bfdee.appspot.com",
  messagingSenderId: "865302377509",
  appId: "1:865302377509:web:022b7bc80f5ea2e0cdbbcc",
  measurementId: "G-YCZ319P1Q7",
};

const app = initializeApp(firebaseConfig);
export default getMessaging(app);
