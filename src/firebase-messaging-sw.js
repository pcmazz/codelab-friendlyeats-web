importScripts("https://www.gstatic.com/firebasejs/9.6.11/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.11/firebase-messaging-compat.js");
firebase.initializeApp({
  apiKey: 'AIzaSyC9mtlPIlHQbvBEdMfJ9tkBpgQg4w5XXIA',
  authDomain: 'friendlychat-mazz.firebaseapp.com',
  projectId: 'friendlychat-mazz',
  storageBucket: 'friendlychat-mazz.firebasestorage.app',
  messagingSenderId: '1029208851330',
  appId: '1:1029208851330:web:baab23e0429de6c859c59b',
  measurementId: 'G-HMSNQS15B1'
});

const messaging = firebase.messaging();
