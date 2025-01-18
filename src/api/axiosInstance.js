import axios from 'axios';
import {functionError} from './errorHandler';

import {
  getAccessToken,
  getRefreshToken,
  setToken,
} from '../storage/tokenStorage';
import {getGlobalLogout} from '../context/AuthContext';
import {getGlobalShowAlert} from '../context/CustomAlertContext';

// 새로운 Access Token 요청 함수
const refreshAccessToken = async () => {
  const refreshToken = await getRefreshToken(); // Refresh Token 가져오기
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    // GET 요청으로 x-auth-token 헤더에 refreshToken 전달
    const response = await axios.get(
      'http://43.203.91.148:8080/api/auth/reissue-token',
      {
        headers: {
          'x-auth-token': refreshToken,
        },
      },
    );

    const newAccessToken = response.data.data.accessToken;
    const newRefreshToken = response.data.data.refreshToken;

    if (refreshToken === newRefreshToken) {
      await setToken(newAccessToken, refreshToken);
      console.log('리프레쉬 뉴리프레쉬 같음');
    } else {
      await setToken(newAccessToken, newRefreshToken);
      console.log('리프레쉬 뉴리프레쉬 다름');
    }
    return newAccessToken; // 새로운 Access Token 반환
  } catch (error) {
    throw error;
  }
};

// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: 'http://43.203.91.148:8080/api', // 공통 URL
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
      const token = await getAccessToken();
      if (token) {
        // 'x-auth-token' 헤더에 토큰 설정
        config.headers['x-auth-token'] = token;
      }
    } catch (error) {
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
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();
        originalRequest.headers['x-auth-token'] = newAccessToken;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh Token도 만료된 경우 로그아웃
        if (refreshError.response?.status === 401) {
          const {logout} = getGlobalLogout();
          const showAlert = getGlobalShowAlert();
          if (logout) {
            showAlert({
              title: '세션 만료',
              message: '다시 로그인해주세요.',
              onConfirm: async () => {
                try {
                  await logout(); // 로그아웃 비동기 호출
                } catch (error) {}
              },
            });
          }
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
