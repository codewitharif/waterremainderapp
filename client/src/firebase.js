// import firebase from "firebase/app";
// import "firebase/messaging";
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAUk1BHyGcRhO7eqU5ImoSJY-j0brvoehY",
  authDomain: "water-reminder-app-b47b5.firebaseapp.com",
  projectId: "water-reminder-app-b47b5",
  storageBucket: "water-reminder-app-b47b5.appspot.com",
  messagingSenderId: "289129177395",
  appId: "1:289129177395:web:d97c4a7d47155f4e8e1e46",
};

// firebase.initializeApp(firebaseConfig);
// export const messaging = firebase.messaging();

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Messaging
const messaging = getMessaging(app);

export { messaging };
