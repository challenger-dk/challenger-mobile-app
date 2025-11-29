import { useState } from 'react';
import { Platform } from 'react-native';

export const useDateTimePicker = (initialDate = new Date()) => {
  const [date, setDate] = useState<Date | null>(initialDate);
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState(initialDate);

  const open = () => {
    setTempDate(date || new Date());
    setShow(true);
  };

  const close = () => setShow(false);

  const confirm = () => {
    setDate(tempDate);
    close();
  };

  const onChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      close();
      if (event.type === 'set' && selectedDate) {
        setDate(selectedDate);
      }
    } else {
      if (selectedDate) setTempDate(selectedDate);
    }
  };

  return { date, show, open, close, confirm, onChange, tempDate };
};
