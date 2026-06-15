import axios from 'axios';
import {functionError} from './errorHandler';
import Config from 'react-native-config';
import {log_access_create} from './userApi';

import {
  getAccessToken,
  getRefreshToken,
  setToken,
} from '../storage/tokenStorage';
import {
  getGlobalLogout,
  setIsLoggingOut,
  getisLoggingOut,
} from '../context/AuthContext';
import {getGlobalShowAlert} from '../context/CustomAlertContext';
import {resetTo} from '../navigation/NavigationService';

// 새로운 Access Token 요청 함수
const refreshAccessToken = async () => {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.get(
      `https://${Config.AUTH_URL}/api/auth/reissue-token`,
      {
        headers: {'x-auth-token': refreshToken},
      },
    );
    const newAccessToken = response.data.data.accessToken;
    const newRefreshToken = response.data.data.refreshToken;

    if (refreshToken === newRefreshToken) {
      await setToken(newAccessToken, refreshToken);
    } else {
      await setToken(newAccessToken, newRefreshToken);
    }

    await log_access_create();
    return newAccessToken;
  } catch (error) {
    if (error?.response?.data?.code === 21002 && !getisLoggingOut()) {
      setIsLoggingOut(true);
      resetTo('OAuthStack', 'OAuthLoginScreen');
    }
    throw error;
  }
};

// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: `https://${Config.BASE_URL}/api`, // 공통 URL

  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 10초 타임아웃
});

export const userAxiosInstance = axios.create({
  baseURL: `https://${Config.AUTH_URL}/api`, // 공통 URL

  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 10초 타임아웃
});

// 요청 인터셉터 설정
axiosInstance.interceptors.request.use(
  async config => {
    try {
      // AsyncStorage에서 토큰 가져오기
      if (config.auth === false) {
        return config;
      }
      const token = await getAccessToken();
      if (token) {
        // 'x-auth-token' 헤더에 토큰 설정

        config.headers['x-auth-token'] = token;
      }
    } catch (error) {
      console.log(error, 'axiosInstanceerror');
      functionError(error); // 에러 처리
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

userAxiosInstance.interceptors.request.use(
  async config => {
    try {
      // AsyncStorage에서 토큰 가져오기
      if (config.auth === false) {
        return config;
      }
      const token = await getAccessToken();
      if (token) {
        // 'x-auth-token' 헤더에 토큰 설정

        config.headers['x-auth-token'] = token;
      }
    } catch (error) {
      console.log(error, 'useraxioserror');
      functionError(error); // 에러 처리
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  response => response, // 성공 응답은 그대로 반환
  async error => {
    const originalRequest = error.config;

    // Access Token이 만료된 경우 처리
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.auth !== false
    ) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();
        originalRequest.headers['x-auth-token'] = newAccessToken;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh Token도 만료된 경우 로그아웃

        const {logout} = getGlobalLogout();
        const showAlert = getGlobalShowAlert();

        if (logout) {
          try {
            console.log(refreshError, 'axiosInstancerefreshError');
            await logout(1); // 로그아웃 먼저 실행
          } catch (error) {}
        }
      }
    } else if (error.response?.status === 404 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();
        originalRequest.headers['x-auth-token'] = newAccessToken;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        const {logout} = getGlobalLogout();
        const showAlert = getGlobalShowAlert();

        if (logout) {
          try {
            await logout(1); // 로그아웃 먼저 실행
          } catch (error) {}
        }
      }
    }

    return Promise.reject(error);
  },
);

userAxiosInstance.interceptors.response.use(
  response => response, // 성공 응답은 그대로 반환
  async error => {
    const originalRequest = error.config;

    // Access Token이 만료된 경우 처리
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.auth !== false
    ) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();
        originalRequest.headers['x-auth-token'] = newAccessToken;

        return userAxiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh Token도 만료된 경우 로그아웃

        const {logout} = getGlobalLogout();
        const showAlert = getGlobalShowAlert();

        if (logout) {
          try {
            console.log(refreshError, 'userAxiosInstancerefreshError');
            await logout(1); // 로그아웃 먼저 실행
          } catch (error) {}
        }
      }
    } else if (error.response?.status === 404 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();
        originalRequest.headers['x-auth-token'] = newAccessToken;

        return userAxiosInstance(originalRequest);
      } catch (refreshError) {
        const {logout} = getGlobalLogout();
        const showAlert = getGlobalShowAlert();

        if (logout) {
          try {
            await logout(1); // 로그아웃 먼저 실행
          } catch (error) {}
        }
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
