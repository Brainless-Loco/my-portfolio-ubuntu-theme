import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../firebase';

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: Date | null;
};

export type NewContactMessage = Omit<ContactMessage, 'id' | 'createdAt'>;

export async function saveContactMessage(message: NewContactMessage): Promise<void> {
  if (!isFirebaseConfigured) {
    throw new Error('Contact messages are unavailable because Firebase is not configured.');
  }

  await addDoc(collection(db, 'contactMessages'), {
    ...message,
    createdAt: serverTimestamp(),
  });
}

export function subscribeToContactMessages(
  onMessages: (messages: ContactMessage[]) => void,
  onError: (error: Error) => void,
): () => void {
  if (!isFirebaseConfigured) {
    onError(new Error('Firebase is not configured. Contact messages cannot be loaded.'));
    return () => undefined;
  }

  const messagesQuery = query(
    collection(db, 'contactMessages'),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(messagesQuery, (snapshot) => {
    onMessages(snapshot.docs.map((messageDoc) => {
      const data = messageDoc.data();
      return {
        id: messageDoc.id,
        name: typeof data.name === 'string' ? data.name : '',
        email: typeof data.email === 'string' ? data.email : '',
        message: typeof data.message === 'string' ? data.message : '',
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
      };
    }));
  }, onError);
}
