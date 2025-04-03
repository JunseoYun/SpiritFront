import React, {createContext, useContext, useState} from 'react';
import Toastmessage from '../hooks/Toastmessage'; // 네가 만든 Toastmessage 컴포넌트 불러오기

const ToastContext = createContext(); // Context 생성

export const ToastProvider = ({children}) => {
  const [toastMessage, setToastMessage] = useState(null);

  const [position, setPosition] = useState(null);
  const [isShowToast, setIsShowToast] = useState(false);

  // 토스트 메시지를 보여주는 함수
  const showToast = (message, position) => {
    setToastMessage(message);
    setPosition(position);
    setIsShowToast(true);
  };

  return (
    <ToastContext.Provider value={{showToast}}>
      {children}
      {/* Toastmessage를 전역으로 렌더링 */}
      <Toastmessage
        message={toastMessage}
        isShowToast={isShowToast}
        onDismiss={() => setIsShowToast(false)}
        position={position}
      />
    </ToastContext.Provider>
  );
};

// 전역적으로 `showToast`를 사용할 수 있도록 하는 커스텀 훅
export const useToast = () => useContext(ToastContext);
