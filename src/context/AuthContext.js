import React, {createContext, useState, useContext, useEffect} from 'react';
import {getAccessToken, setToken, removeToken} from '../storage/tokenStorage';
const AuthContext = createContext();

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
  const loginauth = async (accessToken, refreshToken) => {
    await setToken(accessToken, refreshToken); // AsyncStorage에 토큰 저장
    setTokenState(accessToken, refreshToken); // 상태 업데이트
  };

  // 로그아웃 처리
  const logout = async () => {
    await removeToken(); // AsyncStorage에서 토큰 삭제
    setTokenState(null); // 상태 초기화
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
