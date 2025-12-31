import { inject, Injectable } from '@angular/core';
import {
  Auth,
  authState,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  user,
  getAuth,
  User,
} from '@angular/fire/auth';
import {map, switchMap, firstValueFrom, filter, Observable, Subscription, tap} from 'rxjs'
import {
  doc,
  docData,
  DocumentReference,
  Firestore,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  collectionData,
  Timestamp,
  serverTimestamp,
  query,
  orderBy,
  limit,
  onSnapshot,
  DocumentData,
  FieldValue,
  getDocs,
} from '@angular/fire/firestore';
import {
  Storage,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from '@angular/fire/storage';
import { getToken, Messaging, onMessage } from '@angular/fire/messaging';
import { Router } from '@angular/router';
import {SwPush} from '@angular/service-worker'
type ChatMessage = {
  name: string | null,
  profilePicUrl: string | null,
  timestamp: FieldValue,
  uid: string | null,
  text?: string,
  imageUrl?: string
};


@Injectable({
  providedIn: 'root',
})
export class ChatService {
  firestore: Firestore = inject(Firestore);
  auth: Auth = inject(Auth);
  storage: Storage = inject(Storage);
  messaging: Messaging = inject(Messaging);
  router: Router = inject(Router);
  private provider = new GoogleAuthProvider();
  LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif?a';

  // observable that is updated when the auth state changes
  user$ = user(this.auth);
  currentUser: User | null = this.auth.currentUser;
  userSubscription: Subscription;

  constructor() {
    this.userSubscription = this.user$.subscribe((aUser: User | null) => {
        this.currentUser = aUser;
    });
    new Notification('Title', { body: 'Message content' });
  }

  // Signs-in Friendly Chat.
  login() {
    signInWithPopup(this.auth, this.provider).then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      this.router.navigate(['/', 'chat']).then();
      return credential;
    })
  }

  // Logout of Friendly Chat.
  logout() {
    signOut(this.auth).then(() => {
      this.router.navigate(['/', 'login']).then()
      console.log('signed out');
    }).catch((error) => {
      console.log('sign out error: ' + error);
    })
  }

  // Adds a text or image message to Cloud Firestore.
  addMessage = async (
    textMessage: string | null,
    imageUrl: string | null,
  ): Promise<void | DocumentReference<DocumentData>> => {
    console.log('ChatService - addMessage - textMessage = ', textMessage)
    console.log('ChatService - addMessage - imageUrl = ', imageUrl)
    // ignore empty messages
    if (!textMessage && !imageUrl) {
      console.log(
        "addMessage was called without a message",
        textMessage,
        imageUrl,
      );
      return;
    }

    if (this.currentUser === null) {
      console.log("addMessage requires a signed-in user");
      return;
    }

    const message: ChatMessage = {
      name: this.currentUser.displayName,
      profilePicUrl: this.currentUser.photoURL,
      timestamp: serverTimestamp(),
      uid: this.currentUser?.uid,
    };

    textMessage && (message.text = textMessage);
    imageUrl && (message.imageUrl = imageUrl);

    try {
      return await addDoc(
        collection(this.firestore, "messages"),
        message,
      );
    } catch (error) {
      console.error("Error writing new message to Firebase Database", error);
      return;
    }
  };

  // Saves a new message to Cloud Firestore.
  saveTextMessage = async (messageText: string) => {
    return this.addMessage(messageText, null);
  };

  // Loads chat message history and listens for upcoming ones.
  loadMessages = () => {
    // Create the query to load the last 12 messages and listen for new ones.
    const recentMessagesQuery = query(collection(this.firestore, 'messages'), orderBy('timestamp', 'desc'), limit(12));
    getDocs(recentMessagesQuery).then(data => {
      console.log('ChatService - recentMessagesQuery = ', data.docs)
    })
    return collectionData(recentMessagesQuery).pipe(
      tap({
        next: data => {
          console.log('ChatService - collectionData = ', data)
        }
      })
    );
  }

// Saves a new message containing an image in Firestore.
// This first saves the image in Firebase storage.
  saveImageMessage = async(file: any) => {
    console.log('ChatService - saveImageMessage - file = ', file)
    try {
      // 1 - Add a message with a loading icon that will get updated with the shared image.
      const messageRef = await this.addMessage(null, this.LOADING_IMAGE_URL);

      // 2 - Upload the image to Cloud Storage.
      const filePath = `${this.auth.currentUser?.uid}/${file.name}`;
      const newImageRef = ref(this.storage, filePath);
      const fileSnapshot = await uploadBytesResumable(newImageRef, file);

      // 3 - Generate a public URL for the file.
      const publicImageUrl = await getDownloadURL(newImageRef);
      console.log('ChatService - saveImageMessage - publicImageUrl = ', publicImageUrl)
      // 4 - Update the chat message placeholder with the image's URL.
      messageRef ?
        await updateDoc(messageRef, {
          imageUrl: publicImageUrl,
          storageUri: fileSnapshot.metadata.fullPath
        }): null;
    } catch (error) {
      console.error('There was an error uploading a file to Cloud Storage:', error);
    }
  }

  async updateData(path: string, data: any) {}

  async deleteData(path: string) {}

  getDocData(path: string) {}

  getCollectionData(path: string) {}

  async uploadToStorage(
    path: string,
    input: HTMLInputElement,
    contentType: any
  ) {
    return null;
  }
  // Requests permissions to show notifications.
  requestNotificationsPermissions = async () => {
    console.log('Requesting notifications permission...');
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      console.log('Notification permission granted.');
      // Notification permission granted.
      await this.saveMessagingDeviceToken();
    } else {
      console.log('Unable to get permission to notify.');
    }
  }

  // Saves the messaging device token to Cloud Firestore.
  saveMessagingDeviceToken= async () => {
    try {
      const currentToken = await getToken(this.messaging, {vapidKey: "BK-C0fL0kCZ5q585sebtX_adYqbnQqvCJ-aA-kcdD4avx07itfWwbR6ZxndLgsgfG_0iFgb8Yg6eW13zbh-1LCY"});
      if (currentToken) {
        console.log('Got FCM device token:', currentToken);
        new Notification('Title', { body: 'Message content' });
        const tokenRef = doc(this.firestore, 'fcmTokens', currentToken);
        await setDoc(tokenRef, { uid: this.auth.currentUser?.uid });

        // This will fire when a message is received while the app is in the foreground.
        // When the app is in the background, firebase-messaging-sw.js will receive the message instead.
        onMessage(this.messaging, (message) => {
          console.log(
            'New foreground notification from Firebase Messaging!',
            message.notification
          );
          console.log(
            'message',
            message
          );
          const notification = new Notification("Hi there!");
          console.log(
            'notification',
            notification
          );
          if (message.notification){
            const notificationTitle = message.notification.title!;
            const notificationOptions = {
              body: message.notification.body,
              icon: message.notification.icon // Optional: add an icon
            };
            Notification.requestPermission().then(permission => {
              console.log(
                'permission',
                permission
              );

              if(permission === "granted"){
                new Notification(notificationTitle, notificationOptions);
              }
            });
          }
        });
      } else {
        console.log('Failed to get FCM device token:', currentToken);
        // Need to request permissions to show notifications.
        this.requestNotificationsPermissions();
      }
    } catch(error) {
      console.error('Unable to get messaging token.', error);
    }
  }
}
