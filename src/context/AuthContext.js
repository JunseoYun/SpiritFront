import React, {createContext, useState, useContext, useEffect} from 'react';
import {getAccessToken, setToken, removeToken} from '../storage/tokenStorage';
import {user_logout} from '../api/userApi';

const AuthContext = createContext();
import {getMessaging, deleteToken} from '@react-native-firebase/messaging';

import {showMarketingConsentAlert} from '../hooks/notification/useNotificationPermission';
let globalAuth = {
  logout: async () => {}, // 기본값으로 빈 함수 할당
};

export const AuthProvider = ({children}) => {
  const [token, setTokenState] = useState(null);
  // 처음 렌더링 시 토큰을 가져와 상태를 업데이트
  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await getAccessToken();
      if (storedToken) {
        setTokenState(storedToken); // 토큰이 있으면 상태에 저장
      }
    };
    fetchToken();
  }, []);

  // 로그인 처리
  const loginauth = async (
    accessToken,
    refreshToken,
    marketingNotification,
  ) => {
    await setToken(accessToken, refreshToken); // AsyncStorage에 토큰 저장

    if (marketingNotification === null) {
      await showMarketingConsentAlert();
    }

    setTokenState(accessToken, refreshToken); // 상태 업데이트
  };

  // 로그아웃 처리
  const logout = async index => {
    if (index === 1) {
      try {
        await removeToken(); // 토큰 제거
        setTokenState(null); // 상태 초기화
        await deleteToken(getMessaging());
      } catch (error) {
        // 로그아웃 요청 실패 시도 무시하고 계속 진행
        console.warn('user_logout 실패:', error.message);
      }
    } else {
      try {
        await user_logout(); // 실패하더라도
        await removeToken(); // 토큰 제거
        setTokenState(null); // 상태 초기화
        await deleteToken(getMessaging());
      } catch (error) {
        if (error.response.data.code === 21002) {
          await removeToken(); // 토큰 제거
          setTokenState(null); // 상태 초기화
          await deleteToken(getMessaging());
        }
      }
    }
  };

  globalAuth.logout = logout;

  return (
    <AuthContext.Provider value={{token, loginauth, logout}}>
      {children}
    </AuthContext.Provider>
  );
};
export const getGlobalLogout = () => globalAuth;
// AuthContext를 사용할 수 있게 해주는 custom hook
export const useAuth = () => useContext(AuthContext);
