import Toast from 'react-native-toast-message';

/**
 * Shows a success toast notification
 */
export const showSuccessToast = (message: string, title: string = 'Succes') => {
  Toast.show({
    type: 'success',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 3000,
  });
};

/**
 * Shows an error toast notification
 */
export const showErrorToast = (message: string, title: string = 'Fejl') => {
  Toast.show({
    type: 'error',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 4000,
  });
};

/**
 * Shows an info toast notification
 */
export const showInfoToast = (message: string, title: string = 'Info') => {
  Toast.show({
    type: 'info',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 3000,
  });
};

