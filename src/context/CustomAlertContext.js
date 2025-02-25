import React, {createContext} from 'react';
import useCustomAlert from '../hooks/useCustomAlert';

let globalShowAlert = null; // 전역 알림 함수
let isNetworkErrorShown = false; // 네트워크 에러 중복 방지용 전역 상태 변수

export const CustomAlertProvider = ({children}) => {
  const {showAlert, AlertComponent} = useCustomAlert();

  globalShowAlert = showAlert; // 전역 변수에 저장

  return (
    <>
      {children}
      <AlertComponent />
    </>
  );
};

export const getGlobalShowAlert = () => globalShowAlert; // 전역에서 showAlert 접근
export const getNetworkErrorShown = () => isNetworkErrorShown; // 상태 확인 함수
export const setNetworkErrorShown = value => {
  isNetworkErrorShown = value; // 상태 업데이트
};
