import {initializeApp} from '@angular/fire/app'
import {getMessaging} from '@angular/fire/messaging'

const firebaseConfig = {
  apiKey: 'AIzaSyC9mtlPIlHQbvBEdMfJ9tkBpgQg4w5XXIA',
  authDomain: 'friendlychat-mazz.firebaseapp.com',
  projectId: 'friendlychat-mazz',
  storageBucket: 'friendlychat-mazz.firebasestorage.app',
  messagingSenderId: '1029208851330',
  appId: '1:1029208851330:web:baab23e0429de6c859c59b',
  measurementId: 'G-HMSNQS15B1'
};

// 2. Initialize Firebase and Messaging in the worker
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// 3. (Optional) Custom Background Message Handler
// FCM handles standard notifications automatically if the payload has a 'notification' property.
// Use this for data-only messages or custom logic.
/*onBackgroundMessage(messaging, (payload) => {
  console.log('[firebase-messaging-sw.js] Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new update.',
    icon: '/assets/icons/icon-128x128.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});*/
