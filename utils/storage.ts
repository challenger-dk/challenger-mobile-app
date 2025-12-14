import { initializeApp } from 'firebase/app';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC_vYxzBtRJkV2w_QD0YC3oJMwzT4wYlpA",
  authDomain: "challenger-app-236fc.firebaseapp.com",
  projectId: "challenger-app-236fc",
  storageBucket: "challenger-app-236fc.firebasestorage.app",
  messagingSenderId: "380479685608",
  appId: "1:380479685608:web:732f43473e345792efda5d",
  measurementId: "G-1VV0V4PGH9"
};

// Initialize Firebase and get storage instance
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

/**
 * Uploads an image from a local URI to Firebase Storage
 * @param uri Local file URI (from ImagePicker)
 * @param userId Unique ID to namespace the file
 * @returns The public download URL of the uploaded image
 */
export const uploadProfilePicture = async (
  uri: string,
  userId?: string | number
): Promise<string> => {
  try {
    // 1. Fetch the file from the local URI
    const response = await fetch(uri);
    const blob = await response.blob();

    // 2. Create a file reference
    // Format: profile_pictures/<userId>_<timestamp>.jpg
    const filename = userId
      ? `profile_pictures/${userId}_${Date.now()}.jpg`
      : `profile_pictures/${Date.now()}.jpg`;

    const storageRef = ref(storage, filename);

    // 3. Upload the blob
    await uploadBytes(storageRef, blob);

    // 4. Get and return the download URL
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error uploading image to Firebase:', error);
    throw new Error('Kunne ikke uploade profilbillede');
  }
};

/**
 * Deletes a file from Firebase Storage
 * @param downloadUrl The public download URL of the file to delete
 */
export const deleteFile = async (downloadUrl: string): Promise<void> => {
  if (!downloadUrl) return;

  try {
    // Create a reference from the URL
    // Note: This only works if the URL is a standard Firebase Storage URL
    const fileRef = ref(storage, downloadUrl);
    await deleteObject(fileRef);
  } catch (error) {
    // We log but don't throw here, as failing to delete an old image
    // shouldn't block the user flow
    console.warn('Warning: Could not delete old file:', error);
  }
};
