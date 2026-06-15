import {BackHandler} from 'react-native';
import {
  getGlobalShowAlert,
  getNetworkErrorShown,
  setNetworkErrorShown,
} from '../context/CustomAlertContext';

export const functionError = error => {
  const showAlert = getGlobalShowAlert();
  if (error.response) {
    const {status, data, headers} = error.response;

    if (status === 500) {
      alert('서버에 문제가 발생했습니다. \n잠시 후 다시 시도해주세요.');
    } else if (status === 401) {
    } else if (status === 404) {
    } else {
    }
  } else if (error.request) {
    if (!getNetworkErrorShown()) {
      setNetworkErrorShown(true); // 에러 발생 상태로 설정
      showAlert({
        title: '네트워크에러',
        message: '인터넷 연결을 확인해 주세요.',
        onConfirm: () => {
          setNetworkErrorShown(false); // 에러 상태 초기화
          BackHandler.exitApp();
        },
      });
    }
  } else {
  }

  throw error; // 에러를 다시 던져서 호출한 쪽에서 추가 처리를 할 수 있게 함
};
