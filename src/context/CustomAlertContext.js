import React, {createContext} from 'react';
import useCustomAlert from '../hooks/useCustomAlert';

let globalShowAlert = null; // 전역 변수

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
