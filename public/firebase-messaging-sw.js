/* eslint-disable no-undef */
// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing the generated config
const firebaseConfig = {
  apiKey: "AIzaSyC_nuiuglzcd3YMU2dY0SnsfzpNo41i1tw",
  authDomain: "beyondchats-684da.firebaseapp.com",
  projectId: "beyondchats-684da",
  storageBucket: "beyondchats-684da.appspot.com",
  messagingSenderId: "704952239667",
  appId: "1:704952239667:web:468b2ad1906483cd0fc546",
  measurementId: "G-QPKTLKF13Q"
};

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();
// messaging.onBackgroundMessage(function(payload) {
//   console.log("Received background message ", payload);

//   const notificationTitle = payload.notification.title;
//   const notificationOptions = {
//     body: payload.notification.body,
//     icon: '/favicon.png',
//   };

//   self.registration.showNotification(notificationTitle, notificationOptions);
// });