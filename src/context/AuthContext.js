import React, {createContext, useState, useContext, useEffect} from 'react';
import {getAccessToken, setToken, removeToken} from '../storage/tokenStorage';
import {user_logout} from '../api/userApi';
import {getMessaging, deleteToken} from '@react-native-firebase/messaging';
import {showMarketingConsentAlert} from '../hooks/notification/useNotificationPermission';
import {resetTo} from '../navigation/NavigationService';

const AuthContext = createContext();

let globalAuth = {
  logout: async () => {}, // 기본값으로 빈 함수 할당
};
let globalToken = null; // ✅ 최신 토큰 전역 저장용

let isLoggingOut = false;

export const AuthProvider = ({children}) => {
  const [token, setTokenState] = useState(null);
  // 처음 렌더링 시 토큰을 가져와 상태를 업데이트

  // 앱 처음 실행 시 AsyncStorage에서 토큰 로드
  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await getAccessToken();
      if (storedToken) {
        setTokenState(storedToken); // 토큰이 있으면 상태에 저장
        globalToken = storedToken; // ✅ 전역 저장
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

    globalToken = accessToken; // ✅ 전역 토큰 업데이트
    isLoggingOut = false;
  };

  // 로그아웃 처리
  const logout = async index => {
    isLoggingOut = true;
    if (index === 1) {
      try {
        await removeToken(); // 토큰 제거
        setTokenState(null); // 상태 초기화
        globalToken = null; // ✅ 전역 초기화
        await deleteToken(getMessaging());
      } catch (error) {
      }
    } else {
      try {
        await user_logout(); // 실패하더라도
        await removeToken(); // 토큰 제거
        setTokenState(null); // 상태 초기화
        globalToken = null;
        await deleteToken(getMessaging());
      } catch (error) {
        if (error.response.data.code === 21002) {
          await removeToken(); // 토큰 제거
          setTokenState(null); // 상태 초기화
          globalToken = null;
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

// ✅ 외부에서 최신 토큰을 참조하기 위한 함수
export const getGlobalToken = () => globalToken;

export const getisLoggingOut = () => isLoggingOut;
export const setIsLoggingOut = value => {
  isLoggingOut = value;
};
// ✅ 기존 로그아웃 접근 함수
export const getGlobalLogout = () => globalAuth;

// ✅ AuthContext를 사용할 수 있게 해주는 커스텀 훅
export const useAuth = () => useContext(AuthContext);
