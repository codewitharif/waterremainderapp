// importScripts(
//   "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
// );
// importScripts(
//   "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
// );

// firebase.initializeApp({
//   messagingSenderId: "YOUR_SENDER_ID",
// });

// const messaging = firebase.messaging();
// messaging.onBackgroundMessage((payload) => {
//   self.registration.showNotification(payload.notification.title, {
//     body: payload.notification.body,
//   });
// });

// importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js");
// importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging.js");

importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyAUk1BHyGcRhO7eqU5ImoSJY-j0brvoehY",
  authDomain: "water-reminder-app-b47b5.firebaseapp.com",
  projectId: "water-reminder-app-b47b5",
  storageBucket: "water-reminder-app-b47b5.firebasestorage.app",
  messagingSenderId: "289129177395",
  appId: "1:289129177395:web:d97c4a7d47155f4e8e1e46",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Background message handler
// messaging.onBackgroundMessage(function (payload) {
//   console.log("Received background message ", payload);
//   const notificationTitle = payload.notification.title;
//   const notificationOptions = {
//     body: payload.notification.body,
//     icon: payload.notification.icon,
//   };

//   self.registration.showNotification(notificationTitle, notificationOptions);
// });

// Background notification handler
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message", payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: payload.notification.icon || "/favicon.ico",
  });
});
