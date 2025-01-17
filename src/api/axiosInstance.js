import axios from 'axios';
import {functionError} from './errorHandler';

import {
  getAccessToken,
  getRefreshToken,
  setToken,
} from '../storage/tokenStorage';

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

    console.log('뉴엑세스리프레시토큰리스폰', response.data);
    // 새로운 Access Token 및 Refresh Token 저장
    const newAccessToken = response.data.data.accessToken;
    const newRefreshToken = response.data.data.refreshToken;

    await setToken(newAccessToken, newRefreshToken);
    console.log('뉴엑세스리프레시토큰', newAccessToken, newRefreshToken);
    return newAccessToken; // 새로운 Access Token 반환
  } catch (error) {
    console.error('Error refreshing token:', error);
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
// 응답 인터셉터 설정
axiosInstance.interceptors.response.use(
  response => response, // 성공 응답은 그대로 반환
  async error => {
    const originalRequest = error.config; // 원래 요청 객체
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 무한 재시도 방지

      try {
        // Refresh Token으로 Access Token 갱신
        const newAccessToken = await refreshAccessToken();

        // 새 토큰으로 헤더 업데이트
        originalRequest.headers['x-auth-token'] = newAccessToken;

        // 갱신된 토큰으로 요청 재시도
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error); // 다른 에러는 그대로 반환
  },
);

export default axiosInstance;
