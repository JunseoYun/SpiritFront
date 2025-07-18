import React, {createContext, useContext, useState} from 'react';
import Toastmessage from '../hooks/Toastmessage';

const ToastContext = createContext();

let globalShowToast = null; // ✅ 전역 변수 선언

export const ToastProvider = ({children}) => {
  const [toastMessage, setToastMessage] = useState(null);
  const [position, setPosition] = useState(null);
  const [isShowToast, setIsShowToast] = useState(false);

  // ✅ 전역에서도 사용 가능한 함수
  const showToast = (message, position) => {
    setToastMessage(message);
    setPosition(position);
    setIsShowToast(true);
  };

  globalShowToast = showToast; // ✅ 전역에 저장

  return (
    <ToastContext.Provider value={{showToast}}>
      {children}
      <Toastmessage
        message={toastMessage}
        isShowToast={isShowToast}
        onDismiss={() => setIsShowToast(false)}
        position={position}
      />
    </ToastContext.Provider>
  );
};

// ✅ 기존 방식 유지 (컴포넌트 내에서 사용할 경우)
export const useToast = () => useContext(ToastContext);

// ✅ 전역에서 접근 가능하도록 함수 추가
export const getGlobalShowToast = () => globalShowToast;
