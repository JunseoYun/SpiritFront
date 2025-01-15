import { Alert } from 'react-native';

const useAlert = () => {
  const showAlert = (title, message, onConfirm, onCancel, type = 'confirm') => {
    let buttons = [];

    if (type === 'confirm') {
      buttons = [
        {
          text: '취소',
          style: 'cancel',
          onPress: onCancel,
        },
        {
          text: '확인',
          style: 'cancel',
          onPress: onConfirm,
        },
      ];
    } else if (type === 'delete') {
      buttons = [
        {
          text: '취소',
          style: 'cancel',
          onPress: onCancel,
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: onConfirm,
        },
      ];
    } else if (type === 'ok') {
      buttons = [
        {
          text: '확인',
          style: 'default',
          onPress: onConfirm,
        },
      ];
    }

    Alert.alert(title, message, buttons, { cancelable: true });
  };

  return { showAlert };
};

export default useAlert;
