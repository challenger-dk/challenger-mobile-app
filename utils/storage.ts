import {storage} from '@/firebase';
import {getDownloadURL, ref, uploadBytes} from 'firebase/storage';

/**
 * Uploads an image from a local URI to Firebase Storage
 * @param uri Local file URI (from ImagePicker)
 * @param userId Unique ID to namespace the file (optional, or use a timestamp/random string)
 * @returns The public download URL of the uploaded image
 */
export const uploadProfilePicture = async (uri: string, userId?: string | number): Promise<string> => {
  try {
    // 1. Convert URI to Blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // 2. Create a reference
    // Generate a unique filename: profile_{timestamp}.jpg or profile_{userId}_{timestamp}.jpg
    const filename = userId
      ? `profile_pictures/${userId}_${Date.now()}.jpg`
      : `profile_pictures/${Date.now()}.jpg`;

    const storageRef = ref(storage, filename);

    // 3. Upload
    await uploadBytes(storageRef, blob);

    // 4. Get Download URL
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error uploading image to Firebase:', error);
    throw new Error('Kunne ikke uploade profilbillede');
  }
};
