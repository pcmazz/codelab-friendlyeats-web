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
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message received:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/assets/WithFirebase.png',
    data: { url: payload.data?.url || '/' } // Example: dynamic redirect URL
  };
  return self.registration.showNotification(notificationTitle, notificationOptions);
});
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] notificationclick event:', event);
  event.notification.close();
  // Example: Open the app or a specific URL when clicked
  event.waitUntil(
    clients.openWindow('/')
  );
});
